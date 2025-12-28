<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PublicationController;
use App\Http\Controllers\PrintMediaController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\UserProfileController;
use App\Http\Controllers\SiteSettingController;
use App\Http\Controllers\CreditRequestController;
use App\Http\Controllers\AnalyticsController;

// Registration Route
Route::post('/register', [AuthController::class, 'register']);

// About Us - Team Members (Read-Only)
Route::get('/members', [UserController::class, 'getMembers']);

// Site Settings (Read-Only)
Route::get('/site-settings/team-photo', [SiteSettingController::class, 'getTeamPhoto']);
Route::get('/site-settings/team-intro', [SiteSettingController::class, 'getTeamIntro']);

// Auth 
Route::middleware('web')->post('login', [AuthController::class, 'login']);
Route::middleware('web')->post('logout', [AuthController::class, 'logout']);

// Publications (Read-Only & Viewing)
Route::get('/publications/search', [PublicationController::class, 'search']);
Route::get('/publications/recent', [PublicationController::class, 'recent']);
Route::get('publications/category/{category}', [PublicationController::class, 'getByCategory']);
Route::apiResource('publications', PublicationController::class)->only(['index', 'show']);

// Print Media (Read-Only & Viewing)
Route::apiResource('print-media', PrintMediaController::class)->only(['index', 'show']);
Route::get('print-media/{id}/view', [PrintMediaController::class, 'viewPdf']);
Route::get('print-media/{id}/download', [PrintMediaController::class, 'downloadPdf']);
Route::get('print-media/file/{path}', [PrintMediaController::class, 'serveFile'])->where('path', '.*');

// User Profiles (Viewing)
Route::get('/profile/{id?}', [UserProfileController::class, 'show']);

// AUTHENTICATED USER ROUTES 
Route::middleware(['web', 'auth:sanctum'])->group(function () {
    
    // Auth
    Route::get('me', [AuthController::class, 'me']);

    // User Profiles
    Route::get('/users/search', [UserController::class, 'search']);
    Route::post('/publications', [PublicationController::class, 'store']);

    // Analytics
    Route::get('/analytics/articles', [AnalyticsController::class, 'getArticleStats']);
    Route::get('/analytics/staff', [AnalyticsController::class, 'getStaffStats']); 
    Route::get('/analytics/export', [AnalyticsController::class, 'exportStats']); 
    Route::get('/analytics/audit', [AnalyticsController::class, 'getAuditLogs']);
    Route::get('/analytics/trends', [AnalyticsController::class, 'getTrendStats']);

    // Comments (Read & Create)
    Route::get('/publications/{publication}/comments', [CommentController::class, 'index']);
    Route::post('/publications/{publication}/comments', [CommentController::class, 'store']);
    
    Route::put('/comments/{comment}', [CommentController::class, 'update']);
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);
    
    // Credit Requests
    Route::post('/publications/{id}/request-credit', [CreditRequestController::class, 'requestCredit']);

    // ADMIN-ONLY ROUTES
    Route::middleware('role:admin')->group(function () {
        
        // User Management 
        Route::put('/users/{id}/approve', [UserController::class, 'approveUser']);
        Route::apiResource('users', UserController::class);

        // News Management 
        Route::get('/admin/all-publications', [PublicationController::class, 'index']);

        // Publications Management 
        Route::get('publications/dashboard/stats', [PublicationController::class, 'dashboardStats']);
        Route::apiResource('publications', PublicationController::class)->except(['index', 'show', 'store']);

        // Print Media Management 
        Route::apiResource('print-media', PrintMediaController::class)->except(['index', 'show']);

        // Reviewing and Approving Articles
        Route::put('/publications/{id}/review', [PublicationController::class, 'review']);

        // Site Settings Management
        Route::post('/admin/site-settings/team-photo', [SiteSettingController::class, 'uploadTeamPhoto']);
        Route::post('/admin/site-settings/team-intro', [SiteSettingController::class, 'updateTeamIntro']);

        // Credit Requests Management
        Route::get('/admin/credit-requests', [CreditRequestController::class, 'index']);
        Route::put('/admin/credit-requests/{id}/approve', [CreditRequestController::class, 'approve']);
        Route::put('/admin/credit-requests/{id}/reject', [CreditRequestController::class, 'reject']);
    });
});