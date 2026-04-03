<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Events\Verified;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (!Auth::attempt(['email' => $credentials['email'], 'password' => $credentials['password']])) {
            \App\Models\AuditLog::create([
                'action' => 'Failed Login Attempt',
                'details' => "Email: {$credentials['email']}",
                'ip_address' => $request->ip(),
            ]);
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }
        \App\Models\AuditLog::record('Login', 'User logged into the system');

        $request->session()->regenerate();
        $user = Auth::user();

        if ($user->status === 'pending') {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return response()->json([
                'message' => 'Your account is currently under review by the administrator. Please wait for approval.'
            ], 403);
        }

        $validRoles = [User::ROLE_HILLSIDER, User::ROLE_ALUMNI, User::ROLE_ADMIN];
        if (!in_array($user->role, $validRoles, true)) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            
            throw ValidationException::withMessages([
                'email' => ['Your account role is not permitted to login.'],
            ]);
        }

        $redirect = '/';
        if ($user->role === User::ROLE_ADMIN) {
            $redirect = '/admin';
        } else {
            $redirect = '/';
        }

        return response()->json([
            'message' => 'Login successful',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'position' => $user->position,
                'course' => $user->course,     
                'status' => $user->status, 
            ],
            'redirect' => $redirect,
        ]);
    }


    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email:dns|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'course' => 'required|string',
            'position' => 'required|string',
            'role' => 'required|in:hillsider,alumni', 
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            
            'role' => $request->role, 
            'course' => $request->course,
            'position' => $request->position,
            
            'status' => 'pending' 
        ]);

        event(new Registered($user));

        return response()->json([
            'message' => 'Registration successful! Please wait for admin approval.'
        ], 201);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        
        return response()->json([
            'isLoggedIn' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'position' => $user->position, 
                'course' => $user->course,    
                'status' => $user->status,    
                'email_verified_at' => $user->email_verified_at,
            ],
        ]);
    }

    public function resendVerificationEmail(Request $request): JsonResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['message' => 'Already verified']);
        }

        $request->user()->sendEmailVerificationNotification();

        return response()->json(['message' => 'Verification link sent']);
    }

    public function verifyEmail(Request $request, $id, $hash): JsonResponse
    {
        if (!$request->hasValidSignature()) {
            return response()->json(['message' => 'Invalid or expired verification URL.'], 403);
        }

        $user = User::findOrFail($id);

        if (!hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            return response()->json(['message' => 'Invalid hash'], 400);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Already verified'], 200);
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return response()->json(['message' => 'Successfully verified email'], 200);
    }

    public function logout(Request $request): JsonResponse
    {
        try {
            Auth::guard('web')->logout();
    
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            
            $cookie = cookie('laravel_session', '', -1);
            
            return response()
                ->json(['message' => 'Logged out'])
                ->withCookie($cookie);
                
        } catch (\Exception $e) {
            return response()->json(['message' => 'Forced logout'], 200);
        }
    }
}