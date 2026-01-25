<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PublicationController;
use App\Http\Controllers\PrintMediaController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\UserProfileController; // Optional if using dedicated profile endpoint
use App\Http\Controllers\SiteSettingController;
use App\Http\Controllers\CreditRequestController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\SecurityController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\ChatBotController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\DashboardController;

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES (No Login Required)
|--------------------------------------------------------------------------
| These routes are accessible to everyone. The Controllers handle 
| logic to determine what specific data a Guest vs User sees.
*/

// --- Authentication ---
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// --- Homepage & News ---
Route::get('/home-data', [HomeController::class, 'index']);
Route::get('/publications/news-hub', [HomeController::class, 'getNewsHubData']);

// --- Publications (Read Access) ---
Route::get('/publications/search', [PublicationController::class, 'search']);
Route::get('/publications/recent', [PublicationController::class, 'recent']);
Route::get('/publications/category/{category}', [PublicationController::class, 'getByCategory']);
// ✅ MOVED TO PUBLIC: Fixes "Guest" empty array issue
Route::get('/publications', [PublicationController::class, 'index']); 
Route::get('/publications/{publication}', [PublicationController::class, 'show']);

// --- Profiles & Members (Read Access) ---
// ✅ MOVED TO PUBLIC: Fixes "401" on Profile Page
Route::get('/users/{id}', [UserController::class, 'show']); 
Route::get('/members', [UserController::class, 'getMembers']);

// --- Print Media ---
Route::apiResource('print-media', PrintMediaController::class)->only(['index', 'show']);
Route::get('/print-media/{id}/view', [PrintMediaController::class, 'viewPdf']);
Route::get('/print-media/file/{path}', [PrintMediaController::class, 'serveFile'])->where('path', '.*');

// --- System & Utils ---
Route::get('/analytics/system-status', [SiteSettingController::class, 'getSystemStatus']);
Route::get('/site-settings/team-photo', [SiteSettingController::class, 'getTeamPhoto']);
Route::get('/site-settings/team-intro', [SiteSettingController::class, 'getTeamIntro']);
Route::post('/chat', [ChatBotController::class, 'chat']);
Route::post('/contact-us', [ContactController::class, 'submit'])->middleware('throttle:2,1');


/*
|--------------------------------------------------------------------------
| PROTECTED ROUTES (Login Required)
|--------------------------------------------------------------------------
| Requires valid Cookie or Bearer Token.
*/
Route::middleware(['auth:sanctum'])->group(function () {

    // --- User Context ---
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/users/search', [UserController::class, 'search']);
    Route::put('/users/{id}', [UserController::class, 'update']); // Edit own profile

    // --- Publication Actions ---
    Route::post('/publications', [PublicationController::class, 'store']);
    Route::put('/publications/{publication}', [PublicationController::class, 'update']);
    Route::delete('/publications/{publication}', [PublicationController::class, 'destroy']);
    Route::post('/publications/{id}/status', [PublicationController::class, 'updateStatus']); // Workflow
    
    // --- Credits & Downloads ---
    Route::post('/publications/{id}/request-credit', [CreditRequestController::class, 'store']);
    Route::post('/print-media/{id}/request-credit', [CreditRequestController::class, 'storePrintMedia']);
    Route::get('/print-media/{id}/download', [PrintMediaController::class, 'download']);
    Route::get('/print-media/user/{id}', [PrintMediaController::class, 'getByUser']);

    // --- Comments ---
    Route::get('/publications/{publication}/comments', [CommentController::class, 'index']);
    Route::post('/publications/{publication}/comments', [CommentController::class, 'store']);
    Route::put('/comments/{comment}', [CommentController::class, 'update']);
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);
    Route::get('/comments/{id}/history', [CommentController::class, 'history']);

    // --- Staff Analytics ---
    Route::prefix('analytics')->group(function () {
        Route::get('/articles', [AnalyticsController::class, 'getArticleStats']);
        Route::get('/staff', [AnalyticsController::class, 'getStaffStats']);
        Route::get('/trends', [AnalyticsController::class, 'getTrendStats']);
        Route::get('/export', [AnalyticsController::class, 'exportStats']);
        Route::get('/audit', [SecurityController::class, 'getAuditLogs']);
        Route::get('/logins', [SecurityController::class, 'getLoginHistory']);
        Route::post('/toggle-status', [SiteSettingController::class, 'toggleSystemStatus']);
    });

    // =====================================================================
    // ADMIN ROUTES
    // =====================================================================
    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/dashboard', [DashboardController::class, 'index']);
        
        // Full Content Access
        Route::get('/admin/all-publications', [PublicationController::class, 'index']);
        
        // User Management
        Route::get('/users', [UserController::class, 'index']); 
        Route::delete('/users/{id}', [UserController::class, 'destroy']); 
        Route::put('/users/{id}/approve', [UserController::class, 'approveUser']);
        Route::post('/users', [UserController::class, 'store']); 

        // Requests & Feedback
        Route::get('/admin/credit-requests', [CreditRequestController::class, 'index']);
        Route::put('/admin/credit-requests/{id}/approve', [CreditRequestController::class, 'approve']);
        Route::put('/admin/credit-requests/{id}/reject', [CreditRequestController::class, 'reject']);

        Route::get('/admin/contact-submissions', [ContactController::class, 'index']);
        Route::put('/admin/contact-submissions/{id}/read', [ContactController::class, 'markAsRead']);
        Route::delete('/admin/contact-submissions/{id}', [ContactController::class, 'destroy']);
        Route::post('/admin/contact-submissions/{id}/reply', [ContactController::class, 'reply']);
        Route::get('/admin/inquiries/unread-count', [ContactController::class, 'unreadCount']);

        // Settings
        Route::post('/admin/site-settings/team-photo', [SiteSettingController::class, 'uploadTeamPhoto']);
        Route::post('/admin/site-settings/team-intro', [SiteSettingController::class, 'updateTeamIntro']);
    });
});