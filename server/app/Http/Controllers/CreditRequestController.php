<?php

namespace App\Http\Controllers;

use App\Models\CreditRequest;
use App\Models\Publication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CreditRequestController extends Controller
{

    public function index()
    {
        $requests = CreditRequest::with(['user', 'publication'])
            ->where('status', 'pending')
            ->latest()
            ->get();

        return response()->json($requests);
    }
    public function requestCredit($id)
    {
        $user = Auth::user();
        
        $publication = Publication::where('publication_id', $id)->firstOrFail();

        if ($publication->writers->contains($user->id)) {
            return response()->json(['message' => 'You are already credited as a writer.'], 422);
        }

        $existingRequest = CreditRequest::where('user_id', $user->id)
            ->where('publication_id', $id)
            ->first();

        if ($existingRequest) {
            return response()->json(['message' => 'You have already submitted a request.'], 409);
        }

        CreditRequest::create([
            'user_id' => $user->id,
            'publication_id' => $id,
            'status' => 'pending'
        ]);

        return response()->json(['message' => 'Request submitted successfully.']);
    }
    
    public function approve($id)
    {
        $request = CreditRequest::findOrFail($id);
        
        $request->publication->writers()->syncWithoutDetaching([$request->user_id]);

        $request->update(['status' => 'approved']);

        return response()->json(['message' => 'User added as writer successfully.']);
    }

    public function reject($id)
    {
        $request = CreditRequest::findOrFail($id);
        $request->update(['status' => 'rejected']);

        return response()->json(['message' => 'Request rejected.']);
    }
}