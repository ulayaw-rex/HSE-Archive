<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Publication;
use App\Models\PrintMedia; 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserProfileController extends Controller
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

    private function formatPrintMedia($media)
    {
        return [
            'print_media_id'    => $media->print_media_id,
            'title'             => $media->title,
            'type'              => $media->type,
            'date_published'    => $media->date_published,
            'file_url'          => $media->file_path ? asset('storage/' . $media->file_path) : null,
            'thumbnail_url'     => $media->thumbnail_path ? asset('storage/' . $media->thumbnail_path) : null,
            'original_filename' => $media->original_filename,
            'created_at'        => $media->created_at,
        ];
    }

    public function show(Request $request, $id = null)
    {
        // 1. Identify Viewer (Safe Auth Check)
        $currentUser = Auth::guard('sanctum')->user();

        // 2. Identify Target
        if ($id) {
            $user = User::find($id);
        } else {
            $user = $currentUser;
        }

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // 3. Permissions
        $isOwner = $currentUser && $currentUser->id === $user->id;
        $isAdmin = $currentUser && $currentUser->role === 'admin';
        
        $isManagement = false;
        if ($currentUser && !empty($currentUser->position)) {
             $pos = strtolower($currentUser->position);
             if (str_contains($pos, 'editor') || str_contains($pos, 'director')) {
                 $isManagement = true;
             }
        }

        // 4. Fetch Publications (Without Scopes)
        $query = Publication::withoutGlobalScopes()
            ->where(function($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhereHas('writers', function ($subQ) use ($user) {
                      $subQ->where('users.id', $user->id);
                  });
            })
            ->with('writers');

        // Visibility Logic
        if (!$isOwner && !$isAdmin && !$isManagement) {
            $query->where('status', 'published');
        } else {
            $query->orderByRaw("FIELD(status, 'submitted', 'reviewed', 'draft', 'returned', 'approved', 'published') ASC");
        }
        
        $query->orderBy('created_at', 'desc');

        $articles = $query->get()->map(fn($pub) => $this->formatPublication($pub));

        // 5. Fetch Print Media
        $printMediaQuery = PrintMedia::where(function($q) use ($user) {
            $q->where('user_id', $user->id)
              ->orWhereHas('owners', function ($subQ) use ($user) {
                  $subQ->where('users.id', $user->id);
              });
        })->with('owners')->orderBy('created_at', 'desc');

        $printMedia = $printMediaQuery->get()->map(fn($m) => $this->formatPrintMedia($m));

        // 6. Return Combined Data
        return response()->json([
            'user' => $user,
            'articles' => $articles,
            'print_media' => $printMedia 
        ])->header('X-Debug-Auth', $currentUser ? "User: {$currentUser->id}" : "Guest");
    }
}