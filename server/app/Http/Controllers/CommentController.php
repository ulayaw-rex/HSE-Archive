<?php

namespace App\Http\Controllers;

use App\Models\Publication;
use App\Models\Comment; 
use App\Models\CommentHistory; 
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

        if ($comment->body !== $validated['body']) {
            
            CommentHistory::create([
                'comment_id' => $comment->id,
                'body' => $comment->body 
            ]);

            $comment->body = $validated['body'];
            $comment->is_edited = true;
            $comment->save();
        }

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

    public function history($id)
    {
        $histories = CommentHistory::where('comment_id', $id)
            ->orderBy('created_at', 'desc') 
            ->get();

        return response()->json($histories);
    }
}