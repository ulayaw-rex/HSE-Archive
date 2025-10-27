<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  $role  // This $role will be 'admin' from your route
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        // 1. Check if the user is logged in
        // 2. Check if their role matches the role required by the route
        if (!Auth::check() || Auth::user()->role !== $role) {
            
            // If not, reject the request with a "Forbidden" error
            return response()->json(['message' => 'This action is unauthorized.'], 403);
        }

        // If the user is an admin, allow the request to continue
        return $next($request);
    }
}