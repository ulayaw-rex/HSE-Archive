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
        $media = PrintMedia::all()->map(function ($item) {
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
            'title'       => 'required|string|max:255',
            'type'        => 'required|string|in:tabloid,magazine,folio,other,Tabloid,Magazine,Folio,Other',
            'description' => 'required|string',
            'byline'      => 'nullable|string|max:255',
            'date'        => 'required|date',
            'file'        => 'required|file|mimes:pdf,doc,docx|max:20480',
            'thumbnail'   => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ], [
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

        try {
            $data = $request->only(['title', 'description', 'byline', 'date']);

            $typeMapping = [
                'tabloid' => 'Tabloid',
                'magazine' => 'Magazine',
                'folio' => 'Folio',
                'other' => 'Other'
            ];
            $data['type'] = $typeMapping[strtolower($request->type)] ?? $request->type;

            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $data['original_filename'] = $file->getClientOriginalName();
                $path = $file->store('print_media_files', 'public');
                $data['file_path'] = $path;
                \Log::info('File stored at: ' . $path);
            }

            if ($request->hasFile('thumbnail')) {
                $thumbnailFile = $request->file('thumbnail');
                $thumbnailPath = $thumbnailFile->store('print_media_thumbnails', 'public');
                $data['thumbnail_path'] = $thumbnailPath;
                \Log::info('Thumbnail stored at: ' . $thumbnailPath);
            }

            $media = PrintMedia::create($data);
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
            'title'       => 'required|string|max:255',
            'type'        => 'required|string|in:tabloid,magazine,folio,other,Tabloid,Magazine,Folio,Other',
            'description' => 'required|string',
            'byline'      => 'nullable|string|max:255',
            'date'        => 'sometimes|required|date',
            'file'        => 'nullable|file|mimes:pdf,doc,docx|max:20480',
            'thumbnail'   => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            \Log::error('Update validation failed:', $validator->errors()->toArray());
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        $printMedia = PrintMedia::findOrFail($id);

        $printMedia->fill($request->only(['title', 'description', 'byline', 'date']));

        $typeMapping = ['tabloid' => 'Tabloid', 'magazine' => 'Magazine', 'folio' => 'Folio', 'other' => 'Other'];
        $printMedia->type = $typeMapping[strtolower($request->type)] ?? $request->type;

        if ($request->hasFile('file')) {
            if ($printMedia->file_path && Storage::disk('public')->exists($printMedia->file_path)) {
                Storage::disk('public')->delete($printMedia->file_path);
            }
            $file = $request->file('file');
            $printMedia->original_filename = $file->getClientOriginalName();
            $path = $file->store('print_media_files', 'public');
            $printMedia->file_path = $path;
        }

        if ($request->hasFile('thumbnail')) {
            if ($printMedia->thumbnail_path && Storage::disk('public')->exists($printMedia->thumbnail_path)) {
                Storage::disk('public')->delete($printMedia->thumbnail_path);
            }
            $thumbnailFile = $request->file('thumbnail');
            $thumbnailPath = $thumbnailFile->store('print_media_thumbnails', 'public');
            $printMedia->thumbnail_path = $thumbnailPath;
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

        return response()->json(['message' => 'Deleted successfully']);
    }

    public function serveFile(string $path)
    {
        if (!Storage::disk('public')->exists($path)) {
            abort(Response::HTTP_NOT_FOUND);
        }

        return Storage::disk('public')->response($path);
    }


    private function transformMedia(PrintMedia $media)
    {
        return [
            'print_media_id'    => $media->print_media_id,
            'title'             => $media->title,
            'type'              => $media->type,
            'date'              => $media->date,
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
