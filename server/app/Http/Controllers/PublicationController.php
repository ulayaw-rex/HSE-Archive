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
use Illuminate\Support\Facades\Log;
use Intervention\Image\Laravel\Facades\Image; 

class PublicationController extends Controller
{
    /**
     * Helper to format image URLs consistently.
     */
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

    /**
     * Display a listing of publications based on user role.
     */
    public function index(Request $request)
    {
        // 1. Authenticate User via Sanctum Cookies
        $user = Auth::guard('sanctum')->user();
        
        // 2. Start Query - CRITICAL: 'withoutGlobalScopes' is mandatory to see drafts/submitted
        $query = Publication::withoutGlobalScopes(); 

        // 3. Apply Filters Based on Role
        if ($user) {
            // --- LOGGED IN USER ---
            $isAdmin = $user->role === 'admin';
            $pos = strtolower($user->position ?? '');
            $isManagement = str_contains($pos, 'editor') || str_contains($pos, 'director');

            if ($isAdmin || $isManagement) {
                // ✅ MANAGEMENT VIEW: See EVERYTHING
                // Sort pending items to the top for review
                $query->orderByRaw("FIELD(status, 'submitted', 'reviewed', 'approved', 'draft', 'returned', 'published') ASC");
            } else {
                // ✅ REGULAR USER VIEW: See Published + OWN Items (Workbrench)
                $query->where(function($q) use ($user) {
                    $q->where('status', 'published')
                      ->orWhere('user_id', $user->id); // Explicitly show own items
                });
                $query->orderBy('created_at', 'desc');
            }

        } else {
            // --- GUEST VIEW (Not Logged In) ---
            $query->where('status', 'published')
                  ->orderBy('created_at', 'desc');
        }

        // 4. Execute Query with Pagination
        $publications = $query->with('writers')
            ->paginate($request->input('per_page', 10));

        // 5. Format Images
        $publications->through(function ($publication) {
            return $this->formatPublication($publication);
        });

        // 6. Return Response
        return response()->json($publications)
            ->header('X-Debug-Auth', $user ? "User: {$user->id}" : "Guest");
    }

    /**
     * Display the specified resource.
     */
    public function show(Publication $publication, Request $request)
    {
        $user = Auth::guard('sanctum')->user();
        
        $isAdmin = $user && $user->role === 'admin';
        
        // Flexible Management Check
        $isManagement = false;
        if ($user && !empty($user->position)) {
             $pos = strtolower($user->position);
             if (str_contains($pos, 'editor') || str_contains($pos, 'director')) {
                 $isManagement = true;
             }
        }

        $isWriter = $user && ($publication->user_id === $user->id || $publication->writers->contains($user->id));

        // Visibility Check
        if ($publication->status !== 'published') {
             if (!$isAdmin && !$isManagement && !$isWriter) {
                 return response()->json(['message' => 'This article is not published yet.'], 403);
             }
        }

        // View Counting Logic (Throttle by IP)
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

    /**
     * Store a newly created resource in storage.
     */
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

        // Generate default byline if not provided
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
            'status' => 'submitted', // Default status on create
            'views' => 0,
            'date_published' => null, 
        ];

        // Handle Image Upload
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

    /**
     * Update the specified resource in storage.
     */
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

        // Lock editing if status is advanced (unless Management or Admin)
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
            // Delete old images
            if ($publication->image_path) Storage::disk('public')->delete($publication->image_path);
            if ($publication->thumbnail_path) Storage::disk('public')->delete($publication->thumbnail_path);

            // Upload new
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
        
        // Auto-reset status if returning from 'returned'
        if ($publication->status === 'returned') {
            $publication->status = 'submitted';
            $publication->save();
        }

        $publication->load('writers');
        Cache::forget('news_hub_data');
        Cache::forget('homepage_content');

        return response()->json($this->formatPublication($publication));
    }

    /**
     * Handle Workflow Status Transitions (Submit -> Review -> Approve -> Publish)
     */
    public function updateStatus(Request $request, $id)
    {
        $user = Auth::guard('sanctum')->user();
        $publication = Publication::findOrFail($id);
        $action = $request->input('action'); 
        $userPos = strtolower($user->position ?? '');

        // 1. SUBMIT
        if ($action === 'submit') {
            if (in_array($publication->status, ['draft', 'returned'])) {
                $publication->status = 'submitted';
                $publication->save();
                return response()->json(['message' => 'Article submitted for review.', 'data' => $publication]);
            }
        }

        // 2. CANCEL SUBMISSION
        if ($action === 'cancel') {
            if ($publication->user_id === $user->id && $publication->status === 'submitted') {
                $publication->status = 'draft';
                $publication->save();
                return response()->json(['message' => 'Submission cancelled. Article is now a draft.', 'data' => $publication]);
            }
        }

        // 3. REVIEW (Associate Editor)
        if ($action === 'review') {
            if (!str_contains($userPos, 'associate editor')) {
                return response()->json(['error' => 'Unauthorized. Only Associate Editors can review.'], 403);
            }
            
            if ($publication->status === 'submitted') {
                $publication->status = 'reviewed';
                $publication->reviewed_by = $user->id; 
                $publication->reviewed_at = now();      
                $publication->save();
                return response()->json(['message' => 'Article reviewed. Forwarded to EIC.', 'data' => $publication]);
            }
        }

        // 4. APPROVE (Editor-in-Chief)
        if ($action === 'approve') {
            if (!str_contains($userPos, 'editor-in-chief')) {
                return response()->json(['error' => 'Unauthorized. Only the EIC can approve.'], 403);
            }

            if ($publication->status === 'reviewed') {
                $publication->status = 'approved';
                $publication->approved_by = $user->id; 
                $publication->approved_at = now();      
                $publication->save();
                return response()->json(['message' => 'Article approved. Ready for posting.', 'data' => $publication]);
            } else {
                return response()->json(['error' => 'Article must be reviewed by an Associate Editor first.'], 422);
            }
        }

        // 5. PUBLISH (EIC or Admin)
        if ($action === 'publish') {
            $isEIC = str_contains($userPos, 'editor-in-chief');
            $isAdmin = $user->role === 'admin';

            if (!$isEIC && !$isAdmin) {
                return response()->json(['error' => 'Unauthorized.'], 403);
            }

            if ($publication->status !== 'approved') {
                return response()->json(['error' => 'Article must be approved by EIC before posting.'], 422);
            }

            $publication->status = 'published';
            $publication->date_published = now();
            $publication->save();
            
            Cache::forget('news_hub_data');
            Cache::forget('homepage_content');
            
            return response()->json(['message' => 'Article is live on the website!', 'data' => $publication]);
        }

        // 6. RETURN (Management Only)
        if ($action === 'return') {
            $isManagement = str_contains($userPos, 'editor') || str_contains($userPos, 'director');
            
            if (!$isManagement) {
                 return response()->json(['error' => 'Unauthorized'], 403);
            }
            
            $publication->status = 'returned';
            $publication->save();
            return response()->json(['message' => 'Article returned to author for revision.', 'data' => $publication]);
        }

        return response()->json(['error' => 'Invalid action or status transition.'], 400);
    }

    /**
     * Remove the specified resource from storage.
     */
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

    // --- PUBLIC HELPER METHODS ---

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