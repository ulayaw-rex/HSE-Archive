<?php

namespace App\Http\Controllers;

use App\Models\Publication;
use App\Models\Comment; 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    public function index(Publication $publication)
    {
        $comments = $publication->comments()
                                ->with('user:id,name')
                                ->latest()
                                ->get();
        
        return response()->json($comments);
    }

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

    public function update(Request $request, Comment $comment)
    {
        $user = $request->user();
        if ($user->id !== $comment->user_id && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'body' => 'required|string|max:5000',
        ]);

        $comment->update($validated);

        return response()->json($comment->load('user:id,name'));
    }

    public function destroy(Request $request, Comment $comment)
    {
        $user = $request->user();
        if ($user->id !== $comment->user_id && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comment->delete();

        return response()->json(['message' => 'Comment deleted']);
    }
}