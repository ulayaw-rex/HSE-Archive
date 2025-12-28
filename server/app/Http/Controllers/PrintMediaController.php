<?php

namespace App\Http\Controllers;

use App\Models\PrintMedia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class PrintMediaController extends Controller
{
    public function index()
    {
        $media = PrintMedia::orderBy('date_published', 'desc')
            ->get()
            ->map(function ($item) {
                return $this->transformMedia($item);
            });

        return response()->json($media);
    }

    public function show($id)
    {
        $media = PrintMedia::findOrFail($id);
        return response()->json($this->transformMedia($media));
    }


    public function store(Request $request)
    {
        \Log::info('Received data for store:', $request->all());

        $validator = Validator::make($request->all(), [
            'title'          => 'required|string|max:255',
            'type'           => 'required|string|in:tabloid,magazine,folio,other,Tabloid,Magazine,Folio,Other',
            'description'    => 'required|string',
            'byline'         => 'nullable|string|max:255',
            'date_published' => 'nullable|date',
            'file'           => 'required|file|mimes:pdf,doc,docx|max:204800',
            'thumbnail'      => 'nullable|image|mimes:jpeg,png,jpg,gif|max:10240',
        ], [
            'file.required' => 'Please upload a file.',
            'type.in'       => 'The selected type must be one of: Tabloids, Magazines, Folios, or Others'
        ]);

        if ($validator->fails()) {
            \Log::error('Validation failed:', $validator->errors()->toArray());
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $request->only(['title', 'description', 'byline']);

            $typeMapping = [
                'tabloid' => 'Tabloid', 'magazine' => 'Magazine', 
                'folio' => 'Folio', 'other' => 'Other'
            ];
            $data['type'] = $typeMapping[strtolower($request->type)] ?? $request->type;
            $data['date_published'] = $request->date_published ?? now();

            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $data['original_filename'] = $file->getClientOriginalName();
                $data['file_path'] = $file->store('print_media_files', 'public');
            }

            if ($request->hasFile('thumbnail')) {
                $data['thumbnail_path'] = $request->file('thumbnail')->store('print_media_thumbnails', 'public');
            }

            $media = PrintMedia::create($data);
            
            \App\Models\AuditLog::record('Created Print Media', "Title: {$media->title}");
            
            return response()->json($this->transformMedia($media), 201);

        } catch (\Exception $e) {
            \Log::error('Creation failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to create print media',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        \Log::info('Received data for update on ID ' . $id . ':', $request->all());

        $validator = Validator::make($request->all(), [
            'title'          => 'required|string|max:255',
            'type'           => 'required|string|in:tabloid,magazine,folio,other,Tabloid,Magazine,Folio,Other',
            'description'    => 'required|string',
            'byline'         => 'nullable|string|max:255',
            'date_published' => 'nullable|date',
            'file'           => 'nullable|file|mimes:pdf,doc,docx|max:204800',
            'thumbnail'      => 'nullable|image|mimes:jpeg,png,jpg,gif|max:10240',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        $printMedia = PrintMedia::findOrFail($id);

        $printMedia->fill($request->only(['title', 'description', 'byline']));
        
        if ($request->has('date_published')) {
            $printMedia->date_published = $request->date_published;
        }

        $typeMapping = ['tabloid' => 'Tabloid', 'magazine' => 'Magazine', 'folio' => 'Folio', 'other' => 'Other'];
        $printMedia->type = $typeMapping[strtolower($request->type)] ?? $request->type;

        if ($request->hasFile('file')) {
            if ($printMedia->file_path && Storage::disk('public')->exists($printMedia->file_path)) {
                Storage::disk('public')->delete($printMedia->file_path);
            }
            $file = $request->file('file');
            $printMedia->original_filename = $file->getClientOriginalName();
            $printMedia->file_path = $file->store('print_media_files', 'public');
        }

        if ($request->hasFile('thumbnail')) {
            if ($printMedia->thumbnail_path && Storage::disk('public')->exists($printMedia->thumbnail_path)) {
                Storage::disk('public')->delete($printMedia->thumbnail_path);
            }
            $printMedia->thumbnail_path = $request->file('thumbnail')->store('print_media_thumbnails', 'public');
        }

        $printMedia->save();

        return response()->json([
            'message' => 'Print media updated successfully',
            'data' => $this->transformMedia($printMedia)
        ]);
    }

    public function destroy($id)
    {
        $media = PrintMedia::findOrFail($id);

        if ($media->file_path && Storage::disk('public')->exists($media->file_path)) {
            Storage::disk('public')->delete($media->file_path);
        }
        if ($media->thumbnail_path && Storage::disk('public')->exists($media->thumbnail_path)) {
            Storage::disk('public')->delete($media->thumbnail_path);
        }

        $media->delete();
        
        \App\Models\AuditLog::record('Deleted Print Media', "Deleted: {$media->title}");

        return response()->json(['message' => 'Deleted successfully']);
    }


    public function serveFile(string $path)
    {
        if (!Storage::disk('public')->exists($path)) {
            abort(Response::HTTP_NOT_FOUND);
        }
        return Storage::disk('public')->response($path);
    }
    
    public function downloadPdf($id)
    {
        $media = PrintMedia::findOrFail($id);
        if (!$media->file_path || !Storage::disk('public')->exists($media->file_path)) {
             return response()->json(['message' => 'File not found'], 404);
        }
        return Storage::disk('public')->download($media->file_path, $media->original_filename ?? 'document.pdf');
    }

    public function viewPdf($id)
    {
        $media = PrintMedia::findOrFail($id);
        if (!$media->file_path || !Storage::disk('public')->exists($media->file_path)) {
             return response()->json(['message' => 'File not found'], 404);
        }
        return Storage::disk('public')->response($media->file_path, $media->original_filename ?? 'document.pdf', [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . ($media->original_filename ?? 'document.pdf') . '"'
        ]);
    }
    private function transformMedia(PrintMedia $media)
    {
        return [
            'print_media_id'    => $media->print_media_id,
            'title'             => $media->title,
            'type'              => $media->type,
            'date_published'    => $media->date_published, 
            'description'       => $media->description,
            'byline'            => $media->byline,
            'file_path'         => $media->file_path,
            'file_url'          => $media->file_path ? Storage::url($media->file_path) : null,
            'thumbnail_path'    => $media->thumbnail_path,
            'thumbnail_url'     => $media->thumbnail_path ? Storage::url($media->thumbnail_path) : null,
            'original_filename' => $media->original_filename,
            'created_at'        => $media->created_at,
            'updated_at'        => $media->updated_at,
        ];
    }
}