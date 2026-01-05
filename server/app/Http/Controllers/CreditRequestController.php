<?php

namespace App\Http\Controllers;

use App\Models\CreditRequest;
use App\Models\Publication;
use App\Models\PrintMedia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CreditRequestController extends Controller
{
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
            return response()->json(['message' => 'The requested item no longer exists.'], 404);
        }

        if ($request->requestable_type === Publication::class || $request->requestable instanceof Publication) {
            $request->requestable->writers()->syncWithoutDetaching([$request->user_id]);
        } 
        elseif ($request->requestable_type === PrintMedia::class || $request->requestable instanceof PrintMedia) {
            

            $request->requestable->owners()->syncWithoutDetaching([$request->user_id]);
        }

        $request->update(['status' => 'approved']);

        return response()->json(['message' => 'Request approved successfully.']);
    }

    public function reject($id)
    {
        $request = CreditRequest::findOrFail($id);
        $request->update(['status' => 'rejected']);

        return response()->json(['message' => 'Request rejected.']);
    }
}