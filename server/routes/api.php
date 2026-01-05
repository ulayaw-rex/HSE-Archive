<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PublicationController;
use App\Http\Controllers\PrintMediaController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\UserProfileController;
use App\Http\Controllers\SiteSettingController;
use App\Http\Controllers\CreditRequestController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\SecurityController; 
use App\Http\Controllers\ContactController;
use App\Http\Controllers\ChatBotController; 

// PUBLIC ROUTES


// Status Check
Route::get('/analytics/system-status', [SiteSettingController::class, 'getSystemStatus']);

// Chatbot (AI Assistant)
Route::post('/chat', [ChatBotController::class, 'chat']); 

// Authentication 
Route::post('/register', [AuthController::class, 'register']);
Route::middleware('web')->post('/login', [AuthController::class, 'login']);

// General Site Info 
Route::get('/members', [UserController::class, 'getMembers']);
Route::get('/site-settings/team-photo', [SiteSettingController::class, 'getTeamPhoto']);
Route::get('/site-settings/team-intro', [SiteSettingController::class, 'getTeamIntro']);

// Contact Form (Throttled) 
Route::post('/contact-us', [ContactController::class, 'submit'])
    ->middleware('throttle:2,1');

// Publications (Read-Only) 
Route::get('/publications/search', [PublicationController::class, 'search']);
Route::get('/publications/recent', [PublicationController::class, 'recent']);
Route::get('/publications/category/{category}', [PublicationController::class, 'getByCategory']);
Route::apiResource('publications', PublicationController::class)->only(['index', 'show']);

// Print Media (Read-Only) 
Route::apiResource('print-media', PrintMediaController::class)->only(['index', 'show']);
Route::get('/print-media/{id}/view', [PrintMediaController::class, 'viewPdf']);
Route::get('/print-media/file/{path}', [PrintMediaController::class, 'serveFile'])->where('path', '.*');

// User Profiles 
Route::get('/profile/{id?}', [UserProfileController::class, 'show']);


// PROTECTED ROUTES
Route::middleware(['web', 'auth:sanctum'])->group(function () {

    // Auth User Actions 
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Content Interactions 
    Route::post('/publications', [PublicationController::class, 'store']); // Submit Article
    Route::post('/publications/{id}/request-credit', [PublicationController::class, 'requestCredit']);
    Route::post('/print-media/{id}/request-credit', [PrintMediaController::class, 'requestCredit']);
    Route::get('/print-media/{id}/download', [PrintMediaController::class, 'download']); // Secure Download

    // Comments (ALL Actions: Read, Write, History) 
    Route::get('/publications/{publication}/comments', [CommentController::class, 'index']);
    Route::get('/comments/{id}/history', [CommentController::class, 'history']);
    
    Route::post('/publications/{publication}/comments', [CommentController::class, 'store']);
    Route::put('/comments/{comment}', [CommentController::class, 'update']);
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);

    // Analytics & Security (Staff/Dashboard) 
    Route::prefix('analytics')->group(function () {
        // Content Stats (AnalyticsController)
        Route::get('/articles', [AnalyticsController::class, 'getArticleStats']);
        Route::get('/staff', [AnalyticsController::class, 'getStaffStats']);
        Route::get('/trends', [AnalyticsController::class, 'getTrendStats']);
        Route::get('/export', [AnalyticsController::class, 'exportStats']);
        
        // Security Logs (SecurityController)
        Route::get('/audit', [SecurityController::class, 'getAuditLogs']);
        Route::get('/logins', [SecurityController::class, 'getLoginHistory']);

        // System Lockdown (SiteSettingController) 
        Route::post('/toggle-status', [SiteSettingController::class, 'toggleSystemStatus']);
    });

    // User Search 
    Route::get('/users/search', [UserController::class, 'search']);

    // Admin-Only Routes
    Route::middleware('role:admin')->group(function () {

        // Dashboard & Content Management 
        Route::get('/admin/all-publications', [PublicationController::class, 'index']);
        Route::get('/publications/dashboard/stats', [PublicationController::class, 'dashboardStats']);
        
        // Full CRUD for content
        Route::apiResource('publications', PublicationController::class)->except(['index', 'show', 'store']);
        Route::apiResource('print-media', PrintMediaController::class)->except(['index', 'show']);
        
        // Approvals
        Route::put('/publications/{id}/review', [PublicationController::class, 'review']);

        // User Management 
        Route::put('/users/{id}/approve', [UserController::class, 'approveUser']);
        Route::apiResource('users', UserController::class);

        // Credit Requests 
        Route::get('/admin/credit-requests', [CreditRequestController::class, 'index']);
        Route::put('/admin/credit-requests/{id}/approve', [CreditRequestController::class, 'approve']);
        Route::put('/admin/credit-requests/{id}/reject', [CreditRequestController::class, 'reject']);

        // Feedback / Contact Inquiries 
        Route::get('/admin/contact-submissions', [ContactController::class, 'index']);
        Route::put('/admin/contact-submissions/{id}/read', [ContactController::class, 'markAsRead']);
        Route::delete('/admin/contact-submissions/{id}', [ContactController::class, 'destroy']);
        Route::post('/admin/contact-submissions/{id}/reply', [ContactController::class, 'reply']);
        Route::get('/admin/inquiries/unread-count', [ContactController::class, 'unreadCount']);

        // Site Settings (Write) 
        Route::post('/admin/site-settings/team-photo', [SiteSettingController::class, 'uploadTeamPhoto']);
        Route::post('/admin/site-settings/team-intro', [SiteSettingController::class, 'updateTeamIntro']);
    });
});