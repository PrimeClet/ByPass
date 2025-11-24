<?php

namespace App\Http\Controllers;


use App\Services\WhapiService;
use Illuminate\Http\JsonResponse;
use App\Models\AuditLog;
use App\Models\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Requests\CreateRequestRequest;
use App\Http\Requests\ValidateRequestRequest;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use App\Notifications\RequestCreate;
use Carbon\Carbon;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Support\Facades\Notification;
use OpenApi\Attributes as OA;
// use Log;

class RequestController extends Controller
{

    protected $whapiService;

    public function __construct(WhapiService $whapiService)
    {
        $this->whapiService = $whapiService;
    }

    public function sendMessage(Request $request): JsonResponse
    {
        $request->validate([
            'to' => 'required|string',
            'message' => 'required|string|max:4096'
        ]);

        try {
            $to = $this->whapiService->formatPhoneNumber($request->to);
            $result = $this->whapiService->sendTextMessage($to, $request->message);
            
            return response()->json($result);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }


    #[OA\Get(
        path: "/requests",
        summary: "Liste des demandes",
        description: "Récupère la liste des demandes de bypass avec filtres optionnels. Les non-administrateurs ne voient que leurs propres demandes.",
        tags: ["Demandes"],
        security: [["sanctum" => []]],
        parameters: [
            new OA\Parameter(name: "status", in: "query", description: "Filtrer par statut", schema: new OA\Schema(type: "string", enum: ["pending", "approved", "rejected", "in_progress", "completed"])),
            new OA\Parameter(name: "priority", in: "query", description: "Filtrer par priorité", schema: new OA\Schema(type: "string", enum: ["low", "normal", "high", "critical", "emergency"])),
            new OA\Parameter(name: "search", in: "query", description: "Rechercher dans titre, description ou code", schema: new OA\Schema(type: "string")),
            new OA\Parameter(name: "page", in: "query", description: "Numéro de page", schema: new OA\Schema(type: "integer", example: 1)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Liste des demandes paginée",
                content: new OA\MediaType(
                    mediaType: "application/json",
                    schema: new OA\Schema(
                        type: "object",
                        properties: [
                            new OA\Property(property: "data", type: "array", items: new OA\Items(ref: "#/components/schemas/Request")),
                            new OA\Property(property: "current_page", type: "integer"),
                            new OA\Property(property: "total", type: "integer"),
                        ]
                    )
                )
            ),
            new OA\Response(response: 401, description: "Non authentifié", ref: "#/components/schemas/Error"),
        ]
    )]
    public function index(HttpRequest $request)
    {
        $query = Request::with(['validator','requester', 'validator', 'equipment.zone', 'sensor']);

        // Filtres
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('request_code', 'like', "%{$search}%");
            });
        }

        // Seuls les admins peuvent voir toutes les demandes
        if (!auth()->user()->isAdministrator()) {
            $query->where('requester_id', auth()->id());
        }

        $requests = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json($requests);
    }


    public function bypassCode($year = null, $sequence = null) {
        $year = $year ?? date('Y');
        
        // En pratique: requête DB pour obtenir max(sequence) + 1
        if ($sequence === null) {
            $sequence = 1; // ou calcul depuis la base
        }
        
        return sprintf('BR-%d-%03d', $year, $sequence);
    }

    private function sendTextMessage(string $to, string $text): void
    {
        $baseUrl = config('services.whapi.base_url');
        $token = config('services.whapi.token');
        
        if (!$token) {
            Log::warning('Token Whapi non configuré');
            return;
        }
        
        try {

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $token,
                'Content-Type' => 'application/json'
            ])->post($baseUrl . '/messages/text', [
                'to' => $to,
                'body' => $text
            ]);

            Log::info($text);
            Log::info($to);
            
            if ($response->successful()) {
                Log::info('Message envoyé avec succès', [
                    'to' => $to,
                    'response' => $response->json()
                ]);
            } else {
                Log::error('Erreur envoi message', [
                    'to' => $to,
                    'status' => $response->status(),
                    'response' => $response->body()
                ]);
            }
            
        } catch (\Exception $e) {
            Log::error('Exception envoi message', [
                'error' => $e->getMessage(),
                'to' => $to
            ]);
        }
    }

    #[OA\Post(
        path: "/requests",
        summary: "Créer une demande de bypass",
        description: "Crée une nouvelle demande de bypass avec toutes les informations nécessaires",
        tags: ["Demandes"],
        security: [["sanctum" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: "application/json",
                schema: new OA\Schema(
                    required: ["reason", "detailedJustification", "urgencyLevel", "equipmentId", "sensorId", "plannedStartDate", "estimatedDuration", "safetyImpact", "operationalImpact", "environmentalImpact", "mitigationMeasures"],
                    properties: [
                        new OA\Property(property: "reason", type: "string", example: "preventive_maintenance"),
                        new OA\Property(property: "detailedJustification", type: "string", example: "Justification détaillée de la demande"),
                        new OA\Property(property: "urgencyLevel", type: "string", enum: ["low", "normal", "high", "critical", "emergency"], example: "high"),
                        new OA\Property(property: "equipmentId", type: "integer", example: 1),
                        new OA\Property(property: "sensorId", type: "integer", example: 1),
                        new OA\Property(property: "plannedStartDate", type: "string", format: "date-time", example: "2025-01-20T10:00:00Z"),
                        new OA\Property(property: "estimatedDuration", type: "integer", example: 2),
                        new OA\Property(property: "safetyImpact", type: "string", enum: ["very_low", "low", "medium", "high", "very_high"], example: "medium"),
                        new OA\Property(property: "operationalImpact", type: "string", enum: ["very_low", "low", "medium", "high", "very_high"], example: "medium"),
                        new OA\Property(property: "environmentalImpact", type: "string", enum: ["very_low", "low", "medium", "high", "very_high"], example: "low"),
                        new OA\Property(property: "mitigationMeasures", type: "array", items: new OA\Items(type: "string"), example: ["Mesure 1", "Mesure 2"]),
                        new OA\Property(property: "contingencyPlan", type: "string", nullable: true, example: "Plan de contingence"),
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: "Demande créée avec succès",
                content: new OA\MediaType(
                    mediaType: "application/json",
                    schema: new OA\Schema(ref: "#/components/schemas/Request")
                )
            ),
            new OA\Response(response: 422, description: "Erreur de validation", ref: "#/components/schemas/Error"),
            new OA\Response(response: 401, description: "Non authentifié", ref: "#/components/schemas/Error"),
        ]
    )]
    public function store(CreateRequestRequest $request)
    {
        Log::info($request);

        $data = $request->validated();
        $data['requester_id'] = auth()->id();

        Log::info($data);

        $isPriority = '';
        $validUrgencyLevels = ['low', 'normal', 'high'];
        $urgencyLevel = strtolower($request->urgencyLevel); // Convertir en minuscules pour éviter les problèmes de casse


        if(in_array($urgencyLevel, $validUrgencyLevels)){
            $isPriority = 'supervisor';
        }else{
            $isPriority = 'administrator';
        }

        $rqs = Request::all()->count() + 1 ;

        $bypassRequest = Request::create([
            'request_code' => $this->bypassCode(null, $rqs),
            'requester_id' => auth()->id(),
            'title' => $request->reason,
            'description' => $request->detailedJustification,
            'priority' => $request->urgencyLevel,
            'equipment_id' => $request->equipmentId,
            'sensor_id' => $request->sensorId,
            'submitted_at' => now(),
            'validation_required_by_role' => $isPriority,
            'start_time' => $request->plannedStartDate,
            'end_time' => Carbon::parse($request->plannedStartDate)->addHours((int)$request->estimatedDuration),
            'impact_securite' => $request->safetyImpact,
            'impact_operationnel' => $request->operationalImpact,
            'impact_environnemental' => $request->environmentalImpact,
            'mesure_attenuation' => implode(', ',$request->mitigationMeasures),
            'plan_contingence' => $request->contingencyPlan,
        ]);

        $users = [];

        Log::info('Urgency Level: ' . $request->urgencyLevel);

        if(in_array($urgencyLevel, $validUrgencyLevels)){
            $users = User::where('role', 'supervisor')->orWhere('role', 'administrator')->get();
        } else{
            $users = User::Where('role', 'administrator')->get();
        }

        $byPass = $bypassRequest->load(['validator','requester', 'validator', 'equipment.zone', 'sensor']);


        $message = "📌 *Nouvelle Demande Créée*\n" .
           "👤 Demandeur : {$byPass->requester->full_name}\n" .
           "📝 Titre : {$byPass->title}\n" .
           "⚡ Priorité : {$byPass->priority}\n" .
           "📅 Soumis le : " . now()->format('d/m/Y H:i') . "\n" .
           "🔍 Statut : En cours de validation.";

        $phone = ltrim(auth()->user()->phone, '+');

        Log::info('Users: ' . $users);

        $this->sendTextMessage($phone, $message);
        
        Notification::send($users, new RequestCreate($bypassRequest));

        $adminMessage = "📌 *Nouvelle Demande à Valider*\n" .
                "👤 Demandeur : {$byPass->requester->full_name}\n" .
                "📝 Titre : {$byPass->title}\n" .
                "⚡ Priorité : {$byPass->priority}\n" .
                "📅 Soumis le : " . now()->format('d/m/Y H:i') . "\n" .
                "🔍 Statut : En attente de votre validation.\n" .
                "📂 Consultez la demande dans le système pour plus de détails.";

        // Send the message to each administrator
        foreach ($users as $user) {
            if ($user->phone) {
                $adminPhone = ltrim($user->phone, '+');
                $this->sendTextMessage($adminPhone, $adminMessage);
            }
        }

        AuditLog::log(
            'Request Created',
            auth()->user(),
            'Request',
            $bypassRequest->id,
            ['title' => $bypassRequest->title, 'priority' => $bypassRequest->priority]
        );

        return response()->json($bypassRequest->load(['validator','requester', 'validator', 'equipment.zone', 'sensor']), 201);
    }

    #[OA\Get(
        path: "/requests/{request}",
        summary: "Détails d'une demande",
        description: "Récupère les détails d'une demande spécifique",
        tags: ["Demandes"],
        security: [["sanctum" => []]],
        parameters: [
            new OA\Parameter(name: "request", in: "path", required: true, description: "ID de la demande", schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Détails de la demande",
                content: new OA\MediaType(
                    mediaType: "application/json",
                    schema: new OA\Schema(ref: "#/components/schemas/Request")
                )
            ),
            new OA\Response(response: 403, description: "Non autorisé", ref: "#/components/schemas/Error"),
            new OA\Response(response: 404, description: "Demande non trouvée", ref: "#/components/schemas/Error"),
        ]
    )]
    public function show(Request $request)
    {
        $user = auth()->user();
        
        // Vérifier les permissions
        if (!$user->isAdministrator() && $request->requester_id !== $user->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        return response()->json($request->load(['requester', 'validator', 'equipment', 'sensor']));
    }

    #[OA\Put(
        path: "/requests/{request}/validate",
        summary: "Valider ou rejeter une demande",
        description: "Permet à un superviseur ou administrateur de valider ou rejeter une demande de bypass",
        tags: ["Demandes"],
        security: [["sanctum" => []]],
        parameters: [
            new OA\Parameter(name: "request", in: "path", required: true, description: "ID de la demande", schema: new OA\Schema(type: "integer")),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: "application/json",
                schema: new OA\Schema(
                    required: ["validation_status"],
                    properties: [
                        new OA\Property(property: "validation_status", type: "string", enum: ["approved", "rejected"], example: "approved"),
                        new OA\Property(property: "rejection_reason", type: "string", nullable: true, example: "Raison du rejet si applicable"),
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Demande validée/rejetée avec succès",
                content: new OA\MediaType(
                    mediaType: "application/json",
                    schema: new OA\Schema(ref: "#/components/schemas/Request")
                )
            ),
            new OA\Response(response: 403, description: "Non autorisé à valider", ref: "#/components/schemas/Error"),
            new OA\Response(response: 422, description: "Erreur de validation", ref: "#/components/schemas/Error"),
        ]
    )]
    public function validate(ValidateRequestRequest $httpRequest, Request $request)
    {
        $data = $httpRequest->validated();
        
        $request->update([
            'status' => $data['validation_status'],
            'validated_by_id' => auth()->id(),
            'validated_at' => now(),
            'rejection_reason' => $data['rejection_reason'] ?? null,
        ]);

        // Si la requête est approuvée, désactiver le capteur
        if ($data['validation_status'] === 'approved') {
            $sensor = $request->sensor;
            if ($sensor) {
                $sensor->update(['status' => 'inactive']);
                
                AuditLog::log(
                    'Sensor Deactivated',
                    auth()->user(),
                    'Sensor',
                    $sensor->id,
                    ['reason' => 'Bypass request approved', 'request_id' => $request->id]
                );
            }
        }
        
        AuditLog::log(
            'Request ' . ucfirst($data['validation_status']),
            auth()->user(),
            'Request',
            $request->id,
            [
                'title' => $request->title,
                'rejection_reason' => $data['rejection_reason'] ?? null
            ]
        );

        // Charger les relations nécessaires
        $request->load(['requester', 'validator', 'equipment.zone', 'sensor']);

        // Préparer les messages
        $status = ucfirst($data['validation_status']); // Approved ou Rejected
        $requesterMessage = "📌 *Notification : Requête {$status}*\n" .
                            "📝 Titre : {$request->title}\n" .
                            "⚡ Statut : {$status}\n" .
                            ($status === 'Rejected' ? "❌ Raison du rejet : {$data['rejection_reason']}\n" : "") .
                            "📅 Validée le : " . now()->format('d/m/Y H:i') . "\n";

        $directorMessage = "📌 *Notification : Requête {$status}*\n" .
                        "👤 Demandeur : {$request->requester->full_name}\n" .
                        "📝 Titre : {$request->title}\n" .
                        "⚡ Statut : {$status}\n" .
                        ($status === 'Rejected' ? "❌ Raison du rejet : {$data['rejection_reason']}\n" : "") .
                        "📅 Validée le : " . now()->format('d/m/Y H:i') . "\n";

        // Envoyer un message au demandeur
        $this->sendTextMessage(ltrim($request->requester->phone, '+'), $requesterMessage);

        // Envoyer un message aux directeurs (administrateurs)
        $directors = User::where('role', 'administrator')->get();
        foreach ($directors as $director) {
            $this->sendTextMessage(ltrim($director->phone, '+'), $directorMessage);
        }

        return response()->json($request->load(['requester', 'validator', 'equipment', 'sensor']));
    }

    #[OA\Get(
        path: "/requests/mine",
        summary: "Mes demandes",
        description: "Récupère toutes les demandes créées par l'utilisateur connecté",
        tags: ["Demandes"],
        security: [["sanctum" => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: "Liste des demandes de l'utilisateur",
                content: new OA\MediaType(
                    mediaType: "application/json",
                    schema: new OA\Schema(
                        type: "object",
                        properties: [
                            new OA\Property(property: "data", type: "array", items: new OA\Items(ref: "#/components/schemas/Request")),
                        ]
                    )
                )
            ),
        ]
    )]
    public function mine()
    {
        $requests = Request::with(['requester', 'equipment.zone', 'sensor', 'validator'])
                          ->where('requester_id', auth()->id())
                          ->orderBy('created_at', 'desc')
                          ->paginate(15);

        return response()->json($requests);
    }

    #[OA\Get(
        path: "/requests/pending",
        summary: "Demandes en attente de validation",
        description: "Récupère les demandes en attente de validation. Accessible aux superviseurs et administrateurs.",
        tags: ["Demandes"],
        security: [["sanctum" => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: "Liste des demandes en attente",
                content: new OA\MediaType(
                    mediaType: "application/json",
                    schema: new OA\Schema(
                        type: "object",
                        properties: [
                            new OA\Property(property: "data", type: "array", items: new OA\Items(ref: "#/components/schemas/Request")),
                        ]
                    )
                )
            ),
            new OA\Response(response: 403, description: "Non autorisé", ref: "#/components/schemas/Error"),
        ]
    )]
    public function pending()
    {
        if (!auth()->user()->canValidateRequests()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $requests = Request::with(['requester', 'equipment.zone', 'sensor', 'validator'])
                          ->pending()
                          ->where(function($query) {
                              $user = auth()->user();
                              if ($user->role === 'supervisor') {
                                  $query->where('validation_required_by_role', 'supervisor');
                              } elseif ($user->role === 'administrator') {
                                  $query->whereIn('validation_required_by_role', ['supervisor', 'administrator']);
                              }
                          })
                          ->orderBy('created_at', 'asc')
                          ->paginate(15);

        return response()->json($requests);
    }

    #[OA\Get(
        path: "/requests/active",
        summary: "Demandes actives",
        description: "Récupère les demandes actives (approuvées ou en cours). Accessible aux superviseurs et administrateurs.",
        tags: ["Demandes"],
        security: [["sanctum" => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: "Liste des demandes actives",
                content: new OA\MediaType(
                    mediaType: "application/json",
                    schema: new OA\Schema(
                        type: "object",
                        properties: [
                            new OA\Property(property: "data", type: "array", items: new OA\Items(ref: "#/components/schemas/Request")),
                        ]
                    )
                )
            ),
            new OA\Response(response: 403, description: "Non autorisé", ref: "#/components/schemas/Error"),
        ]
    )]
    public function validate_list()
    {
        if (!auth()->user()->canValidateRequests()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $requests = Request::with(['requester', 'equipment.zone', 'sensor'])
                          ->active()
                          ->orderBy('created_at', 'asc')
                          ->paginate(15);

        return response()->json($requests);
    }

    public function update(HttpRequest $httpRequest, Request $request)
    {
        $user = auth()->user();
        
        // Seul le demandeur ou un admin peut modifier
        if (!$user->isAdministrator() && $request->requester_id !== $user->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        // Ne peut pas modifier une demande déjà validée
        if ($request->status !== 'pending') {
            return response()->json(['message' => 'Impossible de modifier une demande déjà traitée'], 422);
        }

        $httpRequest->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'priority' => 'sometimes|in:high,medium,low',
            'location' => 'sometimes|string|max:255',
            'equipment_id' => 'sometimes|nullable|exists:equipment,id',
            'sensor_id' => 'sometimes|nullable|exists:sensors,id',
            'start_time' => 'sometimes|nullable|date|after_or_equal:now',
            'end_time' => 'sometimes|nullable|date|after:start_time',
        ]);

        $request->update($httpRequest->only([
            'title', 'description', 'priority', 'location', 
            'equipment_id', 'sensor_id', 'start_time', 'end_time'
        ]));

        AuditLog::log(
            'Request Updated',
            auth()->user(),
            'Request',
            $request->id,
            ['title' => $request->title]
        );

        return response()->json($request->load(['equipment', 'sensor']));
    }

    #[OA\Delete(
        path: "/requests/{request}",
        summary: "Supprimer une demande",
        description: "Supprime une demande. Seul le demandeur ou un administrateur peut supprimer. Les demandes déjà traitées ne peuvent pas être supprimées.",
        tags: ["Demandes"],
        security: [["sanctum" => []]],
        parameters: [
            new OA\Parameter(name: "request", in: "path", required: true, description: "ID de la demande", schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Demande supprimée avec succès",
                content: new OA\MediaType(
                    mediaType: "application/json",
                    schema: new OA\Schema(
                        properties: [
                            new OA\Property(property: "message", type: "string", example: "Demande supprimée avec succès"),
                        ]
                    )
                )
            ),
            new OA\Response(response: 403, description: "Non autorisé", ref: "#/components/schemas/Error"),
            new OA\Response(response: 422, description: "Impossible de supprimer une demande déjà traitée", ref: "#/components/schemas/Error"),
        ]
    )]
    public function destroy(Request $request)
    {
        $user = auth()->user();
        
        // Seul le demandeur ou un admin peut supprimer
        if (!$user->isAdministrator() && $request->requester_id !== $user->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        // Ne peut pas supprimer une demande déjà validée
        if ($request->status !== 'pending') {
            return response()->json(['message' => 'Impossible de supprimer une demande déjà traitée'], 422);
        }

        AuditLog::log(
            'Request Deleted',
            auth()->user(),
            'Request',
            $request->id,
            ['title' => $request->title]
        );

        $request->delete();

        return response()->json(['message' => 'Demande supprimée avec succès']);
    }

    public function markAsRead(Request $request, $id)
    {
        $notification = auth()->user()->unreadNotifications->find($id);
        $notification->markAsRead();

        return back()->with('success', 'Added Mark as read.');
    }
}
