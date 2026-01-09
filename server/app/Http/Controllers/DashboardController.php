<?php

namespace App\Http\Controllers;

use App\Models\Publication;
use App\Models\PublicationView;
use App\Models\PrintMedia;
use App\Models\Comment;
use App\Models\User;
use App\Models\CreditRequest; 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $cachedStats = Cache::remember('admin_dashboard_graphs', 300, function () {
            $startDate = Carbon::now()->subDays(6)->startOfDay();

            $views = PublicationView::select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as views'))
                ->where('created_at', '>=', $startDate)
                ->groupBy('date')
                ->get()
                ->keyBy('date');

            $weeklyEngagement = [];
            for ($i = 6; $i >= 0; $i--) {
                $date = Carbon::now()->subDays($i);
                $dateString = $date->format('Y-m-d');
                $weeklyEngagement[] = [
                    'name' => $date->format('D'), 
                    'views' => isset($views[$dateString]) ? $views[$dateString]->views : 0
                ];
            }

            $categoryCounts = Publication::selectRaw('category, count(*) as count')
                ->groupBy('category')
                ->get()
                ->map(fn($item) => ['name' => ucfirst($item->category), 'articles' => $item->count]);

            $mostViewed = DB::table('publication_views')
                ->join('publications', 'publication_views.publication_id', '=', 'publications.publication_id')
                ->where('publication_views.created_at', '>=', $startDate)
                ->select('publications.title as name', DB::raw('count(*) as value'))
                ->groupBy('publications.title')
                ->orderByDesc('value')
                ->limit(5)
                ->get();

            return [
                'weeklyEngagement' => $weeklyEngagement,
                'articlesByCategory' => $categoryCounts,
                'mostViewed' => $mostViewed,
            ];
        });

        
        $totalArticles = Publication::count();
        $popular = Publication::orderBy('views', 'desc')->first();
        $mostPopularArticle = $popular ? [
            'title' => $popular->title,
            'views' => $popular->views,
            'date' => $popular->created_at->format('M d, Y') 
        ] : null;

        $articles = Publication::select('publication_id', 'title', 'created_at')
            ->latest()->take(5)->get()
            ->map(fn($item) => [
                'id' => 'art-' . $item->publication_id,
                'type' => 'article',
                'message' => 'New article: ' . Str::limit($item->title, 25),
                'time' => $item->created_at->diffForHumans(),
                'timestamp' => $item->created_at
            ]);

        $printMedia = PrintMedia::select('print_media_id', 'title', 'created_at')
            ->latest()->take(5)->get()
            ->map(fn($item) => [
                'id' => 'pm-' . $item->print_media_id,
                'type' => 'printmedia', 
                'message' => 'New print issue: ' . Str::limit($item->title, 25),
                'time' => $item->created_at->diffForHumans(),
                'timestamp' => $item->created_at
            ]);
        
        $recentUploads = $articles->merge($printMedia)->sortByDesc('timestamp')->values()->take(6);

        $recentComments = Comment::with('user:id,name')->latest()->take(6)->get()
            ->map(fn($item) => [
                'id' => 'com-' . $item->id,
                'type' => 'comment',
                'message' => ($item->user ? $item->user->name : 'Unknown') . ' commented',
                'subtext' => Str::limit($item->body, 30), 
                'time' => $item->created_at->diffForHumans(),
            ]);

        $recentUsers = User::select('id', 'name', 'email', 'created_at')->latest()->take(6)->get()
            ->map(fn($item) => [
                'id' => 'usr-' . $item->id,
                'type' => 'user',
                'message' => 'New user registered',
                'subtext' => $item->name,
                'time' => $item->created_at->diffForHumans(),
            ]);

        $pendingUsers = User::where('status', 'pending')->latest()->get(); 
        $pendingReviews = Publication::where('status', 'pending')->latest()->get();
        $creditRequests = CreditRequest::with('user:id,name,email')->latest()->get();

        return response()->json([
            'stats' => array_merge($cachedStats, [
                'totalArticles' => $totalArticles,
                'mostPopularArticle' => $mostPopularArticle,
                'activityUploads' => $recentUploads,
                'activityComments' => $recentComments,
                'activityUsers' => $recentUsers,
            ]),
            'pendingUsers' => $pendingUsers,
            'pendingReviews' => $pendingReviews,
            'creditRequests' => $creditRequests,
        ]);
    }
}