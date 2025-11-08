<?php

use App\Http\Controllers\ZoneController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EquipmentController;
use App\Http\Controllers\RequestController;
use App\Http\Controllers\SensorController;
use App\Http\Controllers\SystemController;
use App\Http\Controllers\UserController;

// Routes d'authentification
Route::post('/auth/login', [AuthController::class, 'login']);

Route::get('/', function(){
    return response()->json([
        'name' => 'ByPass API',
        'Version' => '1.0.0',
        'Decription' => 'api de Bypass realisé par JOBS_conseil'
    ]);
});

Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::get('/notifications', function () {
        return auth()->user()->notifications;
    });

    // Dashboard
    Route::get('/dashboard/summary', [DashboardController::class, 'summary']);
    Route::get('/dashboard/recent-requests', [DashboardController::class, 'recentRequests']);
    Route::get('/dashboard/system-status', [DashboardController::class, 'systemStatus']);

    // Demandes
    Route::get('/requests', [RequestController::class, 'index']);
    Route::post('/requests', [RequestController::class, 'store']);
    Route::get('/requests/mine', [RequestController::class, 'mine']);
    Route::get('/requests/pending', [RequestController::class, 'pending']);
    Route::get('/requests/active', [RequestController::class, 'validate_list']);
    Route::get('/requests/{request}', [RequestController::class, 'show']);
    Route::put('/requests/{request}', [RequestController::class, 'update']);
    Route::delete('/requests/{request}', [RequestController::class, 'destroy']);
    Route::put('/requests/{request}/validate', [RequestController::class, 'validate']);
    Route::get('/notifications/{id}/mark-as-read', [RequestController::class, 'markAsRead'])->name('notifications.mark.as.read');

    //Zones
    Route::get('/zones', [ZoneController::class, 'index']);
    Route::get('/zones/{zone}', [ZoneController::class, 'show']);

    // Équipements
    Route::get('/equipment', [EquipmentController::class, 'index']);
    Route::get('/equipment/{equipment}', [EquipmentController::class, 'show']);


    Route::get('/zones/{zone}/equipements', [EquipmentController::class, 'index_equipements']);

    
    // Routes admin seulement pour les équipements
    Route::middleware('isAdmin:administrator')->group(function () {
        Route::post('/equipment', [EquipmentController::class, 'store']);
        Route::put('/equipment/{equipment}', [EquipmentController::class, 'update']);
        Route::delete('/equipment/{equipment}', [EquipmentController::class, 'destroy']);



        Route::post('/zones', [ZoneController::class, 'store']);
        Route::put('/zones/{zone}', [ZoneController::class, 'update']);
        Route::delete('/zones/{zone}', [ZoneController::class, 'destroy']);
    });

    // Capteurs
    Route::get('/equipment/{equipment}/sensors', [SensorController::class, 'index']);
    Route::get('/sensors/{sensor}', [SensorController::class, 'show']);
    Route::get('/sensors', [SensorController::class, 'showSensor']);
    
    // Routes admin seulement pour les capteurs
    Route::middleware('isAdmin:administrator')->group(function () {
        Route::post('/equipment/{equipment}/sensors', [SensorController::class, 'store']);
        Route::put('/sensors/{sensor}', [SensorController::class, 'update']);
        Route::delete('/sensors/{sensor}', [SensorController::class, 'destroy']);
    });

    // Utilisateurs
    Route::get('/users/{user}', [UserController::class, 'show']);
    
    // Routes admin seulement pour la gestion des utilisateurs
    Route::middleware('isAdmin:administrator')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
        Route::put('/users/{user}', [UserController::class, 'update']);

    });

    // Système et administration
    Route::middleware('isAdmin')->group(function () {
        Route::get('/admin/settings', [SystemController::class, 'getSettings']);
        Route::put('/admin/settings', [SystemController::class, 'updateSettings']);
        Route::get('/history', [SystemController::class, 'getHistory']);
    });
});