<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PublicationController;
use App\Http\Controllers\PrintMediaController;

Route::apiResource('news', NewsController::class);

// Dashboard statistics
Route::get('/dashboard/stats', [NewsController::class, 'dashboardStats']);
Route::post('/news/{news}/increment-views', [NewsController::class, 'incrementViews']);

// User management routes
Route::apiResource('users', UserController::class);

// Publications routes
Route::apiResource('publications', PublicationController::class);

// Additional routes for publications category filtering
Route::get('/publications/category/{category}', [PublicationController::class, 'getByCategory']);

// Print Media routes
Route::apiResource('print-media', PrintMediaController::class);


