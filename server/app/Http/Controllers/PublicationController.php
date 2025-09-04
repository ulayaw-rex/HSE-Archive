<?php

namespace App\Http\Controllers;

use App\Models\Publication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class PublicationController extends Controller
{
    /**
     * Display a listing of the publications.
     */
    public function index()
    {
        $publications = Publication::orderBy('created_at', 'desc')->get()->map(function ($publication) {
            if ($publication->image_path) {
                $publication->image = asset('storage/' . $publication->image_path);
            } else {
                $publication->image = null;
            }
            return $publication;
        });
        return response()->json($publications);
    }

    /**
     * Store a newly created publication in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'byline' => 'required|string|max:255',
            'body' => 'required|string',
            'category' => 'required|string|max:100',
            'photo_credits' => 'nullable|string|max:255',
            'image' => 'nullable|image|max:2048', // max 2MB
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only(['title', 'byline', 'body', 'category', 'photo_credits']);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('publications_images', 'public');
            $data['image_path'] = $path;
        }

        $publication = Publication::create($data);

        // Add image URL attribute before returning
        if ($publication->image_path) {
            $publication->image = asset('storage/' . $publication->image_path);
        } else {
            $publication->image = null;
        }

        return response()->json($publication, 201);
    }

    /**
     * Update the specified publication in storage.
     */
    public function update(Request $request, Publication $publication)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'byline' => 'required|string|max:255',
            'body' => 'required|string',
            'category' => 'required|string|max:100',
            'photo_credits' => 'nullable|string|max:255',
            'image' => 'nullable|image|max:2048', // max 2MB
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only(['title', 'byline', 'body', 'category', 'photo_credits']);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('publications_images', 'public');
            $data['image_path'] = $path;
        }

        $publication->update($data);

        // Add image URL attribute before returning
        if ($publication->image_path) {
            $publication->image = asset('storage/' . $publication->image_path);
        } else {
            $publication->image = null;
        }

        return response()->json($publication);
    }

    /**
     * Remove the specified publication from storage.
     */
    public function destroy(Publication $publication)
    {
        $publication->delete();
        return response()->json(['message' => 'Publication deleted successfully']);
    }

    /**
     * Get publications filtered by category.
     */
    public function getByCategory($category)
    {
        $publications = Publication::where('category', $category)
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

        return response()->json($publications);
    }
}
