<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Publication;
use Illuminate\Http\Request;

class UserProfileController extends Controller
{
    public function show(Request $request, $id = null)
    {
        if ($id) {
            $user = User::findOrFail($id);
        } else {
            $user = $request->user();
        }

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $currentUser = $request->user('sanctum');
        $isOwner = $currentUser && $currentUser->id === $user->id;

        $query = Publication::whereHas('writers', function ($q) use ($user) {
            $q->where('users.id', $user->id);
        })
        ->with('writers')
        ->orderBy('created_at', 'desc');

        if (!$isOwner) {
            $query->where('status', 'approved');
        } 

        $articles = $query->get()->map(function ($publication) {
            $publication->image = $publication->image_path 
                ? asset('storage/' . $publication->image_path) 
                : null;
            return $publication;
        });

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'avatar' => $user->avatar,
                'course' => $user->course,    
                'position' => $user->position 
            ],
            'articles' => $articles
        ]);
    }
}