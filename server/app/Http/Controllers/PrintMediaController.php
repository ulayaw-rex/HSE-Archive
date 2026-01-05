<?php

namespace App\Http\Controllers;

use App\Models\PrintMedia;
use App\Models\CreditRequest; 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth; 
use Symfony\Component\HttpFoundation\Response;

class PrintMediaController extends Controller
{
    public function index()
    {
        $media = PrintMedia::with(['user', 'owners']) 
            ->orderBy('date_published', 'desc')
            ->get()
            ->map(function ($item) {
                return $this->transformMedia($item);
            });

        return response()->json($media);
    }

    public function show($id)
    {
        $media = PrintMedia::with(['user', 'owners'])->findOrFail($id);
        return response()->json($this->transformMedia($media));
    }

    public function store(Request $request)
    {
        \Log::info('Received data for store:', $request->all());

        $user = $request->user(); 

        $validator = Validator::make($request->all(), [
            'title'          => 'required|string|max:255',
            'type'           => 'required|string|in:tabloid,magazine,folio,other,Tabloid,Magazine,Folio,Other',
            'description'    => 'required|string',
            'byline'         => 'nullable|string|max:255',
            'date_published' => 'nullable|date',
            'file'           => 'required|file|mimes:pdf,doc,docx|max:204800',
            'thumbnail'      => 'nullable|image|mimes:jpeg,png,jpg,gif|max:51200',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        try {
            $data = $request->only(['title', 'description', 'byline']);
             
            $data['user_id'] = $user ? $user->id : null; 

            $typeMapping = ['tabloid' => 'Tabloid', 'magazine' => 'Magazine', 'folio' => 'Folio', 'other' => 'Other'];
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

            if ($user) {
                $media->owners()->attach($user->id);
            }
             
            \App\Models\AuditLog::record('Created Print Media', "Title: {$media->title}");
             
            $media->load('owners');
            
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
        $validator = Validator::make($request->all(), [
            'title'          => 'required|string|max:255',
            'type'           => 'required|string|in:tabloid,magazine,folio,other,Tabloid,Magazine,Folio,Other',
            'description'    => 'required|string',
            'byline'         => 'nullable|string|max:255',
            'date_published' => 'nullable|date',
            'file'           => 'nullable|file|mimes:pdf,doc,docx|max:204800',
            'thumbnail'      => 'nullable|image|mimes:jpeg,png,jpg,gif|max:51200',
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
        $printMedia->load(['user', 'owners']); // Reload relations

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

    public function requestCredit(Request $request, $id)
    {
        $media = PrintMedia::findOrFail($id);
        $user = $request->user();

        if ($media->owners()->where('users.id', $user->id)->exists()) {
            return response()->json(['message' => 'You are already an owner.'], 422);
        }

        $existingRequest = CreditRequest::where('user_id', $user->id)
            ->where('requestable_id', $id)
            ->where('requestable_type', PrintMedia::class)
            ->first(); 

        if ($existingRequest) {
            if ($existingRequest->status === 'pending') {
                return response()->json(['message' => 'Request already pending.'], 409);
            }
            
            if ($existingRequest->status === 'approved') {
                 return response()->json(['message' => 'You are already an owner.'], 422);
            }

            if ($existingRequest->status === 'rejected') {
                $existingRequest->update(['status' => 'pending']);
                return response()->json(['message' => 'Credit request re-submitted successfully.']);
            }
        }

        CreditRequest::create([
            'user_id' => $user->id,
            'requestable_id' => $id,
            'requestable_type' => PrintMedia::class,
            'status' => 'pending',
        ]);

        return response()->json(['message' => 'Credit request submitted successfully.']);
    }

    public function serveFile(string $path)
    {
        if (!Storage::disk('public')->exists($path)) {
            abort(Response::HTTP_NOT_FOUND);
        }
        return response()->file(Storage::disk('public')->path($path));
    }
      
    public function download(Request $request, $id)
    {
        $media = PrintMedia::with('owners')->findOrFail($id);
        $user = $request->user();

        $isOwner = $media->user_id === $user->id || $media->owners->contains($user->id);
        $isAdmin = $user->role === 'admin'; 

        if (!$isOwner && !$isAdmin) {
            return response()->json(['message' => 'Unauthorized. Only an owner can download this file.'], 403);
        }

        if (!$media->file_path || !Storage::disk('public')->exists($media->file_path)) {
             return response()->json(['message' => 'File not found'], 404);
        }

        $path = Storage::disk('public')->path($media->file_path);
        $filename = $media->original_filename ?? 'document.pdf';

        return response()->download($path, $filename);
    }

    public function viewPdf($id)
    {
        $media = PrintMedia::findOrFail($id);
          
        if (!$media->file_path || !Storage::disk('public')->exists($media->file_path)) {
             return response()->json(['message' => 'File not found'], 404);
        }
        
        $path = Storage::disk('public')->path($media->file_path);

        return response()->file($path, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . ($media->original_filename ?? 'document.pdf') . '"'
        ]);
    }

    private function transformMedia(PrintMedia $media)
    {
        $user = auth('sanctum')->user();
        $hasPendingRequest = false; 

        if ($user) {
            $hasPendingRequest = CreditRequest::where('user_id', $user->id)
                ->where('requestable_id', $media->print_media_id)
                ->where('requestable_type', PrintMedia::class)
                ->where('status', 'pending')
                ->exists();
        }

        $allOwners = $media->owners;

        if ($media->user) {
            $allOwners = $allOwners->concat([$media->user]);
        }

        $uniqueOwners = $allOwners->unique('id')->values();

        return [
            'print_media_id'    => $media->print_media_id,
            'title'             => $media->title,
            'type'              => $media->type,
            'date_published'    => $media->date_published, 
            'description'       => $media->description,
            'byline'            => $media->byline,
            'user_id'           => $media->user_id,
            'owner_name'        => $media->user ? $media->user->name : null,
            
            'owners'            => $uniqueOwners->map(function($owner) {
                return [
                    'id' => $owner->id,
                    'name' => $owner->name,
                ];
            }),

            'has_pending_request' => $hasPendingRequest, 
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