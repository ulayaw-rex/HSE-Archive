<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\UserController;

Route::get('/news', [NewsController::class, 'index']);
Route::get('/news/{news}', [NewsController::class, 'show']);
Route::post('/news', [NewsController::class, 'store']);
Route::put('/news/{news}', [NewsController::class, 'update']);
Route::delete('/news/{news}', [NewsController::class, 'destroy']);

// Dashboard statistics
Route::get('/dashboard/stats', [NewsController::class, 'dashboardStats']);
Route::post('/news/{news}/increment-views', [NewsController::class, 'incrementViews']);

// User management routes
Route::get('/users', [UserController::class, 'index']);
Route::post('/users', [UserController::class, 'store']);
Route::get('/users/{user}', [UserController::class, 'show']);
Route::put('/users/{user}', [UserController::class, 'update']);
Route::delete('/users/{user}', [UserController::class, 'destroy']);


