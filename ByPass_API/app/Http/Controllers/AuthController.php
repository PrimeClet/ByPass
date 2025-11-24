<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;
use OpenApi\Attributes as OA;

class AuthController extends Controller
{
    #[OA\Post(
        path: "/auth/login",
        summary: "Connexion utilisateur",
        description: "Authentifie un utilisateur et retourne un token d'accès",
        tags: ["Authentification"],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: "application/json",
                schema: new OA\Schema(
                    required: ["username", "password"],
                    properties: [
                        new OA\Property(property: "username", type: "string", example: "admin"),
                        new OA\Property(property: "password", type: "string", format: "password", example: "password123"),
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Connexion réussie",
                content: new OA\MediaType(
                    mediaType: "application/json",
                    schema: new OA\Schema(
                        properties: [
                            new OA\Property(property: "status", type: "integer", example: 200),
                            new OA\Property(
                                property: "data",
                                type: "object",
                                properties: [
                                    new OA\Property(property: "user", ref: "#/components/schemas/User"),
                                    new OA\Property(property: "token", type: "string", example: "1|xxxxxxxxxxxxx"),
                                ]
                            ),
                            new OA\Property(property: "message", type: "array", items: new OA\Items(type: "string"), example: ["Connexion réussie"]),
                        ]
                    )
                )
            ),
            new OA\Response(response: 422, description: "Erreur de validation", ref: "#/components/schemas/Error"),
        ]
    )]
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        Log::info($request);

        $user = User::where('username', $request->username)
                   ->where('is_active', true)
                   ->first();

        Log::info(message: $user);

        
        if (!$user || !Hash::check($request->password, $user->password)) {
            Log::info('dedans');
            
            // throw ValidationException::withMessages([
            //     'username' => ['Les informations d\'identification fournies sont incorrectes.'],
            // ]);

            return response()->json([
                'status' => 200,
                'data' => [],
                'message' => ['Les informations d\'identification fournies sont incorrectes.'],
            ]);
            
        }
        
        if(!$user) {
            throw ValidationException::withMessages([
                'username' => ['Les informations d\'identification fournies sont incorrectes.'],
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        Log::info(message: $token);


        AuditLog::log('User Login', $user);

        return response()->json([
            'status' => 200,
            'data' => [
                'user' => $user,
                'token' => $token,
            ],
            'message' => ['Connexion réussie'],
            
        ]);
    }

    #[OA\Post(
        path: "/auth/logout",
        summary: "Déconnexion utilisateur",
        description: "Invalide le token d'accès actuel de l'utilisateur",
        tags: ["Authentification"],
        security: [["sanctum" => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: "Déconnexion réussie",
                content: new OA\MediaType(
                    mediaType: "application/json",
                    schema: new OA\Schema(
                        properties: [
                            new OA\Property(property: "message", type: "string", example: "Déconnexion réussie"),
                        ]
                    )
                )
            ),
            new OA\Response(response: 401, description: "Non authentifié", ref: "#/components/schemas/Error"),
        ]
    )]
    public function logout(Request $request)
    {
        AuditLog::log('User Logout', $request->user());
        
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnexion réussie']);
    }

    #[OA\Get(
        path: "/auth/me",
        summary: "Informations utilisateur connecté",
        description: "Retourne les informations de l'utilisateur actuellement authentifié",
        tags: ["Authentification"],
        security: [["sanctum" => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: "Informations utilisateur",
                content: new OA\MediaType(
                    mediaType: "application/json",
                    schema: new OA\Schema(ref: "#/components/schemas/User")
                )
            ),
            new OA\Response(response: 401, description: "Non authentifié", ref: "#/components/schemas/Error"),
        ]
    )]
    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}
