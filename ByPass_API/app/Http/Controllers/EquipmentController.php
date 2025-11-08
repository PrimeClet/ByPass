<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateEquipmentRequest;
use App\Models\Equipment;
use App\Models\AuditLog;
use App\Models\Zone;
use Illuminate\Http\Request;
use Log;

class EquipmentController extends Controller
{

    public function index_equipements(Zone $zone)
    {
        Log::info($zone);
        return response()->json($zone->equipements);
    }


    public function index(Request $request)
    {
        $query = Equipment::with('sensors', 'zone');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        $equipment = $query->orderBy('name')->paginate(15);

        return response()->json($equipment);
    }

    public function codeEquipment($equipment, $zone, $num = 1) {
        // Consonnes: premier + deuxième mot
        $words = explode(' ', strtoupper($equipment));
        $consonants = substr($words[0], 0, 1) . substr($words[1] ?? $words[0], 0, 1);
        
        // Zone: extraire lettre après "Zone"
        preg_match('/Zone\s+([A-Z])/i', $zone, $m);
        $zoneCode = $m[1] ?? substr($zone, 0, 1);
        
        return $consonants . '-' . strtoupper($zoneCode) . '-' . sprintf('%03d', $num);
    }

    public function store(CreateEquipmentRequest $request)
    {
        if($request->validated()){

            $zonei = Zone::where('name', $request->zone)->first();
            $nums= Equipment::all()->count() + 1;

            Log::info($zonei->name);
            Log::info($request->name);
            Log::info($this->codeEquipment($request->name, $zonei->name, $nums));

            $equipment = Equipment::create([
                'name' => $request->name,
                'code' => $this->codeEquipment($request->name, $zonei->name,$nums),
                'type' => $request->type,
                'criticite' => $request->criticite,
                'fabricant' => $request->fabricant,
                'description' => $request->description,
                'zone_id' => $zonei->id,
                'status' => strtolower($request->status),
            ]);
            
            AuditLog::log(
                'Equipment Created',
                auth()->user(),
                'Equipment',
                $equipment->id,
                ['name' => $equipment->name, 'location' => $equipment->location]
            );

            return response()->json($equipment, 201);
        } else {
            return response()->json($request->errors(), 203);
        }
        
    }

    public function show(Equipment $equipment)
    {
        return response()->json($equipment->load('sensors'));
    }

    public function update(Request $request, Equipment $equipment)
    {
        if (!auth()->user()->isAdministrator()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $request->validate(rules: [
            'name' => 'sometimes|string|max:255',
            'status' => 'sometimes|in:operational,maintenance,down,standby',
            'type' => 'sometimes|string|max:255',
            'criticite' => 'sometimes|string|max:255',
            'fabricant' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'zone' => 'sometimes|string|max:255',
        ]);

        $zonei = Zone::where('name', $request->zone)->first();

        $equipment->update([
            'name' => $request->name,
            'type' => $request->type,
            'criticite' => $request->criticite,
            'fabricant' => $request->fabricant,
            'zone_id' => $zonei->id,
            'status' => strtolower($request->status),
        ]);

        AuditLog::log(
            'Equipment Updated',
            auth()->user(),
            'Equipment',
            $equipment->id,
            ['name' => $equipment->name]
        );

        return response()->json($equipment);
    }

    public function destroy(Equipment $equipment)
    {
        if (!auth()->user()->isAdministrator()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        AuditLog::log(
            'Equipment Deleted',
            auth()->user(),
            'Equipment',
            $equipment->id,
            ['name' => $equipment->name]
        );

        $equipment->delete();

        return response()->json(['message' => 'Équipement supprimé avec succès']);
    }
}
