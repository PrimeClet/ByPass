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

    public function show(Request $request)
    {
        $user = auth()->user();
        
        // Vérifier les permissions
        if (!$user->isAdministrator() && $request->requester_id !== $user->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        return response()->json($request->load(['requester', 'validator', 'equipment', 'sensor']));
    }

    public function validate(ValidateRequestRequest $httpRequest, Request $request)
    {
        $data = $httpRequest->validated();
        
        $request->update([
            'status' => $data['validation_status'],
            'validated_by_id' => auth()->id(),
            'validated_at' => now(),
            'rejection_reason' => $data['rejection_reason'] ?? null,
        ]);

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

    public function mine()
    {
        $requests = Request::with(['requester', 'equipment.zone', 'sensor', 'validator'])
                          ->where('requester_id', auth()->id())
                          ->orderBy('created_at', 'desc')
                          ->paginate(15);

        return response()->json($requests);
    }

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
