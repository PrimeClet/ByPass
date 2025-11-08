<?php

namespace App\Http\Controllers;

// use Illuminate\Http\Request;
use App\Models\Request;
use App\Models\User;
use App\Models\Equipment;
use App\Models\Sensor;
use Illuminate\Http\Request as HttpRequest;

class DashboardController extends Controller
{
    public function summary()
    {
        $data = [
            'new_requests' => Request::pending()->count(),
            'active_requests' => Request::active()->count(),
            'pending_validation' => Request::pending()->count(),
            'approved_today' => Request::approvedToday()->count(),
            'connected_users' => User::where('is_active', true)->count(),
        ];

        return response()->json($data);
    }

    public function recentRequests()
    {
        $requests = Request::with(['requester', 'equipment.zone', 'sensor', 'validator'])
                          ->orderBy('created_at', 'desc')
                          ->limit(10)
                          ->get();

        return response()->json($requests);
    }

    public function systemStatus()
    {
        $totalEquipment = Equipment::count();
        $activeEquipment = Equipment::active()->count();

        $totalSensors = Sensor::count();
        $onlineSensors = Sensor::online()->count();

        $totalAlerts = Request::count();
        $activeAlerts = Request::where('status', 'approved')->count();

        // Calculer les ratios
        $equipmentPerformance = $totalEquipment > 0 ? ($activeEquipment / $totalEquipment) * 100 : 0;
        $sensorPerformance = $totalSensors > 0 ? ($onlineSensors / $totalSensors) * 100 : 0;
        $alertPerformance = $totalAlerts > 0 ? ((1 - ($activeAlerts / $totalAlerts)) * 100) : 100;

        // Moyenne pondérée des performances
        $systemPerformance = ($equipmentPerformance * 0.4) + ($sensorPerformance * 0.4) + ($alertPerformance * 0.2);

        $data = [
            'monitored_equipment' => $activeEquipment,
            'online_sensors' => $onlineSensors,
            'active_alerts' => $activeAlerts,
            'system_performance' => round($systemPerformance, 2), // Arrondi à 2 décimales
        ];

        return response()->json($data);
    }
}
