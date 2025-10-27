<?php

namespace App\Http\Controllers;

use App\Models\Publication; // Use your Publication model
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    /**
     * Get all comments for a specific publication.
     */
    public function index(Publication $publication)
    {
        // We use 'with('user:id,name')' to get the author's name
        // along with the comment. This is very efficient.
        $comments = $publication->comments()
                                ->with('user:id,name')
                                ->latest() // Newest comments first
                                ->get();
        
        return response()->json($comments);
    }

    /**
     * Store a new comment for a specific publication.
     */
    public function store(Request $request, Publication $publication)
    {
        $request->validate([
            'body' => 'required|string|max:5000',
        ]);

        // Create the comment and link it to the publication
        // and the currently logged-in user.
        $comment = $publication->comments()->create([
            'body' => $request->body,
            'user_id' => Auth::id(),
        ]);

        // Load the user data onto the new comment before sending it
        // so your React app can display it immediately.
        $comment->load('user:id,name');

        // Return a "201 Created" status with the new comment
        return response()->json($comment, 201);
    }
}