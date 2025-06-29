<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Rotas públicas (não protegidas)
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    Route::post('/validate-token', [AuthController::class, 'validateToken']);
});

// Rotas protegidas (requerem autenticação JWT)
Route::middleware('jwt')->prefix('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
});

// Health check
Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'message' => 'Auth Service is running',
        'timestamp' => now()->toISOString(),
        'version' => '1.0.0'
    ]);
});

// Rota de fallback para API
Route::fallback(function () {
    return response()->json([
        'success' => false,
        'message' => 'Endpoint não encontrado'
    ], 404);
});