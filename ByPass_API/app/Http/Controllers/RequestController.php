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
use App\Notifications\RequestUpdate;
use App\Notifications\RequestValidated;
use App\Notifications\RequestLevel1Approved;
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
        if (!auth()->user()->hasPermissionTo('requests.view.all')) {
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

    public function sendInteractiveMediaMessages(string $to, string $bodyText, array $quickReplies): void
    {
        $baseUrl = config('services.whapi.base_url');
        $token = config('services.whapi.token');
        
        if (!$token) return;
        
        $buttons = [];
        foreach ($quickReplies as $reply) {
            $button = [
                'type' => $reply['type'] ?? 'quick_reply',
                'id' => $reply['id'],
                'title' => $reply['title']
            ];
            
            if (isset($reply['url'])) $button['url'] = $reply['url'];
            if (isset($reply['phone_number'])) $button['phone_number'] = $reply['phone_number'];
            
            $buttons[] = $button;
        }
         
        $payload = [
            'to' => $to,
            'header' => [
                'text' => "ByPass Systeme de Notification"
            ],
            'body' => ['text' => $bodyText],
            'type' => 'button',
            'action' => ['buttons' => $buttons]
        ];

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $token,
                'Content-Type' => 'application/json'
            ])->post($baseUrl . '/messages/interactive', $payload);
           
            if ($response->successful()) {
                Log::info('Message media envoyé', ['to' => $to]);
            }
        } catch (\Exception $e) {
            Log::error('Exception envoi media', ['error' => $e->getMessage()]);
        }
    }


    private function getReasonLabel(string $key): string
    {
        $reasonLabels = [
            'preventive_maintenance' => 'Maintenance préventive',
            'corrective_maintenance' => 'Maintenance corrective',
            'calibration' => 'Étalonnage',
            'testing' => 'Tests',
            'emergency_repair' => 'Réparation d\'urgence',
            'system_upgrade' => 'Mise à niveau système',
            'investigation' => 'Investigation',
            'other' => 'Autre'
        ];

        return $reasonLabels[$key] ?? $key;
    }

    private function getUrgencyLabel(string $key): string
    {
        $urgencyLabels = [
            'low' => 'Faible',
            'normal' => 'Normale',
            'high' => 'Élevée',
            'critical' => 'Critique',
            'emergency' => 'Urgence'
        ];

        return $urgencyLabels[$key] ?? $key;
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

        $requestData = [
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
            'plan_contingence' => $request->contingencyPlan ?? null,
        ];
        
        // Pour les demandes critical/emergency, initialiser les champs de double validation
        if (in_array($urgencyLevel, ['critical', 'emergency'])) {
            $requestData['validation_status_level1'] = 'pending';
            $requestData['validation_status_level2'] = 'pending';
        }
        
        $bypassRequest = Request::create($requestData);

        $users = [];

        Log::info('Urgency Level: ' . $request->urgencyLevel);

        if(in_array($urgencyLevel, $validUrgencyLevels)){
            // Demandes normales : notifier supervisors et administrators (validation niveau 1)
            $users = User::permission('requests.validate.level1')->get();
        } else{
            // Demandes critical/emergency : notifier d'abord les supervisors pour validation niveau 1
            $users = User::permission('requests.validate.level1')->get();
        }

        // Recharger la demande avec toutes les relations nécessaires
        $bypassRequest->refresh();
        $byPass = $bypassRequest->load(['requester', 'equipment.zone', 'sensor']);

        $message = "📌 *Nouvelle Demande Créée*\n" .
           "👤 Demandeur : {$byPass->requester->full_name}\n" .
           "📝 Titre : {$this->getReasonLabel($byPass->title)}\n" .
           "⚡ Priorité : {$this->getUrgencyLabel($byPass->priority)}\n" .
           "📅 Soumis le : " . now()->format('d/m/Y H:i') . "\n" .
           "🔍 Statut : En cours de validation.";

        // Envoyer un message au demandeur (gestion d'erreur sans bloquer)
        if (auth()->user()->phone) {
            try {
        $phone = ltrim(auth()->user()->phone, '+');
        $this->sendTextMessage($phone, $message);
            } catch (\Exception $e) {
                Log::warning('Erreur envoi WhatsApp au demandeur: ' . $e->getMessage());
            }
        }
        
        Log::info('Users to notify: ' . $users->count());

        // Envoyer les notifications via Laravel Notification (database, broadcast, mail)
        // Gestion d'erreur pour ne pas bloquer la création de la requête
        if ($users->isNotEmpty()) {
            try {
        Notification::send($users, new RequestCreate($bypassRequest));
            } catch (\Exception $e) {
                Log::warning('Erreur envoi notifications: ' . $e->getMessage());
                // Essayer d'envoyer au moins en base de données
                try {
                    foreach ($users as $user) {
                        $user->notify(new RequestCreate($bypassRequest));
                    }
                } catch (\Exception $e2) {
                    Log::error('Erreur critique envoi notifications DB: ' . $e2->getMessage());
                }
            }
        }

        $adminMessage = "📌 *Nouvelle Demande à Valider*\n" .
                "👤 Demandeur : {$byPass->requester->full_name}\n" .
                "📝 Titre : {$this->getReasonLabel($byPass->title)}\n" .
                "⚡ Priorité : {$this->getUrgencyLabel($byPass->priority)}\n".
                "📅 Soumis le : " . now()->format('d/m/Y H:i') . "\n" .
                "🔍 Statut : En attente de votre validation.\n" .
                "📂 Consultez la demande dans le système pour plus de détails.";

        $quickReplies = [
            ['id' => 'web', 'title' => '🌐 Listes à valider', 'type' => 'url', 'url' => env('APP_URL').'/validation']
        ];
                

        // Send the message to each administrator (gestion d'erreur sans bloquer)
        foreach ($users as $user) {
            if ($user->phone) {
                try {
                $adminPhone = ltrim($user->phone, '+');
                $this->sendInteractiveMediaMessages($adminPhone, $adminMessage, $quickReplies);
                } catch (\Exception $e) {
                    Log::warning("Erreur envoi WhatsApp à {$user->full_name}: " . $e->getMessage());
                }
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
        if (!$user->hasPermissionTo('requests.view.all') && $request->requester_id !== $user->id) {
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
        $user = auth()->user();
        $requiresDualValidation = $request->requiresDualValidation();
        
        // Vérifier les permissions selon le type de validation
        if ($requiresDualValidation) {
            // Pour les demandes critical/emergency, vérifier les permissions
            if ($user->canValidateLevel1() && !$user->canValidateLevel2()) {
                // Validation niveau 1
        $request->update([
                    'validated_by_level1_id' => $user->id,
                    'validated_at_level1' => now(),
                    'validation_status_level1' => $data['validation_status'],
                    'rejection_reason_level1' => $data['validation_status'] === 'rejected' ? ($data['rejection_reason'] ?? null) : null,
                ]);
                
                AuditLog::log(
                    'Request Validation Level 1 ' . ucfirst($data['validation_status']),
                    $user,
                    'Request',
                    $request->id,
                    [
                        'title' => $request->title,
                        'level' => 1,
                        'rejection_reason' => $data['rejection_reason'] ?? null
                    ]
                );
                
                // Si rejetée au niveau 1, rejeter la demande complète
                if ($data['validation_status'] === 'rejected') {
                    $request->update(['status' => 'rejected']);
                    $request->refresh();
                    $this->sendValidationNotifications($request, 'rejected', $data['rejection_reason'] ?? null, 1);
                    return response()->json($request->load(['requester', 'validatorLevel1', 'validatorLevel2', 'equipment.zone', 'sensor']));
                }
                
                // Si approuvée au niveau 1, notifier les administrateurs pour validation niveau 2
        if ($data['validation_status'] === 'approved') {
                    $request->refresh();
                    $this->sendLevel1ApprovalNotification($request);
                }
                
            } elseif ($user->canValidateLevel2()) {
                // Validation niveau 2 (administrator ou director)
                // Vérifier que le niveau 1 est déjà approuvé
                if ($request->validation_status_level1 !== 'approved') {
                    return response()->json([
                        'message' => 'La validation niveau 1 (supervisor) doit être approuvée avant la validation niveau 2'
                    ], 422);
                }
                
                $request->update([
                    'validated_by_level2_id' => $user->id,
                    'validated_at_level2' => now(),
                    'validation_status_level2' => $data['validation_status'],
                    'rejection_reason_level2' => $data['validation_status'] === 'rejected' ? ($data['rejection_reason'] ?? null) : null,
                ]);
                
                AuditLog::log(
                    'Request Validation Level 2 ' . ucfirst($data['validation_status']),
                    $user,
                    'Request',
                    $request->id,
                    [
                        'title' => $request->title,
                        'level' => 2,
                        'rejection_reason' => $data['rejection_reason'] ?? null
                    ]
                );
                
                // Si rejetée au niveau 2, rejeter la demande complète
                if ($data['validation_status'] === 'rejected') {
                    $request->update(['status' => 'rejected']);
                    $request->refresh();
                    $this->sendValidationNotifications($request, 'rejected', $data['rejection_reason'] ?? null, 2);
                    return response()->json($request->load(['requester', 'validatorLevel1', 'validatorLevel2', 'equipment.zone', 'sensor']));
                }
                
                // Si approuvée au niveau 2, approuver la demande et désactiver le capteur
                if ($data['validation_status'] === 'approved') {
                    $request->update([
                        'status' => 'approved',
                        'validated_by_id' => $user->id,
                        'validated_at' => now(),
                    ]);
                    
                    // Désactiver le capteur uniquement maintenant que les deux validations sont approuvées
            $sensor = $request->sensor;
            $equipement = $request->equipment;
            if ($sensor) {
                $sensor->update(['status' => 'bypassed']);
                $equipement->update(['status' => 'maintenance']);
                
                AuditLog::log(
                    'Sensor Deactivated and Equipment deactivated',
                            $user,
                    'Sensor/Equipment',
                    $sensor->id,
                            ['reason' => 'Bypass request approved (dual validation)', 'request_id' => $request->id]
                        );
                    }
                    
                    $request->refresh();
                    $this->sendValidationNotifications($request, 'approved', null, 2);
                }
            } else {
                return response()->json(['message' => 'Non autorisé à valider cette demande'], 403);
            }
        } else {
            // Pour les demandes normales (low, normal, high), validation simple
            if (!$user->canValidateRequests()) {
                return response()->json(['message' => 'Non autorisé à valider'], 403);
            }
        
        $request->update([
            'status' => $data['validation_status'],
                'validated_by_id' => $user->id,
            'validated_at' => now(),
            'rejection_reason' => $data['rejection_reason'] ?? null,
        ]);
        
        AuditLog::log(
            'Request ' . ucfirst($data['validation_status']),
                $user,
            'Request',
            $request->id,
            [
                'title' => $request->title,
                'rejection_reason' => $data['rejection_reason'] ?? null
            ]
        );

        // Si la requête est approuvée, désactiver le capteur
        if ($data['validation_status'] === 'approved') {
            $sensor = $request->sensor;
            $equipement = $request->equipment;
            if ($sensor) {
                $sensor->update(['status' => 'bypassed']);
                $equipement->update(['status' => 'maintenance']);
                
                AuditLog::log(
                    'Sensor Deactivated and Equipment deactivated',
                    $user,
                    'Sensor',
                    $sensor->id,
                    ['reason' => 'Bypass request approved', 'request_id' => $request->id]
                );
            }
        }
        
        $request->refresh();
        $this->sendValidationNotifications($request, $data['validation_status'], $data['rejection_reason'] ?? null, null);
        }

        return response()->json($request->load(['requester', 'validator', 'validatorLevel1', 'validatorLevel2', 'equipment.zone', 'sensor']));
    }
    
    /**
     * Envoie les notifications de validation
     */
    private function sendValidationNotifications(Request $request, string $status, ?string $rejectionReason = null, ?int $validationLevel = null): void
    {
        $request->load(['requester', 'validatorLevel1', 'validatorLevel2', 'equipment.zone', 'sensor']);
        
        $statusLabel = $status === 'approved' ? 'Approuvée' : 'Rejetée';
        
        // Envoyer une notification Laravel au demandeur (gestion d'erreur)
        if ($request->requester) {
            try {
                Notification::send($request->requester, new RequestValidated($request, $status, $rejectionReason, $validationLevel));
            } catch (\Exception $e) {
                Log::warning('Erreur envoi notification validation au demandeur: ' . $e->getMessage());
                // Essayer au moins en base de données
                try {
                    $request->requester->notify(new RequestValidated($request, $status, $rejectionReason, $validationLevel));
                } catch (\Exception $e2) {
                    Log::error('Erreur critique notification DB: ' . $e2->getMessage());
                }
            }
        }
        
        $requesterMessage = "📌 *Notification : Requête {$statusLabel}*\n" .
                            "📝 Titre : {$this->getReasonLabel($request->title)}\n" .
                            "⚡ Statut : {$statusLabel}\n" .
                            ($status === 'rejected' && $rejectionReason ? "❌ Raison du rejet : {$rejectionReason}\n" : "") .
                            "📅 Validée le : " . now()->format('d/m/Y H:i') . "\n";

        $directorMessage = "📌 *Notification : Requête {$statusLabel}*\n" .
                        "👤 Demandeur : {$request->requester->full_name}\n" .
                        "📝 Titre : {$this->getReasonLabel($request->title)}\n" .
                        "⚡ Statut : {$statusLabel}\n" .
                        ($status === 'rejected' && $rejectionReason ? "❌ Raison du rejet : {$rejectionReason}\n" : "") .
                        "📅 Validée le : " . now()->format('d/m/Y H:i') . "\n";

        // Envoyer un message WhatsApp au demandeur (gestion d'erreur)
        if ($request->requester && $request->requester->phone) {
            try {
        $this->sendTextMessage(ltrim($request->requester->phone, '+'), $requesterMessage);
            } catch (\Exception $e) {
                Log::warning('Erreur envoi WhatsApp validation au demandeur: ' . $e->getMessage());
            }
        }

        // Envoyer un message WhatsApp aux directeurs (administrateurs) (gestion d'erreur)
        $directors = User::role('administrator')->get();
        foreach ($directors as $director) {
            if ($director->phone) {
                try {
            $this->sendTextMessage(ltrim($director->phone, '+'), $directorMessage);
                } catch (\Exception $e) {
                    Log::warning("Erreur envoi WhatsApp validation à {$director->full_name}: " . $e->getMessage());
                }
            }
        }
    }
    
    /**
     * Envoie une notification aux administrateurs pour validation niveau 2
     */
    private function sendLevel1ApprovalNotification(Request $request): void
    {
        $request->load(['requester', 'validatorLevel1', 'equipment.zone', 'sensor']);
        
        // Envoyer des notifications Laravel aux administrateurs (gestion d'erreur)
        $administrators = User::permission('requests.validate.level2')->get();
        if ($administrators->isNotEmpty()) {
            try {
                Notification::send($administrators, new RequestLevel1Approved($request));
            } catch (\Exception $e) {
                Log::warning('Erreur envoi notification niveau 1 approuvée: ' . $e->getMessage());
                // Essayer au moins en base de données
                try {
                    foreach ($administrators as $admin) {
                        $admin->notify(new RequestLevel1Approved($request));
                    }
                } catch (\Exception $e2) {
                    Log::error('Erreur critique notification DB niveau 1: ' . $e2->getMessage());
                }
            }
        }
        
        $message = "📌 *Validation Niveau 1 Approuvée - Validation Niveau 2 Requise*\n" .
                   "👤 Demandeur : {$request->requester->full_name}\n" .
                   "📝 Titre : {$this->getReasonLabel($request->title)}\n" .
                   "⚡ Priorité : {$this->getUrgencyLabel($request->priority)}\n" .
                   "✅ Validée niveau 1 par : {$request->validatorLevel1->full_name}\n" .
                   "⏳ En attente de votre validation niveau 2.\n" .
                   "📂 Consultez la demande dans le système pour plus de détails.";
        
        $quickReplies = [
            ['id' => 'web', 'title' => '🌐 Valider maintenant', 'type' => 'url', 'url' => env('APP_URL').'/validation']
        ];
        
        // Envoyer des messages WhatsApp aux administrateurs (gestion d'erreur)
        foreach ($administrators as $admin) {
            if ($admin->phone) {
                try {
                    $adminPhone = ltrim($admin->phone, '+');
                    $this->sendInteractiveMediaMessages($adminPhone, $message, $quickReplies);
                } catch (\Exception $e) {
                    Log::warning("Erreur envoi WhatsApp niveau 1 à {$admin->full_name}: " . $e->getMessage());
                }
            }
        }
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

                              $user = auth()->user();
        
        $query = Request::with(['requester', 'equipment.zone', 'sensor', 'validator', 'validatorLevel1', 'validatorLevel2'])
                       ->where('status', 'pending'); // Demandes non encore approuvées/rejetées
        
        if ($user->canValidateLevel1() && !$user->canValidateLevel2()) {
            // Supervisors voient les demandes normales OU les demandes critical/emergency en attente niveau 1
            $query->where(function($q) {
                // Demandes normales (low, normal, high) qui nécessitent validation supervisor
                $q->where(function($subQ) {
                    $subQ->whereIn('priority', ['low', 'normal', 'high'])
                         ->where(function($roleQ) {
                             $roleQ->where('validation_required_by_role', 'supervisor')
                                   ->orWhereNull('validation_required_by_role'); // Gérer les anciennes demandes
                         });
                })
                // OU demandes critical/emergency en attente niveau 1
                ->orWhere(function($subQ) {
                    $subQ->whereIn('priority', ['critical', 'emergency'])
                         ->where(function($statusQ) {
                             $statusQ->where('validation_status_level1', 'pending')
                                     ->orWhereNull('validation_status_level1'); // Gérer les anciennes demandes
                         });
                });
            });
        } elseif ($user->canValidateLevel2()) {
            // Administrators/Directors voient TOUTES les demandes en attente
            // Ils peuvent valider à la fois niveau 1 et niveau 2
            $query->where(function($q) {
                // Demandes normales (low, normal, high) - les admins peuvent toutes les valider
                $q->whereIn('priority', ['low', 'normal', 'high'])
                // OU demandes critical/emergency en attente niveau 2 (niveau 1 déjà approuvé)
                ->orWhere(function($subQ) {
                    $subQ->whereIn('priority', ['critical', 'emergency'])
                         ->where('validation_status_level1', 'approved')
                         ->where(function($statusQ) {
                             $statusQ->where('validation_status_level2', 'pending')
                                     ->orWhereNull('validation_status_level2');
                         });
                })
                // OU demandes critical/emergency en attente niveau 1 (si pas encore validé)
                ->orWhere(function($subQ) {
                    $subQ->whereIn('priority', ['critical', 'emergency'])
                         ->where(function($statusQ) {
                             $statusQ->where('validation_status_level1', 'pending')
                                     ->orWhereNull('validation_status_level1');
                         });
                });
            });
        }
        
        $requests = $query->orderBy('created_at', 'desc')->get();


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
        if (!$user->hasPermissionTo('requests.view.all') && $request->requester_id !== $user->id) {
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

        // Recharger la demande avec les relations
        $request->refresh();
        $request->load(['requester', 'equipment.zone', 'sensor']);

        // Notifier les validateurs que la demande a été modifiée (gestion d'erreur)
        $validators = User::permission('requests.validate.level1')->get();
        if ($validators->isNotEmpty()) {
            try {
                Notification::send($validators, new RequestUpdate($request));
            } catch (\Exception $e) {
                Log::warning('Erreur envoi notification modification: ' . $e->getMessage());
                // Essayer au moins en base de données
                try {
                    foreach ($validators as $validator) {
                        $validator->notify(new RequestUpdate($request));
                    }
                } catch (\Exception $e2) {
                    Log::error('Erreur critique notification DB modification: ' . $e2->getMessage());
                }
            }
        }

        // Envoyer un message WhatsApp aux validateurs (gestion d'erreur)
        $updateMessage = "📌 *Demande Modifiée*\n" .
           "👤 Demandeur : {$request->requester->full_name}\n" .
           "📝 Code : {$request->request_code}\n" .
           "📝 Titre : {$this->getReasonLabel($request->title)}\n" .
           "⚡ Priorité : {$this->getUrgencyLabel($request->priority)}\n" .
           "📅 Modifiée le : " . now()->format('d/m/Y H:i') . "\n" .
           "🔍 Statut : En attente de validation.";

        foreach ($validators as $validator) {
            if ($validator->phone) {
                try {
                    $validatorPhone = ltrim($validator->phone, '+');
                    $this->sendTextMessage($validatorPhone, $updateMessage);
                } catch (\Exception $e) {
                    Log::warning("Erreur envoi WhatsApp modification à {$validator->full_name}: " . $e->getMessage());
                }
            }
        }

        AuditLog::log(
            'Request Updated',
            auth()->user(),
            'Request',
            $request->id,
            ['title' => $request->title]
        );

        return response()->json($request->load(['equipment', 'sensor', 'requester']));
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
        if (!$user->hasPermissionTo('requests.view.all') && $request->requester_id !== $user->id) {
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
        $notification = auth()->user()->notifications()->find($id);
        
        if (!$notification) {
            return response()->json(['message' => 'Notification non trouvée'], 404);
        }

        if (!$notification->read_at) {
            $notification->markAsRead();
        }

        return response()->json([
            'message' => 'Notification marquée comme lue',
            'notification' => $notification
        ]);
    }
}
