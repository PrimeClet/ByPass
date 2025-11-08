<?php

namespace App\Http\Controllers;

use App\Models\Sensor;
use App\Models\Equipment;
use App\Models\AuditLog;
use App\Models\Zone;
use Illuminate\Http\Request;
use Log;

class SensorController extends Controller
{
    public function index(Equipment $equipment)
    {
        return response()->json($equipment->sensors);
    }

    public function sensorCode($sensor, $equipment, $zone, $num = 1) {
        // 5 premiers caractères capteur (sans "SENSOR")
        $prefix = substr(str_replace(['SENSOR', 'CAPTEUR'], '', 
            strtoupper(preg_replace('/[^A-Z0-9]/', '', $sensor))), 0, 5);
        
        // 2 lettres équipement  
        $eqWords = explode(' ', strtoupper($equipment));
        $eqCode = substr($eqWords[0], 0, 1) . substr($eqWords[1] ?? $eqWords[0], 0, 1);
        
        // 1 lettre zone
        preg_match('/Zone\s+([A-Z])/i', $zone, $m);
        $zoneCode = $m[1] ?? substr($zone, 0, 1);
        
        // 2 derniers caractères capteur
        $suffix = substr(preg_replace('/[^A-Z0-9]/', '', strtoupper($sensor)), -2);
        
        return sprintf('%s-%s-%s-%03d-%s', $prefix, $eqCode, $zoneCode, $num, $suffix);
    }

    public function store(Request $request, Equipment $equipment)
    {
        if (!auth()->user()->isAdministrator()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        Log::info($equipment);

        $zonei = Zone::where('id', $equipment->zone_id)->first();
        $nms = Sensor::all()->count() + 1;


        Log::info($equipment);

        $request->validate([
            'last_reading' => 'sometimes|nullable|numeric',
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'unit' => 'required|string|max:255',
            'criticalThreshold' => 'required|string|max:255',
            'Dernier_Etallonage' => 'sometimes|string|max:255',
            'status' => 'sometimes|in:active,bypassed,maintenance,faulty,calibration',
        ]);

        $sensor = $equipment->sensors()->create([
           'name' => $request->name,
            'code' => $this->sensorCode($request->name, $equipment->name,$zonei->name,$nms),
            'type' => $request->type,
            'equipment_id' => $equipment->id,
            'seuil_critique' => $request->criticalThreshold,
            'unite' => $request->unit,
            'Dernier_Etallonnage' => now(),
            'status' => $request->status,
            'last_reading_at' => now()
        ]);

        AuditLog::log(
            'Sensor Created',
            auth()->user(),
            'Sensor',
            $sensor->id,
            ['name' => $sensor->name, 'equipment' => $equipment->name]
        );

        return response()->json($sensor, 201);
    }

    public function show(Sensor $sensor)
    {
        return response()->json($sensor->load('equipment'));
    }

    public function showSensor()
    {
        return response()->json(Sensor::with('equipment.zone')->paginate(15));
    }

    public function update(Request $request, Sensor $sensor)
    {
        if (!auth()->user()->isAdministrator()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $request->validate([
            'last_reading' => 'sometimes|nullable|numeric',
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'unit' => 'required|string|max:255',
            'criticalThreshold' => 'required|string|max:255',
            'Dernier_Etallonage' => 'sometimes|string|max:255',
            'status' => 'sometimes|in:active,bypassed,maintenance,faulty,calibration',
        ]);

        if ($request->has('last_reading')) {
            $request->merge(['last_reading_at' => now()]);
        }

        $sensor->update([
            'name' => $request->name,
            'type' => $request->type,
            'equipment_id' => $request->equipmentId,
            'seuil_critique' => $request->criticalThreshold,
            'unite' => $request->unit,
            'Dernier_Etallonnage' => now(),
            'status' => $request->status,
            'last_reading_at' => now()
        ]);

        AuditLog::log(
            'Sensor Updated',
            auth()->user(),
            'Sensor',
            $sensor->id,
            ['name' => $sensor->name]
        );

        return response()->json($sensor);
    }

    public function destroy(Sensor $sensor)
    {
        if (!auth()->user()->isAdministrator()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        AuditLog::log(
            'Sensor Deleted',
            auth()->user(),
            'Sensor',
            $sensor->id,
            ['name' => $sensor->name]
        );

        $sensor->delete();

        return response()->json(['message' => 'Capteur supprimé avec succès']);
    }
}
