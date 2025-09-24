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
    public function show($print_media_id)
    {
        $printMedia = PrintMedia::findOrFail($print_media_id);
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
            'file' => 'required|file|max:20480|mimes:pdf,doc,docx', // Only allow PDF and Word docs
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only(['title', 'type', 'description', 'byline']);
        $data['date'] = now()->toDateString();

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $extension = strtolower($file->getClientOriginalExtension());

            // If file is already PDF, store it directly
            if ($extension === 'pdf') {
                $pdfPath = $file->store('print_media_files/pdf', 'public');
                $data['file_path'] = $pdfPath;
                $data['original_filename'] = $file->getClientOriginalName();
            } else {
                // Convert Word documents to PDF using LibreOffice
                try {
                    // Store original file temporarily
                    $tempPath = $file->store('temp', 'public');
                    $fullTempPath = storage_path('app/public/' . $tempPath);
                    
                    // Convert to PDF using LibreOffice
                    $outputDir = storage_path('app/public/print_media_files/pdf');
                    $command = "soffice --headless --convert-to pdf --outdir " . escapeshellarg($outputDir) . " " . escapeshellarg($fullTempPath);
                    exec($command, $output, $returnCode);

                    if ($returnCode !== 0) {
                        throw new \Exception('Document conversion failed');
                    }

                    // Store original file in final location
                    $originalPath = $file->store('print_media_files/original', 'public');
                    
                    // Set paths in data
                    $data['file_path'] = 'print_media_files/pdf/' . $originalName . '.pdf';
                    $data['original_file_path'] = $originalPath;
                    $data['original_filename'] = $file->getClientOriginalName();

                    // Clean up temp file
                    Storage::disk('public')->delete($tempPath);

                } catch (\Exception $e) {
                    return response()->json([
                        'error' => 'Failed to convert document to PDF',
                        'message' => $e->getMessage()
                    ], 422);
                }
            }
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
            'file' => 'nullable|file|max:20480|mimes:pdf,doc,docx',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only(['title', 'type', 'description', 'byline']);

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $extension = $file->getClientOriginalExtension();

            // If file is already PDF, store it directly
            if (strtolower($extension) === 'pdf') {
                $pdfPath = $file->store('print_media_files/pdf', 'public');
                $data['file_path'] = $pdfPath;
                $data['original_filename'] = $file->getClientOriginalName();
            } else {
                // Convert Word documents to PDF using LibreOffice
                try {
                    // Store original file temporarily
                    $tempPath = $file->store('temp', 'public');
                    $fullTempPath = storage_path('app/public/' . $tempPath);
                    
                    // Convert to PDF using LibreOffice
                    $outputDir = storage_path('app/public/print_media_files/pdf');
                    $command = "soffice --headless --convert-to pdf --outdir " . escapeshellarg($outputDir) . " " . escapeshellarg($fullTempPath);
                    exec($command, $output, $returnCode);

                    if ($returnCode !== 0) {
                        throw new \Exception('Document conversion failed');
                    }

                    // Store original file in final location
                    $originalPath = $file->store('print_media_files/original', 'public');
                    
                    // Set paths in data
                    $data['file_path'] = 'print_media_files/pdf/' . $originalName . '.pdf';
                    $data['original_file_path'] = $originalPath;
                    $data['original_filename'] = $file->getClientOriginalName();

                    // Clean up temp file
                    Storage::disk('public')->delete($tempPath);

                } catch (\Exception $e) {
                    return response()->json([
                        'error' => 'Failed to convert document to PDF',
                        'message' => $e->getMessage()
                    ], 422);
                }
            }
        }

        $printMedia->update($data);

        return response()->json($printMedia);
    }

    /**
     * Remove the specified print media from storage.
     */
    public function destroy($print_media_id)
    {
        $printMedia = PrintMedia::findOrFail($print_media_id);
        
        if ($printMedia->file_path) {
            Storage::disk('public')->delete($printMedia->file_path);
        }
        if ($printMedia->original_file_path) {
            Storage::disk('public')->delete($printMedia->original_file_path);
        }

        $printMedia->delete();
        return response()->json(['message' => 'Print media deleted successfully']);
    }
}


