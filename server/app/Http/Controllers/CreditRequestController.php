<?php

namespace App\Http\Controllers;

use App\Models\CreditRequest;
use App\Models\Publication;
use App\Models\PrintMedia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CreditRequestController extends Controller
{
    public function store(Request $request, $publicationId)
    {
        $publication = Publication::findOrFail($publicationId);
        $user = $request->user();

        if ($publication->writers->contains($user->id)) {
            return response()->json(['message' => 'You are already credited as a writer.'], 422);
        }

        $existingRequest = CreditRequest::where('user_id', $user->id)
            ->where('requestable_id', $publicationId)
            ->where('requestable_type', Publication::class)
            ->where('status', 'pending')
            ->first();

        if ($existingRequest) {
            return response()->json(['message' => 'Request already pending.'], 409);
        }

        CreditRequest::create([
            'user_id' => $user->id,
            'requestable_id' => $publicationId,
            'requestable_type' => Publication::class,
            'status' => 'pending',
        ]);

        return response()->json(['message' => 'Credit request submitted successfully.']);
    }

    public function storePrintMedia(Request $request, $id)
    {
        $media = PrintMedia::findOrFail($id);
        $user = $request->user();

        if ($media->owners->contains($user->id)) {
            return response()->json(['message' => 'You are already credited on this issue.'], 422);
        }

        $existingRequest = CreditRequest::where('user_id', $user->id)
            ->where('requestable_id', $id)
            ->where('requestable_type', PrintMedia::class)
            ->where('status', 'pending')
            ->first();

        if ($existingRequest) {
            return response()->json(['message' => 'Request already pending.'], 409);
        }

        CreditRequest::create([
            'user_id' => $user->id,
            'requestable_id' => $id,
            'requestable_type' => PrintMedia::class,
            'status' => 'pending',
        ]);

        return response()->json(['message' => 'Credit request submitted successfully.']);
    }

    public function index()
    {
        $requests = CreditRequest::with(['user', 'requestable']) 
            ->where('status', 'pending')
            ->latest()
            ->get();

        return response()->json($requests);
    }
 
    public function approve($id)
    {
        $request = CreditRequest::with('requestable')->findOrFail($id);

        if (!$request->requestable) {
            $request->delete(); 
            return response()->json(['message' => 'The requested item no longer exists. Orphaned request cleared.']);
        }

        if ($request->requestable_type === Publication::class || $request->requestable instanceof Publication) {
            $request->requestable->writers()->syncWithoutDetaching([$request->user_id]);
        } 
        elseif ($request->requestable_type === PrintMedia::class || $request->requestable instanceof PrintMedia) {
            if (method_exists($request->requestable, 'owners')) {
                $request->requestable->owners()->syncWithoutDetaching([$request->user_id]);
            }
        }

        $request->update(['status' => 'approved']);

        return response()->json(['message' => 'Request approved successfully.']);
    }

    public function reject($id)
    {
        $request = CreditRequest::with('requestable')->findOrFail($id);
        
        if (!$request->requestable) {
            $request->delete();
            return response()->json(['message' => 'The requested item no longer exists. Orphaned request cleared.']);
        }

        $request->update(['status' => 'rejected']);

        return response()->json(['message' => 'Request rejected.']);
    }
}