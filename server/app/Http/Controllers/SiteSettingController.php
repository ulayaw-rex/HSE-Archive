<?php

namespace App\Http\Controllers;

use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class SiteSettingController extends Controller
{
    public function getTeamPhoto(): JsonResponse
    {
        $setting = SiteSetting::where('key', 'team_photo_path')->first();

        if (!$setting || !$setting->value) {
            return response()->json(['url' => null]); 
        }

        return response()->json([
            'url' => asset('storage/' . $setting->value)
        ]);
    }

    public function uploadTeamPhoto(Request $request): JsonResponse
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120', // Max 5MB
        ]);

        $oldSetting = SiteSetting::where('key', 'team_photo_path')->first();

        if ($request->file('photo')) {
            $path = $request->file('photo')->store('site-assets', 'public');

            SiteSetting::updateOrCreate(
                ['key' => 'team_photo_path'],
                ['value' => $path]
            );

            if ($oldSetting && $oldSetting->value) {
                Storage::disk('public')->delete($oldSetting->value);
            }

            return response()->json([
                'message' => 'Team photo updated successfully!',
                'url' => asset('storage/' . $path)
            ]);
        }

        return response()->json(['message' => 'Upload failed'], 500);
    }

    public function getTeamIntro(): JsonResponse
    {
        $setting = SiteSetting::where('key', 'team_intro_text')->first();
        return response()->json([
            'text' => $setting ? $setting->value : "The brilliant minds and passionate voices behind The Hillside Echo." // Default text
        ]);
    }

    public function updateTeamIntro(Request $request): JsonResponse
    {
        $request->validate([
            'text' => 'required|string|max:1000',
        ]);

        SiteSetting::updateOrCreate(
            ['key' => 'team_intro_text'],
            ['value' => $request->text]
        );

        return response()->json(['message' => 'Introduction updated successfully!']);
    }
}