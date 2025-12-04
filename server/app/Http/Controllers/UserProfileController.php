<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Publication;
use Illuminate\Http\Request;

class UserProfileController extends Controller
{
    public function show(Request $request, $id = null)
    {
        // If ID is provided, show that user. Otherwise, show current logged-in user.
        $userId = $id ? $id : $request->user()->id;

        $user = User::findOrFail($userId);

        // Fetch articles written by this user
        // Assuming you have a 'user_id' column in your 'publications' table
        // If not, you'll need to add it (similar to how we added 'views')
        $articles = Publication::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($publication) {
                if ($publication->image_path) {
                    $publication->image = asset('storage/' . $publication->image_path);
                } else {
                    $publication->image = null;
                }
                return $publication;
            });

        return response()->json([
            'user' => $user,
            'articles' => $articles
        ]);
    }
}