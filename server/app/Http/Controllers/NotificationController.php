<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Get all unread notifications for the authenticated user.
     */
    public function getUnread()
    {
        $user = Auth::guard('sanctum')->user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);

        return response()->json($user->unreadNotifications);
    }

    /**
     * Get all notifications for the authenticated user (limited to 50).
     */
    public function getAll()
    {
        $user = Auth::guard('sanctum')->user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);

        return response()->json($user->notifications()->take(50)->get());
    }

    /**
     * Mark a specific notification as read.
     */
    public function markAsRead($id)
    {
        $user = Auth::guard('sanctum')->user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);

        $notification = $user->notifications()->find($id);
        if ($notification) {
            $notification->markAsRead();
            return response()->json(['message' => 'Marked as read']);
        }

        return response()->json(['message' => 'Notification not found'], 404);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead()
    {
        $user = Auth::guard('sanctum')->user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);

        $user->unreadNotifications->markAsRead();
        return response()->json(['message' => 'All marked as read']);
    }
}
