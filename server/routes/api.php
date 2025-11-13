<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PublicationController;
use App\Http\Controllers\PrintMediaController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CommentController;

// 🔐 Auth - Login is public
Route::middleware('web')->post('login', [AuthController::class, 'login']);
Route::middleware('web')->post('logout', [AuthController::class, 'logout']);

// 📰 News (Read-Only)
Route::apiResource('news', NewsController::class)->only(['index', 'show']);
Route::get('publications/category/{category}', [PublicationController::class, 'getByCategory']);

// 📚 Publications (Read-Only)
Route::apiResource('publications', PublicationController::class)->only(['index', 'show']);

// 🗞️ Print Media (Read-Only & Viewing)
Route::apiResource('print-media', PrintMediaController::class)->only(['index', 'show']);
Route::get('print-media/{id}/view', [PrintMediaController::class, 'viewPdf']);
Route::get('print-media/{id}/download', [PrintMediaController::class, 'downloadPdf']);
Route::get('print-media/file/{path}', [PrintMediaController::class, 'serveFile'])->where('path', '.*');


// --- 2. AUTHENTICATED USER ROUTES ---
Route::middleware(['web', 'auth:sanctum'])->group(function () {
    
    // 🔐 Auth
    Route::get('me', [AuthController::class, 'me']);

    // 📰 News
    Route::post('news/{news}/increment-views', [NewsController::class, 'incrementViews']);

    // 💬 Comments (Read & Create)
    Route::get('/publications/{publication}/comments', [CommentController::class, 'index']);
    Route::post('/publications/{publication}/comments', [CommentController::class, 'store']);
    
    // --- ADD THESE TWO LINES FOR EDIT/DELETE ---
    Route::put('/comments/{comment}', [CommentController::class, 'update']);
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);
    // ---------------------------------------------
    

    // --- 3. ADMIN-ONLY ROUTES ---
    Route::middleware('role:admin')->group(function () {
        
        // 👤 User Management (Full CRUD for Admins)
        Route::apiResource('users', UserController::class);

        // 📰 News Management (Create, Update, Delete for Admins)
        Route::apiResource('news', NewsController::class)->except(['index', 'show']);
        Route::get('news/dashboard/stats', [NewsController::class, 'dashboardStats']);

        // 📚 Publications Management (Create, Update, Delete for Admins)
        Route::apiResource('publications', PublicationController::class)->except(['index', 'show']);

        // 🗞️ Print Media Management (Create, Update, Delete for Admins)
        Route::apiResource('print-media', PrintMediaController::class)->except(['index', 'show']);
    });
});