<?php

namespace App\Http\Controllers;

use App\Models\Publication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Http\Controllers\Traits\FormatsPublications;

class HomeController extends Controller
{
    use FormatsPublications;

    private $selectColumns = [
        'publication_id', 'title', 'category', 'date_published',
        'created_at', 'image_path', 'thumbnail_path', 'status', 'views',
        'byline', 'body', 'photo_credits',
    ];

    public function index()
    {
        $data = Cache::remember('homepage_content', 300, function () {
            
            $featured = Publication::with(['writers' => function($q) { $q->select('user_id', 'name'); }])
                ->select($this->selectColumns)
                ->where('status', 'published') 
                ->orderBy('date_published', 'desc')
                ->limit(3)
                ->get()
                ->map(fn($pub) => $this->formatPublication($pub));

            $categories = ['university', 'local', 'national', 'entertainment', 'sci-tech', 'sports', 'opinion', 'literary'];
            $unionQuery = null;

            foreach ($categories as $category) {
                $query = Publication::select($this->selectColumns)
                    ->where('category', $category)
                    ->where('status', 'published') 
                    ->orderBy('date_published', 'desc')
                    ->limit(4);

                if (!$unionQuery) {
                    $unionQuery = $query;
                } else {
                    $unionQuery->union($query);
                }
            }

            $allArticles = $unionQuery ? $unionQuery->with(['writers' => function($q) { $q->select('user_id', 'name'); }])->get() : collect([]);

            $categoryData = [];
            foreach ($categories as $category) {
                $categoryData[$category] = $allArticles
                    ->where('category', $category)
                    ->values()
                    ->map(fn($pub) => $this->formatPublication($pub));
            }

            return ['featured' => $featured, 'categories' => $categoryData];
        });

        return response()->json($data);
    }

    public function getNewsHubData()
    {
        $data = Cache::remember('news_hub_data', 300, function () {
            
            $newsCategories = ['News', 'University', 'Local', 'National', 'International'];
            
            $featured = Publication::with(['writers' => function($q) { $q->select('user_id', 'name'); }])
                ->select($this->selectColumns)
                ->whereIn('category', $newsCategories)
                ->where('status', 'published') 
                ->orderBy('date_published', 'desc')
                ->first();

            if ($featured) {
                $featured = $this->formatPublication($featured);
            }

            $sections = ['university', 'local', 'national', 'international'];
            $unionQuery = null;

            foreach ($sections as $section) {
                $dbCategory = ucfirst($section); 
                $query = Publication::select($this->selectColumns)
                    ->where('category', $dbCategory)
                    ->where('status', 'published') 
                    ->orderBy('date_published', 'desc')
                    ->limit(4);

                if (!$unionQuery) {
                    $unionQuery = $query;
                } else {
                    $unionQuery->union($query);
                }
            }

            $allSectionArticles = $unionQuery ? $unionQuery->with(['writers' => function($q) { $q->select('user_id', 'name'); }])->get() : collect([]);

            $categoryData = [];
            foreach ($sections as $section) {
                $dbCategory = ucfirst($section);
                $categoryData[$section] = $allSectionArticles
                    ->where('category', $dbCategory)
                    ->values()
                    ->map(fn($pub) => $this->formatPublication($pub));
            }

            return ['featured' => $featured, 'categories' => $categoryData];
        });

        return response()->json($data);
    }
}