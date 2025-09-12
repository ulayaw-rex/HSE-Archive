<?php

namespace App\Http\Controllers;

use App\Models\PrintMedia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class PrintMediaController extends Controller
{
    /**
     * Display a listing of the print media archives.
     */
    public function index()
    {
        $printMedia = PrintMedia::orderBy('created_at', 'desc')->get();
        return response()->json($printMedia);
    }

    /**
     * Display the specified print media.
     */
    public function show(PrintMedia $printMedia)
    {
        return response()->json($printMedia);
    }

    /**
     * Store a newly created print media in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'type' => 'required|string|max:100',
            'description' => 'required|string',
            'byline' => 'nullable|string|max:255',
            'file' => 'nullable|file|max:10240', // max 10MB
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only(['title', 'type', 'description', 'byline']);

        // Set date automatically to current date
        $data['date'] = now()->toDateString();

        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('print_media_files', 'public');
            $data['file_path'] = $path;
        }

        $printMedia = PrintMedia::create($data);

        return response()->json($printMedia, 201);
    }

    /**
     * Update the specified print media in storage.
     */
    public function update(Request $request, PrintMedia $printMedia)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'type' => 'required|string|max:100',
            'description' => 'required|string',
            'byline' => 'nullable|string|max:255',
            'file' => 'nullable|file|max:10240', // max 10MB
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only(['title', 'type', 'description', 'byline']);

        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('print_media_files', 'public');
            $data['file_path'] = $path;
        }

        $printMedia->update($data);

        return response()->json($printMedia);
    }

    /**
     * Remove the specified print media from storage.
     */
    public function destroy(PrintMedia $printMedia)
    {
        $printMedia->delete();
        return response()->json(['message' => 'Print media deleted successfully']);
    }
}
