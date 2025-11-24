<?php

namespace App\Http\Controllers;

// use Illuminate\Http\Request;
use App\Models\Request;
use App\Models\User;
use App\Models\Equipment;
use App\Models\Sensor;
use Illuminate\Http\Request as HttpRequest;
use OpenApi\Attributes as OA;

class DashboardController extends Controller
{
    #[OA\Get(
        path: "/dashboard/summary",
        summary: "Résumé du tableau de bord",
        description: "Retourne un résumé des statistiques principales du système",
        tags: ["Dashboard"],
        security: [["sanctum" => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: "Résumé du tableau de bord",
                content: new OA\MediaType(
                    mediaType: "application/json",
                    schema: new OA\Schema(
                        properties: [
                            new OA\Property(property: "new_requests", type: "integer", example: 5, description: "Nouvelles demandes"),
                            new OA\Property(property: "active_requests", type: "integer", example: 12, description: "Demandes actives"),
                            new OA\Property(property: "pending_validation", type: "integer", example: 3, description: "Demandes en attente de validation"),
                            new OA\Property(property: "approved_today", type: "integer", example: 2, description: "Demandes approuvées aujourd'hui"),
                            new OA\Property(property: "connected_users", type: "integer", example: 15, description: "Utilisateurs connectés"),
                        ]
                    )
                )
            ),
            new OA\Response(response: 401, description: "Non authentifié", ref: "#/components/schemas/Error"),
        ]
    )]
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

    #[OA\Get(
        path: "/dashboard/recent-requests",
        summary: "Dernières demandes",
        description: "Retourne les 10 dernières demandes créées",
        tags: ["Dashboard"],
        security: [["sanctum" => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: "Liste des dernières demandes",
                content: new OA\MediaType(
                    mediaType: "application/json",
                    schema: new OA\Schema(
                        type: "array",
                        items: new OA\Items(ref: "#/components/schemas/Request")
                    )
                )
            ),
            new OA\Response(response: 401, description: "Non authentifié", ref: "#/components/schemas/Error"),
        ]
    )]
    public function recentRequests()
    {
        $requests = Request::with(['requester', 'equipment.zone', 'sensor', 'validator'])
                          ->orderBy('created_at', 'desc')
                          ->limit(10)
                          ->get();

        return response()->json($requests);
    }

    #[OA\Get(
        path: "/dashboard/system-status",
        summary: "Statut du système",
        description: "Retourne le statut général du système (équipements, capteurs, alertes)",
        tags: ["Dashboard"],
        security: [["sanctum" => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: "Statut du système",
                content: new OA\MediaType(
                    mediaType: "application/json",
                    schema: new OA\Schema(
                        properties: [
                            new OA\Property(property: "monitored_equipment", type: "integer", example: 45, description: "Équipements surveillés"),
                            new OA\Property(property: "online_sensors", type: "integer", example: 120, description: "Capteurs en ligne"),
                            new OA\Property(property: "active_alerts", type: "integer", example: 3, description: "Alertes actives"),
                            new OA\Property(property: "system_performance", type: "number", format: "float", example: 95.5, description: "Performance du système (%)"),
                        ]
                    )
                )
            ),
            new OA\Response(response: 401, description: "Non authentifié", ref: "#/components/schemas/Error"),
        ]
    )]
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
