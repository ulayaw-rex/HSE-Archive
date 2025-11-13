<?php

namespace App\Http\Controllers;

use App\Models\Publication;
use App\Models\Comment; // <-- 1. ADD THIS IMPORT
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    /**
     * Get all comments for a specific publication.
     */
    public function index(Publication $publication)
    {
        $comments = $publication->comments()
                                ->with('user:id,name')
                                ->latest()
                                ->get();
        
        return response()->json($comments);
    }

    /**
     * Store a new comment.
     */
    public function store(Request $request, Publication $publication)
    {
        $request->validate([
            'body' => 'required|string|max:5000',
        ]);

        $comment = $publication->comments()->create([
            'body' => $request->body,
            'user_id' => Auth::id(),
        ]);

        $comment->load('user:id,name');

        return response()->json($comment, 201);
    }

    /**
     * Update an existing comment.
     * (Added for Edit Feature)
     */
    public function update(Request $request, Comment $comment)
    {
        // 1. Security Check: Ensure user owns the comment OR is an admin
        $user = $request->user();
        if ($user->id !== $comment->user_id && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // 2. Validate
        $validated = $request->validate([
            'body' => 'required|string|max:5000',
        ]);

        // 3. Update
        $comment->update($validated);

        // 4. Return updated comment (reload user to be safe)
        return response()->json($comment->load('user:id,name'));
    }

    /**
     * Delete a comment.
     * (Added for Delete Feature)
     */
    public function destroy(Request $request, Comment $comment)
    {
        // 1. Security Check
        $user = $request->user();
        if ($user->id !== $comment->user_id && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // 2. Delete
        $comment->delete();

        return response()->json(['message' => 'Comment deleted']);
    }
}