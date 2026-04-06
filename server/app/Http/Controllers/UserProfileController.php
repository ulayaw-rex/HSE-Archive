<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Publication;
use App\Models\PrintMedia; 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Traits\FormatsPublications;

class UserProfileController extends Controller
{
    use FormatsPublications;

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
        $isAdmin = $currentUser && $currentUser->isAdmin();
        
        $isEIC = $currentUser && $currentUser->isEditorInChief();
        $isAssociate = $currentUser && $currentUser->isAssociateEditor();
        $isDirector = $currentUser && $currentUser->isDirector();
        $isManagement = $currentUser && $currentUser->isManagement();

        $query = Publication::query()
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
            $query->orderByRaw("FIELD(status, 'submitted', 'approved', 'reviewed', 'draft', 'returned', 'published') ASC");
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
            $rqQuery = Publication::with('writers');
            
            if ($isAdmin || $isDirector) {
                $rqQuery->whereIn('status', ['submitted', 'approved', 'reviewed']);
            } elseif ($isEIC) {
                $rqQuery->whereIn('status', ['approved', 'reviewed']);
            } elseif ($isAssociate) {
                $rqQuery->where('status', 'submitted');
            }

            $rqQuery->orderByRaw("FIELD(status, 'reviewed', 'approved', 'submitted') ASC")
                    ->orderBy('created_at', 'asc');

            $reviewQueue = $rqQuery->get()->map(fn($pub) => $this->formatPublication($pub));
        }

        return response()->json([
            'user' => $user,
            'articles' => $articles,
            'print_media' => $printMedia,
            'review_queue' => $reviewQueue 
        ]);
    }
}