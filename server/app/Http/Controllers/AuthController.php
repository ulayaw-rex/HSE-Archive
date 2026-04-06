<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\Registered;
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
            'email' => 'required|string|email:rfc,strict|max:255',
            'password' => 'required|string|min:8|confirmed',
            'course' => 'required|string',
            'position' => 'required|string',
            'department' => 'required|string',
            'role' => 'required|in:hillsider,alumni',
            'year_graduated' => 'nullable|required_if:role,alumni|string|max:4',
        ]);

        $existingUser = User::where('email', $request->email)->first();
        if ($existingUser) {
            if ($existingUser->status !== 'pending_otp') {
                return response()->json([
                    'errors' => ['email' => ['The email has already been taken.']]
                ], 422);
            }
            $user = $existingUser;
            $user->update([
                'name' => $request->name,
                'password' => Hash::make($request->password),
                'role' => $request->role,
                'course' => $request->course,
                'position' => $request->position,
                'department' => $request->department,
                'year_graduated' => $request->year_graduated,
            ]);
        } else {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role,
                'course' => $request->course,
                'position' => $request->position,
                'department' => $request->department,
                'year_graduated' => $request->year_graduated,
                'status' => 'pending_otp'
            ]);
        }

        $otp = rand(100000, 999999);
        \Illuminate\Support\Facades\Cache::put('otp_' . $user->id, $otp, now()->addMinutes(15));
        
        $user->notify(new \App\Notifications\RegistrationOtpNotification($otp));

        return response()->json([
            'message' => 'OTP sent to email. Please verify to continue registration.'
        ], 201);
    }

    public function verifyRegistrationOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }
        
        $cachedOtp = \Illuminate\Support\Facades\Cache::get('otp_' . $user->id);

        if (!$cachedOtp || (string)$cachedOtp !== (string)$request->otp) {
            return response()->json(['message' => 'Invalid or expired OTP.'], 400);
        }

        $user->update([
            'status' => 'pending'
        ]);

        \Illuminate\Support\Facades\Cache::forget('otp_' . $user->id);

        event(new Registered($user));

        return response()->json([
            'message' => 'Registration verified! Please wait for admin approval.'
        ], 200);
    }

    public function resendRegistrationOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || $user->status !== 'pending_otp') {
            return response()->json(['message' => 'User not found or already verified.'], 400);
        }

        $otp = rand(100000, 999999);
        \Illuminate\Support\Facades\Cache::put('otp_' . $user->id, $otp, now()->addMinutes(15));

        $user->notify(new \App\Notifications\RegistrationOtpNotification($otp));

        return response()->json([
            'message' => 'A new OTP has been sent.'
        ], 200);
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