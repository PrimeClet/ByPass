<?php

namespace App\Http\Controllers;

use App\Models\SystemSetting;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class SystemController extends Controller
{
    public function getSettings()
    {
        if (!auth()->user()->isAdministrator()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $settings = SystemSetting::all()->pluck('value', 'key');

        return response()->json($settings);
    }

    public function updateSettings(Request $request)
    {
        if (!auth()->user()->isAdministrator()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $request->validate([
            'settings' => 'required|array',
        ]);

        foreach ($request->settings as $key => $value) {
            SystemSetting::set($key, $value);
        }

        AuditLog::log(
            'System Settings Updated',
            auth()->user(),
            null,
            null,
            ['updated_settings' => array_keys($request->settings)]
        );

        return response()->json(['message' => 'Paramètres mis à jour avec succès']);
    }

    public function getHistory(Request $request)
    {
        if (!auth()->user()->isAdministrator()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $query = AuditLog::with('user');

        if ($request->has('action')) {
            $query->where('action', 'like', '%' . $request->action . '%');
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        $history = $query->orderBy('created_at', 'desc')->paginate(50);

        return response()->json($history);
    }
}
