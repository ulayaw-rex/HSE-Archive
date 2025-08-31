<?php

namespace App\Http\Controllers;

use App\Models\News;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class NewsController extends Controller
{
    public function index()
    {
        return response()->json(News::orderByDesc('created_at')->get());
    }

    public function show(News $news)
    {
        return response()->json($news);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'excerpt' => 'nullable|string',
            'image_url' => 'nullable|string',
            'href' => 'nullable|string',
            'date' => 'nullable|string',
            'content' => 'nullable|string',
        ]);

        $news = News::create($validated);
        return response()->json($news, Response::HTTP_CREATED);
    }

    public function update(Request $request, News $news)
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'excerpt' => 'nullable|string',
            'image_url' => 'nullable|string',
            'href' => 'nullable|string',
            'date' => 'nullable|string',
            'content' => 'nullable|string',
        ]);

        $news->update($validated);
        return response()->json($news);
    }

    public function destroy(News $news)
    {
        $news->delete();
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }

    public function dashboardStats()
    {
        $totalArticles = News::count();
        $mostPopularArticle = News::orderByDesc('views')->first();

        return response()->json([
            'totalArticles' => $totalArticles,
            'mostPopularArticle' => $mostPopularArticle ? [
                'id' => $mostPopularArticle->id,
                'title' => $mostPopularArticle->title,
                'excerpt' => $mostPopularArticle->excerpt,
                'views' => $mostPopularArticle->views,
                'date' => $mostPopularArticle->date,
            ] : null,
        ]);
    }

    public function incrementViews(News $news)
    {
        $news->increment('views');
        return response()->json(['views' => $news->views]);
    }
}


