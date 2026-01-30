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
use Illuminate\Support\Facades\Auth;
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
        $user = Auth::guard('sanctum')->user();
        
        $query = Publication::withoutGlobalScopes(); 

        if ($user) {
            $isAdmin = $user->role === 'admin';
            $pos = strtolower($user->position ?? '');
            
            $isEIC = str_contains($pos, 'chief');
            $isAssociate = str_contains($pos, 'associate');
            $isDirector = str_contains($pos, 'director');

            if ($isAdmin || $isDirector) {
                $query->orderByRaw("FIELD(status, 'submitted', 'reviewed', 'approved', 'draft', 'returned', 'published') ASC");
                $query->orderBy('created_at', 'desc');
            
            } elseif ($isEIC) {
                $query->where(function($q) use ($user) {
                    $q->whereIn('status', ['reviewed', 'approved', 'published'])
                      ->orWhere('user_id', $user->id); 
                });
                $query->orderByRaw("FIELD(status, 'reviewed', 'approved', 'submitted', 'draft', 'returned', 'published') ASC");
                $query->orderBy('created_at', 'desc');

            } elseif ($isAssociate) {
                $query->where(function($q) use ($user) {
                    $q->whereIn('status', ['submitted', 'reviewed', 'published'])
                      ->orWhere('user_id', $user->id);
                });
                $query->orderByRaw("FIELD(status, 'submitted', 'reviewed', 'approved', 'draft', 'returned', 'published') ASC");
                $query->orderBy('created_at', 'desc');

            } else {
                $query->where(function($q) use ($user) {
                    $q->where('status', 'published')
                      ->orWhere('user_id', $user->id); 
                });
                
                $query->orderByRaw('COALESCE(date_published, created_at) DESC');
            }

        } else {
            $query->where('status', 'published');
            
            $query->orderBy('date_published', 'desc');
        }

        $publications = $query->with('writers')
            ->paginate($request->input('per_page', 10));

        $publications->through(function ($publication) {
            return $this->formatPublication($publication);
        });

        return response()->json($publications)
            ->header('X-Debug-Auth', $user ? "User: {$user->id}" : "Guest");
    }

    public function show(Publication $publication, Request $request)
    {
        $user = Auth::guard('sanctum')->user();
        
        $isAdmin = $user && $user->role === 'admin';
        $isManagement = false;
        
        if ($user && !empty($user->position)) {
             $pos = strtolower($user->position);
             if (str_contains($pos, 'editor') || str_contains($pos, 'director')) {
                 $isManagement = true;
             }
        }

        $isWriter = $user && ($publication->user_id === $user->id || $publication->writers->contains($user->id));

        if ($publication->status !== 'published') {
             if (!$isAdmin && !$isManagement && !$isWriter) {
                 return response()->json(['message' => 'This article is not published yet.'], 403);
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
        $currentUser = Auth::guard('sanctum')->user();
        if (!$currentUser) return response()->json(['message' => 'Unauthorized'], 401);

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
            'status' => 'submitted', 
            'views' => 0,
            'date_published' => null, 
        ];

        if ($request->hasFile('image')) {
            $imageFile = $request->file('image');
            $filename = time() . '_' . uniqid() . '.' . $imageFile->getClientOriginalExtension();
            $imageFile->storeAs('publications_images', $filename, 'public');
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

        AuditLog::record('Created Publication', "Title: {$publication->title}");

        return response()->json($this->formatPublication($publication), 201);
    }

    public function update(Request $request, Publication $publication)
    {
        $user = Auth::guard('sanctum')->user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);
        
        $isAuthor = $user->id === $publication->user_id;
        $isAdmin = $user->role === 'admin';
        
        $isManagement = false;
        if (!empty($user->position)) {
             $pos = strtolower($user->position);
             if (str_contains($pos, 'editor') || str_contains($pos, 'director')) {
                 $isManagement = true;
             }
        }

        $lockedStatuses = ['reviewed', 'approved', 'published'];
        if ($isAuthor && in_array($publication->status, $lockedStatuses) && !$isManagement && !$isAdmin) {
             return response()->json(['error' => 'Cannot edit article. Request a return/revision first.'], 403);
        }

        $data = $request->only(['title', 'body', 'category', 'photo_credits', 'date_published']);

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
            $imageFile->storeAs('publications_images', $filename, 'public');
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
        
        if ($publication->status === 'returned') {
            $publication->status = 'submitted';
            $publication->save();
        }

        $publication->load('writers');
        Cache::forget('news_hub_data');
        Cache::forget('homepage_content');

        return response()->json($this->formatPublication($publication));
    }

    public function updateStatus(Request $request, $id)
    {
        $user = Auth::guard('sanctum')->user();
        $publication = Publication::withoutGlobalScopes()->findOrFail($id); 
        $action = $request->input('action'); 
        $userPos = strtolower($user->position ?? '');
        $isAdmin = $user->role === 'admin';

        if ($action === 'submit') {
            $publication->status = 'submitted';
            $publication->save();
            return response()->json(['message' => 'Article submitted for review.', 'data' => $publication]);
        }

        if ($action === 'review') {
            if (!$isAdmin && !str_contains($userPos, 'associate') && !str_contains($userPos, 'chief')) {
                return response()->json(['error' => 'Unauthorized. Only Associate Editors can review.'], 403);
            }
            
            $publication->status = 'reviewed';
            $publication->reviewed_by = $user->id; 
            $publication->reviewed_at = now();      
            $publication->save();
            return response()->json(['message' => 'Article reviewed. Sent to EIC.', 'data' => $publication]);
        }

        if ($action === 'approve') {
            if (!$isAdmin && !str_contains($userPos, 'chief')) {
                return response()->json(['error' => 'Unauthorized. Only the EIC can approve.'], 403);
            }

            if ($publication->status !== 'reviewed' && !$isAdmin) {
                return response()->json(['error' => 'Article must be reviewed by an Associate Editor first.'], 422);
            }

            $publication->status = 'approved';
            $publication->approved_by = $user->id; 
            $publication->approved_at = now();      
            $publication->save();
            return response()->json(['message' => 'Article approved. Ready to Publish.', 'data' => $publication]);
        }

        if ($action === 'publish') {
            if (!$isAdmin && !str_contains($userPos, 'chief')) {
                return response()->json(['error' => 'Unauthorized.'], 403);
            }

            if ($publication->status !== 'approved' && !$isAdmin) {
                return response()->json(['error' => 'Article must be approved first.'], 422);
            }

            $publication->status = 'published';
            $publication->date_published = now();
            $publication->save();
            
            Cache::forget('news_hub_data');
            Cache::forget('homepage_content');
            
            return response()->json(['message' => 'Article is live on the website!', 'data' => $publication]);
        }

        if ($action === 'return') {
            $isManagement = $isAdmin || str_contains($userPos, 'editor') || str_contains($userPos, 'director');
            
            if (!$isManagement) {
                 return response()->json(['error' => 'Unauthorized'], 403);
            }
            
            $publication->status = 'returned';
            $publication->save();
            return response()->json(['message' => 'Article returned for revision.', 'data' => $publication]);
        }

        return response()->json(['error' => 'Invalid action.'], 400);
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

    public function getByCategory($category)
    {
        $publications = Publication::withoutGlobalScopes()
            ->where('category', $category)
            ->where('status', 'published') 
            ->with('writers')
            ->orderBy('date_published', 'desc')
            ->get()
            ->map(fn($pub) => $this->formatPublication($pub));

        return response()->json($publications);
    }

    public function search(Request $request)
    {
        $query = $request->input('q');
        if (!$query) return response()->json([]);

        $publications = Publication::withoutGlobalScopes()
            ->where('status', 'published') 
            ->where(function($q) use ($query) {
                $q->where('title', 'LIKE', "%{$query}%")
                  ->orWhere('body', 'LIKE', "%{$query}%")
                  ->orWhere('byline', 'LIKE', "%{$query}%");
            })
            ->with('writers')
            ->orderBy('date_published', 'desc')
            ->get()
            ->map(fn($pub) => $this->formatPublication($pub));

        return response()->json($publications);
    }

    public function recent()
    {
        $publications = Publication::withoutGlobalScopes()
            ->where('status', 'published') 
            ->orderBy('date_published', 'desc')
            ->take(3)
            ->get()
            ->map(fn($pub) => $this->formatPublication($pub));

        return response()->json($publications);
    }
}