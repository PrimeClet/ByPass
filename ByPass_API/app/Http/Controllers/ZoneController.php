<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateZoneRequest;
use App\Models\AuditLog;
use App\Models\Zone;
use Illuminate\Http\Request;
// use Illuminate\Http\Resources\Json\JsonResource;

class ZoneController extends Controller
{
    public function index(Request $request)
    {
        $query = Zone::with('equipements');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $zone = $query->orderBy('name')->paginate(15);

        return response()->json($zone);
    }

    public function store(CreateZoneRequest $request)
    {
        $zone = Zone::create($request->validated());

        AuditLog::log(
            'Zone Created',
            auth()->user(),
            'Zone',
            $zone->id,
            ['name' => $zone->name]
        );

        return response()->json($zone, 201);
    }

    public function show(Zone $zone)
    {
        return response()->json($zone->load('equipements'));
    }

    public function update(Request $request, Zone $zone)
    {
        if (!auth()->user()->isAdministrator()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|nullable|string',
            'location' => 'sometimes|string|max:255',
            'status' => 'sometimes|in:active,inactive,maintenance',
        ]);

        $zone->update($request->only(['name', 'description', 'location', 'status']));

        AuditLog::log(
            'Equipment Updated',
            auth()->user(),
            'Equipment',
            $zone->id,
            ['name' => $zone->name]
        );

        return response()->json($zone);
    }

    public function destroy(Zone $zone)
    {
        if (!auth()->user()->isAdministrator()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        AuditLog::log(
            'Equipment Deleted',
            auth()->user(),
            'Equipment',
            $zone->id,
            ['name' => $zone->name]
        );

        $zone->delete();

        return response()->json(['message' => 'Zone supprimée avec succès']);
    }
}
