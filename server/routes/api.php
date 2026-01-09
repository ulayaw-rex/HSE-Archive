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
use App\Http\Controllers\HomeController;
use App\Http\Controllers\DashboardController; 


//  Homepage & News Hub 
Route::get('/home-data', [HomeController::class, 'index']);
Route::get('/publications/news-hub', [HomeController::class, 'getNewsHubData']);

//  Content Access (Read-Only) 
Route::get('/publications/search', [PublicationController::class, 'search']);
Route::get('/publications/recent', [PublicationController::class, 'recent']);
Route::get('/publications/category/{category}', [PublicationController::class, 'getByCategory']);
Route::apiResource('publications', PublicationController::class)->only(['index', 'show']);

//  Print Media Access 
Route::apiResource('print-media', PrintMediaController::class)->only(['index', 'show']);
Route::get('/print-media/{id}/view', [PrintMediaController::class, 'viewPdf']);
Route::get('/print-media/file/{path}', [PrintMediaController::class, 'serveFile'])->where('path', '.*');

//  Authentication & Users 
Route::post('/register', [AuthController::class, 'register']);
Route::middleware('web')->post('/login', [AuthController::class, 'login']);
Route::get('/members', [UserController::class, 'getMembers']);
Route::get('/profile/{id?}', [UserProfileController::class, 'show']);

//  System & Utils 
Route::get('/analytics/system-status', [SiteSettingController::class, 'getSystemStatus']);
Route::get('/site-settings/team-photo', [SiteSettingController::class, 'getTeamPhoto']);
Route::get('/site-settings/team-intro', [SiteSettingController::class, 'getTeamIntro']);
Route::post('/chat', [ChatBotController::class, 'chat']); 
Route::post('/contact-us', [ContactController::class, 'submit'])->middleware('throttle:2,1');


// Protected Routes (Login Required)
Route::middleware(['web', 'auth:sanctum'])->group(function () {

    //  User Actions 
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/users/search', [UserController::class, 'search']);

    //  Writer/Content Actions 
    Route::post('/publications', [PublicationController::class, 'store']); 
    
    Route::post('/publications/{id}/request-credit', [CreditRequestController::class, 'store']); 
    
    Route::post('/print-media/{id}/request-credit', [CreditRequestController::class, 'storePrintMedia']);
    Route::get('/print-media/{id}/download', [PrintMediaController::class, 'download']);

    //  Comments (Read/Write/Delete) 
    Route::get('/publications/{publication}/comments', [CommentController::class, 'index']);
    Route::post('/publications/{publication}/comments', [CommentController::class, 'store']);
    Route::put('/comments/{comment}', [CommentController::class, 'update']);
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);
    Route::get('/comments/{id}/history', [CommentController::class, 'history']);

    //  Staff Analytics & Security (Shared Dashboard) 
    Route::prefix('analytics')->group(function () {
        Route::get('/articles', [AnalyticsController::class, 'getArticleStats']);
        Route::get('/staff', [AnalyticsController::class, 'getStaffStats']);
        Route::get('/trends', [AnalyticsController::class, 'getTrendStats']);
        Route::get('/export', [AnalyticsController::class, 'exportStats']);
        Route::get('/audit', [SecurityController::class, 'getAuditLogs']);
        Route::get('/logins', [SecurityController::class, 'getLoginHistory']);
        Route::post('/toggle-status', [SiteSettingController::class, 'toggleSystemStatus']);
    });

    //  Admin Routes 
    Route::middleware('role:admin')->group(function () {

        //  DASHBOARD 
        Route::get('/admin/dashboard', [DashboardController::class, 'index']); 
        
        //  Content Management (Approvals & Edits) 
        Route::get('/admin/all-publications', [PublicationController::class, 'index']); 
        Route::put('/publications/{id}/review', [PublicationController::class, 'review']); 
        
        // Full CRUD Access
        Route::apiResource('publications', PublicationController::class)->except(['index', 'show', 'store']);
        Route::apiResource('print-media', PrintMediaController::class)->except(['index', 'show']);

        //  User Management 
        Route::put('/users/{id}/approve', [UserController::class, 'approveUser']);
        Route::apiResource('users', UserController::class);

        //  Credit Request Approvals 
        Route::get('/admin/credit-requests', [CreditRequestController::class, 'index']);
        Route::put('/admin/credit-requests/{id}/approve', [CreditRequestController::class, 'approve']);
        Route::put('/admin/credit-requests/{id}/reject', [CreditRequestController::class, 'reject']);

        //  Contact & Feedback 
        Route::get('/admin/contact-submissions', [ContactController::class, 'index']);
        Route::put('/admin/contact-submissions/{id}/read', [ContactController::class, 'markAsRead']);
        Route::delete('/admin/contact-submissions/{id}', [ContactController::class, 'destroy']);
        Route::post('/admin/contact-submissions/{id}/reply', [ContactController::class, 'reply']);
        Route::get('/admin/inquiries/unread-count', [ContactController::class, 'unreadCount']);

        //  Site Settings 
        Route::post('/admin/site-settings/team-photo', [SiteSettingController::class, 'uploadTeamPhoto']);
        Route::post('/admin/site-settings/team-intro', [SiteSettingController::class, 'updateTeamIntro']);
    });
});