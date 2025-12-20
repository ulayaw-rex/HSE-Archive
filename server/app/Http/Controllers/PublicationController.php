<?php

namespace App\Http\Controllers;

use App\Models\Publication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use App\Models\PublicationView;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\PrintMedia;
use App\Models\Comment;
use Illuminate\Support\Facades\Auth;

class PublicationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user('sanctum');
        $isAdmin = $user && (strtolower($user->role) === 'admin' || $user->tokenCan('role:admin'));

        $query = Publication::query();

        if (!$isAdmin) {
            $query->where('status', 'approved');
        }

        $publications = $query->with('writers') 
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($publication) {
                $publication->image = $publication->image_path
                    ? asset('storage/' . $publication->image_path)
                    : null;
                return $publication;
            });

        return response()->json($publications);
    }

public function store(Request $request)
{
    $currentUser = $request->user();
    
    $status = ($currentUser->role === 'admin') ? 'approved' : 'pending';

    $validator = Validator::make($request->all(), [
        'title' => 'required|string',
        'body' => 'required|string',
        'category' => 'required|string',
        'writer_ids' => 'required|array',       
        'writer_ids.*' => 'exists:users,id',    
        'image' => 'nullable|image|max:2048',
        'byline' => 'nullable|string', 
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    $finalByline = $request->byline;

    if (empty($finalByline)) {
        $writers = User::whereIn('id', $request->writer_ids)->get();
        
        $finalByline = $writers->pluck('name')->join(' & ');
    }

        \Log::info('User attempting to post:', ['user' => $request->user()]);

    $publication = Publication::create([
        'user_id' => $currentUser->id,
        'title' => $request->title,
        'body' => $request->body,
        'category' => $request->category,
        'photo_credits' => $request->photo_credits,
        'byline' => $finalByline, 
        'status' => $status,
        'views' => 0,
    ]);

    $publication->writers()->attach($request->writer_ids);

    if ($request->hasFile('image')) {
        $path = $request->file('image')->store('publications_images', 'public');
        $publication->update(['image_path' => $path]);
    }

    $publication->image = $publication->image_path ? asset('storage/' . $publication->image_path) : null;
    
    $publication->load('writers');

    return response()->json($publication, 201);
}
    public function show(Publication $publication, Request $request)
    {
        $user = $request->user('sanctum');

        $isAdmin = $user && ($user->role === 'admin' || $user->tokenCan('role:admin'));

        $isWriter = $user && $publication->writers->contains($user->id);

        if ($publication->status !== 'approved') {
             if (!$isAdmin && !$isWriter) {
                 return response()->json(['message' => 'This article is pending approval.'], 403);
             }
        }

        $hasViewedRecently = PublicationView::where('publication_id', $publication->publication_id)
            ->where('ip_address', $request->ip())
            ->where('created_at', '>=', now()->subMinutes(10)) 
            ->exists();

        if (!$hasViewedRecently) {

            PublicationView::create([
                'publication_id' => $publication->publication_id,
                'ip_address' => $request->ip(),
            ]);
    
            $publication->increment('views');
        }

        $publication->image = $publication->image_path ? asset('storage/' . $publication->image_path) : null;
        
        $publication->load('writers'); 

        return response()->json($publication);
    }    

    public function dashboardStats()
    {
        $categoryCounts = Publication::selectRaw('category, count(*) as count')
            ->groupBy('category')
            ->get()
            ->map(function ($item) {
                return ['name' => ucfirst($item->category), 'articles' => $item->count];
            });

        $startDate = Carbon::now()->subDays(6)->startOfDay();
        
        $views = PublicationView::select(
                DB::raw('DATE(created_at) as date'), 
                DB::raw('count(*) as views')
            )
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

        $mostViewed = DB::table('publication_views')
            ->join('publications', 'publication_views.publication_id', '=', 'publications.publication_id')
            ->where('publication_views.created_at', '>=', $startDate)
            ->select('publications.title as name', DB::raw('count(*) as value'))
            ->groupBy('publications.title')
            ->orderByDesc('value')
            ->limit(5)
            ->get();

        
        $totalArticles = Publication::count();

        $popular = Publication::orderBy('views', 'desc')->first();
        
        $mostPopularArticle = null;
        if ($popular) {
            $mostPopularArticle = [
                'title' => $popular->title,
                'views' => $popular->views,
                'date' => $popular->created_at->format('M d, Y') 
            ];
        }

        $articles = Publication::select('publication_id', 'title', 'created_at')
            ->latest()->take(5)->get()
            ->map(function ($item) {
                return [
                    'id' => 'art-' . $item->publication_id,
                    'type' => 'article',
                    'message' => 'New article: ' . \Illuminate\Support\Str::limit($item->title, 25),
                    'time' => $item->created_at->diffForHumans(),
                    'timestamp' => $item->created_at
                ];
            });

        $printMedia = PrintMedia::select('print_media_id', 'title', 'created_at')
            ->latest()->take(5)->get()
            ->map(function ($item) {
                return [
                    'id' => 'pm-' . $item->print_media_id,
                    'type' => 'printmedia', 
                    'message' => 'New print issue: ' . \Illuminate\Support\Str::limit($item->title, 25),
                    'time' => $item->created_at->diffForHumans(),
                    'timestamp' => $item->created_at
                ];
            });
        
        $recentUploads = $articles->merge($printMedia)->sortByDesc('timestamp')->values()->take(6);

        $recentComments = Comment::with('user:id,name')
            ->latest()->take(6)->get()
            ->map(function ($item) {
                return [
                    'id' => 'com-' . $item->id,
                    'type' => 'comment',
                    'message' => ($item->user ? $item->user->name : 'Unknown') . ' commented',
                    'subtext' => \Illuminate\Support\Str::limit($item->body, 30), 
                    'time' => $item->created_at->diffForHumans(),
                ];
            });

        $recentUsers = User::select('id', 'name', 'email', 'created_at')
            ->latest()->take(6)->get()
            ->map(function ($item) {
                return [
                    'id' => 'usr-' . $item->id,
                    'type' => 'user',
                    'message' => 'New user registered',
                    'subtext' => $item->name,
                    'time' => $item->created_at->diffForHumans(),
                ];
            });

        return response()->json([
            'weeklyEngagement' => $weeklyEngagement,
            'articlesByCategory' => $categoryCounts,
            'mostViewed' => $mostViewed,
            'totalArticles' => $totalArticles,
            'mostPopularArticle' => $mostPopularArticle,
            'activityUploads' => $recentUploads,
            'activityComments' => $recentComments,
            'activityUsers' => $recentUsers,
        ]);
    }

    public function search(Request $request)
    {
        $query = $request->input('q');
        if (!$query) return response()->json([]);

        $publications = Publication::where('status', 'approved')
            ->where(function($q) use ($query) {
                $q->where('title', 'LIKE', "%{$query}%")
                  ->orWhere('body', 'LIKE', "%{$query}%")
                  ->orWhere('byline', 'LIKE', "%{$query}%");
            })
            ->with('writers') 
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($publication) {
                $publication->image = $publication->image_path ? asset('storage/' . $publication->image_path) : null;
                return $publication;
            });

        return response()->json($publications);
    }
    
    public function update(Request $request, Publication $publication)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'body' => 'required|string',
            'category' => 'required|string|max:100',
            'photo_credits' => 'nullable|string|max:255',
            'image' => 'nullable|image|max:2048',
            'writer_ids' => 'sometimes|array',      
            'writer_ids.*' => 'exists:users,id',
            'status' => 'in:pending,approved,rejected'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only(['title', 'body', 'category', 'photo_credits', 'status']);

        if ($request->has('writer_ids')) {
            $publication->writers()->sync($request->writer_ids);
            
             if ($request->has('byline')) {
                 $data['byline'] = $request->byline;
             }
        }

        if ($request->hasFile('image')) {
            if ($publication->image_path) {
                Storage::disk('public')->delete($publication->image_path);
            }
            $data['image_path'] = $request->file('image')->store('publications_images', 'public');
        }

        $publication->update($data);
        $publication->image = $publication->image_path ? asset('storage/' . $publication->image_path) : null;
        
        $publication->load('writers'); 

        return response()->json($publication);
    }

    public function destroy(Publication $publication)
    {
        if ($publication->image_path) {
            Storage::disk('public')->delete($publication->image_path);
        }
        $publication->delete();
        return response()->json(['message' => 'Publication deleted successfully']);
    }

    public function getByCategory($category)
    {
        $publications = Publication::where('category', $category)
            ->where('status', 'approved') 
            ->with('writers') 
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($publication) {
                if ($publication->image_path) {
                    $publication->image = asset('storage/' . $publication->image_path);
                } else {
                    $publication->image = null;
                }
                return $publication;
            });

        return response()->json($publications);
    }


public function review(Request $request, $id)
{
    $publication = Publication::findOrFail($id);

    $request->validate([
        'status' => 'required|in:approved,rejected'
    ]);

    $publication->update(['status' => $request->status]);

    return response()->json([
        'message' => 'Article ' . $request->status . ' successfully',
        'data' => $publication
    ]);
}
}