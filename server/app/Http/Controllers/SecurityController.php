<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Log;

class SecurityController extends Controller
{
    public function getAuditLogs(Request $request)
    {
        $startDate = $request->input('start_date') . ' 00:00:00';
        $endDate = $request->input('end_date') . ' 23:59:59';

        if (!$request->input('start_date')) {
            $startDate = now()->startOfMonth();
            $endDate = now()->endOfMonth();
        }

        $logs = AuditLog::with('user')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('action', '!=', 'Login')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        $logs->through(function ($log) {
            return [
                'id' => $log->id,
                'user' => $log->user ? [
                    'id' => $log->user->id,
                    'name' => $log->user->name,
                    'email' => $log->user->email,
                ] : 'System',
                'action' => $log->action,
                'details' => $log->details,
                'ip' => $log->ip_address,
                'date' => $log->created_at->format('Y-m-d H:i:s'),
            ];
        });

        return response()->json($logs);
    }

    public function getLoginHistory(Request $request)
    {
        $startDate = $request->input('start_date') . ' 00:00:00';
        $endDate = $request->input('end_date') . ' 23:59:59';

        if (!$request->input('start_date')) {
            $startDate = now()->startOfMonth();
            $endDate = now()->endOfMonth();
        }

        $logs = AuditLog::with('user')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('action', 'Login')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        $logs->through(function ($log) {
            return [
                'id' => $log->id,
                'user' => $log->user ? [
                    'id' => $log->user->id,
                    'name' => $log->user->name,
                    'email' => $log->user->email,
                ] : 'Unknown',
                'ip' => $log->ip_address,
                'status' => 'Success',
                'date' => $log->created_at->format('Y-m-d H:i:s'),
            ];
        });

        return response()->json($logs);
    }
}