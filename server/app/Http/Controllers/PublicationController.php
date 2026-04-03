<?php

namespace App\Http\Controllers;

use App\Models\Publication;
use App\Models\PublicationView;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Auth;
use Intervention\Image\Laravel\Facades\Image; 
use App\Http\Controllers\Traits\FormatsPublications;
use App\Http\Requests\StorePublicationRequest;

class PublicationController extends Controller
{
    use FormatsPublications;


    public function index(Request $request)
    {
        $user = Auth::guard('sanctum')->user();
        
        $query = Publication::withoutGlobalScopes(); 

        if ($user) {
            if ($user->isAdmin() || $user->isDirector()) {
                $query->orderByRaw("FIELD(status, 'submitted', 'reviewed', 'approved', 'draft', 'returned', 'published') ASC");
                $query->orderBy('created_at', 'desc');
            
            } elseif ($user->isEditorInChief()) {
                $query->where(function($q) use ($user) {
                    $q->whereIn('status', ['reviewed', 'approved', 'published'])
                      ->orWhere('user_id', $user->id); 
                });
                $query->orderByRaw("FIELD(status, 'reviewed', 'approved', 'submitted', 'draft', 'returned', 'published') ASC");
                $query->orderBy('created_at', 'desc');

            } elseif ($user->isAssociateEditor()) {
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

        return response()->json($publications);
    }

    public function show(Publication $publication, Request $request)
    {
        $user = Auth::guard('sanctum')->user();
        
        $isAdmin = $user && $user->isAdmin();
        $isManagement = $user && $user->isEditorial();

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

    public function store(StorePublicationRequest $request)
    {
        $currentUser = $request->user();

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
            'status' => $request->boolean('save_as_draft') ? 'draft' : 'submitted',
            'views' => 0,
            'date_published' => $request->date_published, 
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

        Cache::forget('admin_dashboard_lists');
        AuditLog::record('Created Publication', "Title: {$publication->title}");

        return response()->json($this->formatPublication($publication), 201);
    }

    public function update(Request $request, Publication $publication)
    {
        $user = Auth::guard('sanctum')->user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);
        
        $isAuthor = $user->id === $publication->user_id;
        $isAdmin = $user->isAdmin();
        $isManagement = $user->isEditorial();

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
        Cache::forget('admin_dashboard_lists');

        return response()->json($this->formatPublication($publication));
    }

    public function updateStatus(Request $request, $id)
    {
        $user = Auth::guard('sanctum')->user();
        $publication = Publication::withoutGlobalScopes()->findOrFail($id); 
        $action = $request->input('action'); 
        if ($action === 'submit') {
            $publication->status = 'submitted';
            $publication->save();
            Cache::forget('admin_dashboard_lists');
            return response()->json(['message' => 'Article submitted for review.', 'data' => $publication]);
        }

        if ($action === 'review') {
            if (!$user->isAdmin() && !$user->isAssociateEditor() && !$user->isEditorInChief()) {
                return response()->json(['error' => 'Unauthorized. Only Associate Editors can review.'], 403);
            }
            
            $publication->status = 'reviewed';
            $publication->reviewed_by = $user->id; 
            $publication->reviewed_at = now();      
            $publication->save();
            Cache::forget('admin_dashboard_lists');
            return response()->json(['message' => 'Article reviewed. Sent to EIC.', 'data' => $publication]);
        }

        if ($action === 'approve') {
            if (!$user->isAdmin() && !$user->isEditorInChief()) {
                return response()->json(['error' => 'Unauthorized. Only the EIC can approve.'], 403);
            }

            if ($publication->status !== 'reviewed' && !$user->isAdmin()) {
                return response()->json(['error' => 'Article must be reviewed by an Associate Editor first.'], 422);
            }

            $publication->status = 'approved';
            $publication->approved_by = $user->id; 
            $publication->approved_at = now();      
            $publication->save();
            Cache::forget('admin_dashboard_lists');
            return response()->json(['message' => 'Article approved. Ready to Publish.', 'data' => $publication]);
        }

        if ($action === 'publish') {
            if (!$user->isAdmin() && !$user->isEditorInChief()) {
                return response()->json(['error' => 'Unauthorized.'], 403);
            }

            if ($publication->status !== 'approved' && !$user->isAdmin()) {
                return response()->json(['error' => 'Article must be approved first.'], 422);
            }

            $publication->status = 'published';
            $publication->date_published = $publication->date_published ?? now();
            $publication->save();
            
            Cache::forget('news_hub_data');
            Cache::forget('homepage_content');
            Cache::forget('admin_dashboard_lists');
            
            return response()->json(['message' => 'Article is live on the website!', 'data' => $publication]);
        }

        if ($action === 'return') {
            if (!$user->isEditorial()) {
                 return response()->json(['error' => 'Unauthorized'], 403);
            }
            
            $publication->status = 'returned';
            $publication->save();
            Cache::forget('admin_dashboard_lists');
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
        Cache::forget('admin_dashboard_lists');

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