<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
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
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $request->session()->regenerate();

        $user = Auth::user();

        $validRoles = [User::ROLE_HILLSIDER, User::ROLE_ALUMNI, User::ROLE_ADMIN];
        if (!in_array($user->role, $validRoles, true)) {
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
            ],
            'redirect' => $redirect,
        ]);
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
            ],
        ]);
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


