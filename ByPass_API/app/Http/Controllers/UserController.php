<?php

namespace App\Http\Controllers;

// use Illuminate\Http\Request;

use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        if (!auth()->user()->isAdministrator()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $query = User::query();

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('username', 'like', "%{$search}%")
                  ->orWhere('full_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('full_name')->paginate(15);

        return response()->json($users);
    }

    public function genererNomUtilisateur($prenom, $nom) {
        if (empty($prenom) || empty($nom)) return '';
        
        $premierPrenom = explode(' ', $prenom)[0];
        $premiereLettreDuNom = substr($nom, 0, 1);
        
        return strtolower($premiereLettreDuNom . $premierPrenom);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->isAdministrator()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $request->validate([
            'lastName' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'firstName' => 'required|string|max:255',
            'phone' => 'required|string|max:255',
            'role' => 'required|in:user,supervisor,administrator, director',
        ]);

        $user = User::create([
            'username' => $this->genererNomUtilisateur($request->firstName,$request->lastName),
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'full_name' => $request->firstName.' '.$request->lastName,
            'phone' => $request->phone,
            'role' => $request->role,
        ]);

        AuditLog::log(
            'User Created',
            auth()->user(),
            'User',
            $user->id,
            ['username' => $user->username, 'role' => $user->role]
        );

        return response()->json($user, 201);
    }

    public function show(User $user)
    {
        if (!auth()->user()->isAdministrator() && auth()->id() !== $user->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        return response()->json($user);
    }

    public function update(Request $request, User $user)
    {
        if (!auth()->user()->isAdministrator() && auth()->id() !== $user->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $rules = [
            'username' => 'sometimes|string|max:255|unique:users,username,' . $user->id,
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'full_name' => 'sometimes|string|max:255',
        ];

        // Seul un admin peut changer le rôle
        if (auth()->user()->isAdministrator()) {
            $rules['role'] = 'sometimes|in:user,supervisor,administrator';
            $rules['is_active'] = 'sometimes|boolean';
        }

        if ($request->has('password')) {
            $rules['password'] = 'string|min:8';
        }

        $request->validate($rules);

        $data = $request->only(['username', 'email', 'full_name', 'phone']);

        if (auth()->user()->isAdministrator()) {
            $data = array_merge($data, $request->only(['role', 'is_active']));
        }

        if ($request->has('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        AuditLog::log(
            'User Updated',
            auth()->user(),
            'User',
            $user->id,
            ['username' => $user->username]
        );

        return response()->json($user);
    }

    public function destroy(User $user)
    {
        if (!auth()->user()->isAdministrator()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'Vous ne pouvez pas supprimer votre propre compte'], 422);
        }

        AuditLog::log(
            'User Deleted',
            auth()->user(),
            'User',
            $user->id,
            ['username' => $user->username]
        );

        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé avec succès']);
    }
}
