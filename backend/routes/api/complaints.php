<?php

use App\Http\Controllers\Api\Complaints\ComplaintController;
use App\Http\Controllers\Api\Complaints\ComplaintPublicController;
use Illuminate\Support\Facades\Route;

// Public — no auth required
Route::get('/complaints/track/{reference}', [ComplaintPublicController::class, 'track']);

// Salesperson + manager — file and view own complaints
Route::middleware(['auth:sanctum', 'role:salesperson|complaints_manager|admin|super-admin'])->group(function () {
    Route::get('/complaints/my-complaints', [ComplaintController::class, 'myComplaints']);
    Route::post('/complaints', [ComplaintController::class, 'store']);
    Route::get('/complaints/{complaint}', [ComplaintController::class, 'show']);
});

// Complaints manager + admin — full management
Route::middleware(['auth:sanctum', 'role:complaints_manager|admin|super-admin'])->group(function () {
    Route::get('/complaints', [ComplaintController::class, 'index']);
    Route::put('/complaints/{complaint}/status', [ComplaintController::class, 'updateStatus']);
    Route::post('/complaints/{complaint}/assign', [ComplaintController::class, 'assign']);
    Route::post('/complaints/{complaint}/comments', [ComplaintController::class, 'addComment']);
    Route::post('/complaints/{complaint}/attachments', [ComplaintController::class, 'uploadAttachment']);
});
