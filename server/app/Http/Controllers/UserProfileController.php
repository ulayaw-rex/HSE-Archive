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
            'file_path'         => $media->file_path, 
            'thumbnail_path'    => $media->thumbnail_path,
            'file_url'          => $media->file_path ? asset('storage/' . $media->file_path) : null,
            'thumbnail_url'     => $media->thumbnail_path ? asset('storage/' . $media->thumbnail_path) : null,
            'original_filename' => $media->original_filename,
            'created_at'        => $media->created_at,
        ];
    }

    public function show(Request $request, $id = null)
    {
        $currentUser = Auth::guard('sanctum')->user();
        $user = $id ? User::find($id) : $currentUser;

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $isOwner = $currentUser && $currentUser->id === $user->id;
        $isAdmin = $currentUser && $currentUser->role === 'admin';
        
        $pos = strtolower($currentUser->position ?? '');
        $isEIC = str_contains($pos, 'chief');
        $isAssociate = str_contains($pos, 'associate');
        $isDirector = str_contains($pos, 'director');
        $isManagement = $isAdmin || $isEIC || $isAssociate || $isDirector;

        $query = Publication::withoutGlobalScopes()
            ->where(function($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhereHas('writers', function ($subQ) use ($user) {
                      $subQ->where('users.id', $user->id);
                  });
            })
            ->with('writers');

        if (!$isOwner && !$isAdmin && !$isManagement) {
            $query->where('status', 'published');
        } else {
            $query->orderByRaw("FIELD(status, 'submitted', 'reviewed', 'draft', 'returned', 'approved', 'published') ASC");
        }
        
        $articles = $query->orderBy('created_at', 'desc')->get()->map(fn($pub) => $this->formatPublication($pub));

        $printMedia = PrintMedia::where(function($q) use ($user) {
            $q->where('user_id', $user->id)
              ->orWhereHas('owners', function ($subQ) use ($user) {
                  $subQ->where('users.id', $user->id);
              });
        })->with('owners')->orderBy('created_at', 'desc')->get()->map(fn($m) => $this->formatPrintMedia($m));

        $reviewQueue = [];
        if ($isOwner && $isManagement) {
            $rqQuery = Publication::withoutGlobalScopes()->with('writers');
            
            if ($isAdmin || $isDirector) {
                $rqQuery->whereIn('status', ['submitted', 'reviewed', 'approved']);
            } elseif ($isEIC) {
                $rqQuery->whereIn('status', ['reviewed', 'approved']);
            } elseif ($isAssociate) {
                $rqQuery->where('status', 'submitted');
            }

            $reviewQueue = $rqQuery->orderBy('created_at', 'asc')->get()->map(fn($pub) => $this->formatPublication($pub));
        }

        return response()->json([
            'user' => $user,
            'articles' => $articles,
            'print_media' => $printMedia,
            'review_queue' => $reviewQueue 
        ])->header('X-Debug-Auth', $currentUser ? "User: {$currentUser->id}" : "Guest");
    }
}