<?php

namespace App\Http\Controllers;

use App\Models\Publication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class HomeController extends Controller
{
    public function index()
    {
        return Cache::remember('homepage_content', 300, function () {
            
            $featured = Publication::with('writers')
                ->where('status', 'approved')
                ->orderBy('date_published', 'desc')
                ->limit(3)
                ->get()
                ->map(function ($pub) {
                    $pub->image = $pub->image_path ? asset('storage/' . $pub->image_path) : null;
                    return $pub;
                });

            $categories = [
                'university', 'local', 'national', 'entertainment',
                'sci-tech', 'sports', 'opinion', 'literary'
            ];

            $categoryData = [];

            foreach ($categories as $category) {
                $categoryData[$category] = Publication::with('writers')
                    ->where('category', $category)
                    ->where('status', 'approved')
                    ->orderBy('date_published', 'desc')
                    ->limit(4)
                    ->get()
                    ->map(function ($pub) {
                        $pub->image = $pub->image_path ? asset('storage/' . $pub->image_path) : null;
                        return $pub;
                    });
            }

            return response()->json([
                'featured' => $featured,
                'categories' => $categoryData
            ]);
        });
    }
}