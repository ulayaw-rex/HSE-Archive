<?php

namespace App\Http\Controllers;

use App\Models\PrintMedia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class PrintMediaController extends Controller
{
    /**
     * Get all media records
     */
    public function index()
    {
        $media = PrintMedia::all()->map(function ($item) {
            return $this->transformMedia($item);
        });

        return response()->json($media);
    }

    /**
     * Show a single record
     */
    public function show($id)
    {
        $media = PrintMedia::findOrFail($id);
        return response()->json($this->transformMedia($media));
    }

    /**
     * Store a new record
     */
    public function store(Request $request)
    {
        \Log::info('Received data:', $request->all()); // Add debugging

        $validator = Validator::make($request->all(), [
            'title'       => 'required|string|max:255',
            'type'        => 'required|string|in:tabloid,magazine,folio,other,Tabloid,Magazine,Folio,Other',
            'description' => 'required|string',
            'byline'      => 'nullable|string|max:255',
            'date'        => 'required|date',
            'file'        => 'required|file|mimes:pdf,doc,docx|max:20480',
        ], [
            'date.required' => 'The date field is required. Please select a date.',
            'file.required' => 'Please upload a file.',
            'type.in' => 'The selected type must be one of: Tabloids, Magazines, Folios, or Others'
        ]);

        if ($validator->fails()) {
            \Log::error('Validation failed:', $validator->errors()->toArray());
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Normalize the type to proper case before saving
        $typeMapping = [
            'tabloid' => 'Tabloid',
            'magazine' => 'Magazine', 
            'folio' => 'Folio',
            'other' => 'Other'
        ];

        $normalizedType = $typeMapping[strtolower($request->type)] ?? $request->type;

        try {
            $data = $request->only(['title', 'description', 'byline', 'date']);
            $data['type'] = $normalizedType;

            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $data['original_filename'] = $file->getClientOriginalName();
                
                // Store in public disk without 'public/' prefix
                $path = $file->store('print_media_files', 'public');
                $data['file_path'] = $path;
                \Log::info('File stored at: ' . $path);
            }

            $media = PrintMedia::create($data);
            return response()->json($this->transformMedia($media), 201);

        } catch (\Exception $e) {
            \Log::error('Creation failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to create print media',
                'error' => $e->getMessage(),
                'trace' => $e->getTrace()
            ], 500);
        }
    }

    /**
     * Update a record
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'type' => 'required|string|in:Tabloid,Magazine,Folio,Other',
            'description' => 'required|string',
            'byline' => 'nullable|string|max:255',
            'date' => 'required|date',
            'file' => 'nullable|file|mimes:pdf,doc,docx|max:20480',
        ]);//Add thumbnail path and image path to validation rules

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $printMedia = PrintMedia::findOrFail($id);

        // Handle file update if new file is uploaded
        if ($request->hasFile('file')) {
            // Delete old file if it exists
            if ($printMedia->file_path && Storage::disk('public')->exists($printMedia->file_path)) {
                Storage::disk('public')->delete($printMedia->file_path);
            }
            
            // Store new file using public disk
            $file = $request->file('file');
            $printMedia->original_filename = $file->getClientOriginalName();
            $path = $file->store('print_media_files', 'public');
            $printMedia->file_path = $path;
        }

        // Update other fields
        $printMedia->title = $request->title;
        $printMedia->type = $request->type;
        $printMedia->description = $request->description;
        $printMedia->byline = $request->byline;
        $printMedia->date = $request->date;
        
        $printMedia->save();

        return response()->json([
            'message' => 'Print media updated successfully',
            'data' => $printMedia
        ]);
    }

    /**
     * Delete a record
     */
    public function destroy($id)
    {
        $media = PrintMedia::findOrFail($id);

        if ($media->file_path) {
            Storage::disk('public')->delete($media->file_path);
        }
        if ($media->thumbnail_path) {
            Storage::disk('public')->delete($media->thumbnail_path);
        }
        if ($media->image_path) {
            Storage::disk('public')->delete($media->image_path);
        }

        $media->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }

    /**
     * Transform record into API response with full URLs
     */
    private function transformMedia(PrintMedia $media)
    {
        $baseUrl = url('/');
        
        // Set content disposition header for PDFs
        if ($media->file_path) {
            header('Content-Type: application/pdf');
            header('Content-Disposition: inline; filename="' . basename($media->file_path) . '"');
        }
        
        return [
            'print_media_id'    => $media->print_media_id,
            'title'             => $media->title,
            'type'              => $media->type,
            'date'              => $media->date,
            'description'       => $media->description,
            'byline'            => $media->byline,
            'file_url'          => $media->file_path 
                ? $baseUrl . '/storage/' . str_replace('public/', '', $media->file_path)
                : null,
            'thumbnail_url'     => $media->thumbnail_path 
                ? $baseUrl . '/storage/' . str_replace('public/', '', $media->thumbnail_path)
                : null,
            'image_url'         => $media->image_path 
                ? $baseUrl . '/storage/' . str_replace('public/', '', $media->image_path)
                : null,
            'original_filename' => $media->original_filename,
            'created_at'        => $media->created_at,
            'updated_at'        => $media->updated_at,
        ];
    }
}
