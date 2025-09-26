<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PublicationController;
use App\Http\Controllers\PrintMediaController;

//Dashboard stats route temporarily disabled due to issues with apiResource method
// Route::apiResource('news/dashboard/stats', [NewsController::class, 'dashboardStats']);

// 📰 News Routes
Route::apiResource('news', NewsController::class);
Route::get('news/dashboard/stats', [NewsController::class, 'dashboardStats']);
Route::post('news/{news}/increment-views', [NewsController::class, 'incrementViews']);

// 👤 User Routes
Route::apiResource('users', UserController::class);

// 📚 Publications Routes
Route::apiResource('publications', PublicationController::class);
Route::get('publications/category/{category}', [PublicationController::class, 'getByCategory']);

// 🗞️ Print Media Routes
Route::apiResource('print-media', PrintMediaController::class);
Route::get('print-media/{id}/view', [PrintMediaController::class, 'viewPdf']);
Route::get('print-media/{id}/download', [PrintMediaController::class, 'downloadPdf']);
