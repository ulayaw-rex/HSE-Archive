<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password as PasswordRule;

class UserController extends Controller
{

    public function index(): JsonResponse
    {
        $users = User::select('id', 'name', 'email', 'role', 'course', 'position', 'status', 'created_at')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($users);
    }

    public function search(Request $request): JsonResponse
    {
        $query = $request->input('query');

        if (!$query) {
            return response()->json([]);
        }

        $users = User::where('name', 'LIKE', "%{$query}%")
                     ->select('id', 'name') 
                     ->limit(10)
                     ->get();

        return response()->json($users);
    }

public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => [
                'required',
                'string',
                PasswordRule::min(8)->mixedCase()->numbers()->symbols(),
            ],
            'role' => ['required', Rule::in(['guest', 'hillsider', 'alumni', 'admin'])],
            'course' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'course' => $validated['course'] ?? null,
            'position' => $validated['position'] ?? null,
            'status' => 'approved' 
        ]);

        return response()->json([
            'message' => 'User created successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'course' => $user->course,
                'position' => $user->position,
                'status' => $user->status, 
                'created_at' => $user->created_at,
            ]
        ], 201);
    }
    public function show(Request $request, $id = null)
    {
        $viewer = $request->user('sanctum'); 
        $targetUser = null;

        if ($id) {
            $targetUser = User::find($id);
            if (!$targetUser) return response()->json(['message' => 'User not found'], 404);
        } else {
            $targetUser = $viewer;
            if (!$targetUser) return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $isOwner = $viewer && ($viewer->id === $targetUser->id);
        $isAdmin = $viewer && (strtolower(trim($viewer->role ?? '')) === 'admin');

        if ($isOwner || $isAdmin) {
            return response()->json($targetUser);
        } else {
            return response()->json([
                'id' => $targetUser->id,
                'name' => $targetUser->name,
                'role' => $targetUser->role,
                'course' => $targetUser->course,     
                'position' => $targetUser->position, 
                'created_at' => $targetUser->created_at,
            ]);
        }
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => [
                'sometimes',
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'password' => [
                'sometimes',
                'required',
                'string',
                PasswordRule::min(8)->mixedCase()->numbers()->symbols(),
            ],
            'role' => ['sometimes', 'required', Rule::in(['hillsider', 'alumni', 'admin'])],
            'course' => 'nullable|string|max:255',   
            'position' => 'nullable|string|max:255', 
        ]);

        $updateData = [];

        if (isset($validated['name'])) $updateData['name'] = $validated['name'];
        if (isset($validated['email'])) $updateData['email'] = $validated['email'];
        if (isset($validated['role'])) $updateData['role'] = $validated['role'];
        if (isset($validated['password'])) $updateData['password'] = Hash::make($validated['password']);
        
        if (array_key_exists('course', $validated)) $updateData['course'] = $validated['course'];
        if (array_key_exists('position', $validated)) $updateData['position'] = $validated['position'];

        $user->update($updateData);

        return response()->json([
            'message' => 'User updated successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'course' => $user->course,      
                'position' => $user->position,   
                'created_at' => $user->created_at,
            ]
        ]);
    }

    public function approveUser($id): JsonResponse
    {
        $user = User::findOrFail($id);
        
        $user->status = 'approved';
        $user->save();

        return response()->json([
            'message' => 'User approved successfully',
            'user' => $user
        ], 200);
    }

    public function destroy($id): JsonResponse
    {
        $user = User::findOrFail($id);
                
        $user->delete();

        return response()->json([
            'message' => 'User request declined and removed successfully'
        ], 200);
    }
}