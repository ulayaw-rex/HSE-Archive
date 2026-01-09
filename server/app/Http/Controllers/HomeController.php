<?php

namespace App\Http\Controllers;

use App\Models\Publication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class HomeController extends Controller
{
    
    private function formatPublication($publication)
    {
        $publication->image = $publication->image_path 
            ? asset('storage/' . $publication->image_path) 
            : null;

        $publication->thumbnail = $publication->thumbnail_path 
            ? asset('storage/' . $publication->thumbnail_path) 
            : $publication->image;

        return $publication;
    }

    public function index()
    {
        $data = Cache::remember('homepage_content', 3600, function () {
            
            $featured = Publication::with('writers')
                ->where('status', 'approved')
                ->orderBy('date_published', 'desc')
                ->limit(3)
                ->get()
                ->map(function ($pub) {
                    return $this->formatPublication($pub);
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
                        return $this->formatPublication($pub);
                    });
            }

            return [
                'featured' => $featured,
                'categories' => $categoryData
            ];
        });

        return response()->json($data);
    }

   
    public function getNewsHubData()
    {
        $data = Cache::remember('news_hub_data', 3600, function () {
            
            $newsCategories = ['News', 'University', 'Local', 'National', 'International'];
            
            $featured = Publication::with('writers')
                ->whereIn('category', $newsCategories)
                ->where('status', 'approved')
                ->orderBy('date_published', 'desc')
                ->first();

            if ($featured) {
                $featured = $this->formatPublication($featured);
            }

            $sections = ['university', 'local', 'national', 'international'];
            $categoryData = [];

            foreach ($sections as $section) {
                $dbCategory = ucfirst($section); 

                $categoryData[$section] = Publication::with('writers')
                    ->where('category', $dbCategory)
                    ->where('status', 'approved')
                    ->orderBy('date_published', 'desc')
                    ->limit(4)
                    ->get()
                    ->map(function ($pub) {
                        return $this->formatPublication($pub);
                    });
            }

            return [
                'featured' => $featured,
                'categories' => $categoryData
            ];
        });

        return response()->json($data);
    }
}