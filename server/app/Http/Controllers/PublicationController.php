<?php

namespace App\Http\Controllers;

use App\Models\Publication;
use App\Models\PublicationView;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;
use Intervention\Image\Laravel\Facades\Image; 

class PublicationController extends Controller
{

    private function formatPublication($publication)
    {
        $publication->image = $publication->image_path 
            ? asset('storage/' . $publication->image_path) 
            : null;

        $publication->thumbnail = $publication->thumbnail_path 
            ? asset('storage/' . $publication->thumbnail_path) 
            : $publication->image; 

        return $publication;
    }

    public function index(Request $request)
    {
        $user = $request->user('sanctum');
        $isAdmin = $user && (strtolower($user->role) === 'admin' || $user->tokenCan('role:admin'));

        $query = Publication::query();

        if (!$isAdmin) {
            $query->where('status', 'approved');
        }

        $publications = $query->with('writers')
            ->orderBy('date_published', 'desc')
            ->paginate(9);

        $publications->through(function ($publication) {
            return $this->formatPublication($publication);
        });

        return response()->json($publications);
    }

    public function show(Publication $publication, Request $request)
    {
        $user = $request->user('sanctum');
        $isAdmin = $user && ($user->role === 'admin' || $user->tokenCan('role:admin'));
        $isWriter = $user && $publication->writers->contains($user->id);

        if ($publication->status !== 'approved') {
             if (!$isAdmin && !$isWriter) {
                 return response()->json(['message' => 'This article is pending approval.'], 403);
             }
        }

        $hasViewedRecently = PublicationView::where('publication_id', $publication->publication_id)
            ->where('ip_address', $request->ip())
            ->where('created_at', '>=', now()->subMinutes(10))
            ->exists();

        if (!$hasViewedRecently) {
            PublicationView::create([
                'publication_id' => $publication->publication_id,
                'ip_address' => $request->ip(),
            ]);
            $publication->increment('views');
        }

        $publication->load('writers');
        
        return response()->json($this->formatPublication($publication));
    }

    public function store(Request $request)
    {
        $currentUser = $request->user();
        
        $status = ($currentUser->role === 'admin') ? 'approved' : 'submitted'; 

        $validator = Validator::make($request->all(), [
            'title' => 'required|string',
            'body' => 'required|string',
            'category' => 'required|string',
            'writer_ids' => 'required|array',
            'writer_ids.*' => 'exists:users,id',
            'image' => 'nullable|image|max:51200', 
            'byline' => 'nullable|string',
            'date_published' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $finalByline = $request->byline;
        if (empty($finalByline)) {
            $writers = User::whereIn('id', $request->writer_ids)->get();
            $finalByline = $writers->pluck('name')->join(' & ');
        }

        $data = [
            'user_id' => $currentUser->id,
            'title' => $request->title,
            'body' => $request->body,
            'category' => $request->category,
            'photo_credits' => $request->photo_credits,
            'byline' => $finalByline,
            'status' => $status,
            'views' => 0,
            'date_published' => $request->date_published ?? now(),
        ];

        if ($request->hasFile('image')) {
            $imageFile = $request->file('image');
            $filename = time() . '_' . uniqid() . '.' . $imageFile->getClientOriginalExtension();

            $path = $imageFile->storeAs('publications_images', $filename, 'public');
            $data['image_path'] = 'publications_images/' . $filename;

            try {
                $thumbnail = Image::read($imageFile)->scale(width: 600);
                $encoded = $thumbnail->toJpeg(80); 

                $thumbFilename = 'thumb_' . $filename;
                Storage::disk('public')->put('publications_images/' . $thumbFilename, $encoded);
                
                $data['thumbnail_path'] = 'publications_images/' . $thumbFilename;
            } catch (\Exception $e) {
                $data['thumbnail_path'] = $data['image_path'];
            }
        }

        $publication = Publication::create($data);
        $publication->writers()->attach($request->writer_ids);

        Cache::forget('news_hub_data'); 
        Cache::forget('homepage_content');

        AuditLog::record('Created Publication', "Title: {$publication->title}");

        return response()->json($this->formatPublication($publication), 201);
    }

    public function update(Request $request, Publication $publication)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'body' => 'required|string',
            'category' => 'required|string|max:100',
            'photo_credits' => 'nullable|string|max:255',
            'image' => 'nullable|image|max:51200', 
            'writer_ids' => 'sometimes|array',
            'writer_ids.*' => 'exists:users,id',
            'status' => 'in:pending,approved,rejected,submitted,forwarded,published', 
            'date_published' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only(['title', 'body', 'category', 'photo_credits', 'status', 'date_published']);

        if ($request->has('writer_ids')) {
            $publication->writers()->sync($request->writer_ids);
            if ($request->has('byline')) {
                $data['byline'] = $request->byline;
            }
        }

        if ($request->hasFile('image')) {
            if ($publication->image_path) Storage::disk('public')->delete($publication->image_path);
            if ($publication->thumbnail_path) Storage::disk('public')->delete($publication->thumbnail_path);

            $imageFile = $request->file('image');
            $filename = time() . '_' . uniqid() . '.' . $imageFile->getClientOriginalExtension();

            $path = $imageFile->storeAs('publications_images', $filename, 'public');
            $data['image_path'] = 'publications_images/' . $filename;

            try {
                $thumbnail = Image::read($imageFile)->scale(width: 600);
                $encoded = $thumbnail->toJpeg(80);

                $thumbFilename = 'thumb_' . $filename;
                Storage::disk('public')->put('publications_images/' . $thumbFilename, $encoded);
                
                $data['thumbnail_path'] = 'publications_images/' . $thumbFilename;
            } catch (\Exception $e) {
                $data['thumbnail_path'] = $data['image_path'];
            }
        }

        $publication->update($data);
        $publication->load('writers');

        Cache::forget('news_hub_data');
        Cache::forget('homepage_content');

        return response()->json($this->formatPublication($publication));
    }

    public function destroy(Publication $publication)
    {
        if ($publication->image_path) Storage::disk('public')->delete($publication->image_path);
        if ($publication->thumbnail_path) Storage::disk('public')->delete($publication->thumbnail_path);

        $publication->delete();
        
        Cache::forget('news_hub_data');
        Cache::forget('homepage_content');

        AuditLog::record('Deleted Publication', "Deleted article: {$publication->title}");
        
        return response()->json(['message' => 'Publication deleted successfully']);
    }

    public function review(Request $request, $id)
    {
        $publication = Publication::findOrFail($id);

        $request->validate([
            'status' => 'required|string'
        ]);

        $publication->update(['status' => $request->status]);
        
        Cache::forget('news_hub_data');
        Cache::forget('homepage_content');

        return response()->json([
            'message' => 'Article status updated successfully',
            'data' => $publication
        ]);
    }


    public function getByCategory($category)
    {
        $publications = Publication::where('category', $category)
            ->where('status', 'approved')
            ->with('writers')
            ->orderBy('date_published', 'desc')
            ->get()
            ->map(function ($publication) {
                return $this->formatPublication($publication);
            });

        return response()->json($publications);
    }

    public function search(Request $request)
    {
        $query = $request->input('q');
        if (!$query) return response()->json([]);

        $publications = Publication::where('status', 'approved')
            ->where(function($q) use ($query) {
                $q->where('title', 'LIKE', "%{$query}%")
                  ->orWhere('body', 'LIKE', "%{$query}%")
                  ->orWhere('byline', 'LIKE', "%{$query}%");
            })
            ->with('writers')
            ->orderBy('date_published', 'desc')
            ->get()
            ->map(function ($publication) {
                return $this->formatPublication($publication);
            });

        return response()->json($publications);
    }

    public function recent()
    {
        $publications = Publication::where('status', 'approved')
            ->orderBy('date_published', 'desc')
            ->take(3)
            ->get()
            ->map(function ($publication) {
                return $this->formatPublication($publication);
            });

        return response()->json($publications);
    }
}