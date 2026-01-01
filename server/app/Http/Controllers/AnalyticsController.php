<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Publication;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Str;
use Carbon\CarbonPeriod;

class AnalyticsController extends Controller
{
    public function getArticleStats(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth());
        $endDate = $request->input('end_date', now()->endOfMonth());

        $stats = Publication::with('writers')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->orderBy('views', 'desc')
            ->get()
            ->map(function ($pub) {
                return [
                    'title' => $pub->title,
                    'category' => $pub->category,
                    'views' => $pub->views,
                    'created_at' => $pub->created_at->format('Y-m-d'),
                    'author_name' => $pub->writers->pluck('name')->implode(', ') ?: 'Unknown',
                ];
            });

        return response()->json($stats);
    }

    public function getStaffStats(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth());
        $endDate = $request->input('end_date', now()->endOfMonth());

        $stats = User::withCount(['publications' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('created_at', [$startDate, $endDate]);
            }])
            ->whereHas('publications', function ($query) use ($startDate, $endDate) {
                $query->whereBetween('created_at', [$startDate, $endDate]);
            })
            ->orderBy('publications_count', 'desc')
            ->get()
            ->map(function ($user) {
                return [
                    'name' => $user->name,
                    'position' => $user->position ?? 'Staff',
                    'article_count' => $user->publications_count,
                    'last_active' => $user->updated_at->format('Y-m-d'),
                ];
            });

        return response()->json($stats);
    }

    public function getTrendStats(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth());
        $endDate = $request->input('end_date', now()->endOfMonth());
        $granularity = $request->input('granularity', 'daily'); 

        $interval = $granularity === 'monthly' ? '1 month' : '1 day';
        $format = $granularity === 'monthly' ? 'Y-m' : 'Y-m-d';
        
        $period = CarbonPeriod::create($startDate, $interval, $endDate);
        
        $data = [];
        foreach ($period as $date) {
            $key = $date->format($format);
            $data[$key] = ['date' => $key]; 
        }

        $sqlFormat = $granularity === 'monthly' ? '%Y-%m' : '%Y-%m-%d';

        $raw = Publication::selectRaw("
                DATE_FORMAT(created_at, ?) as date, 
                category, 
                COUNT(*) as count
            ", [$sqlFormat])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date', 'category')
            ->orderBy('date', 'asc')
            ->get();

        $categories = [];

        foreach ($raw as $entry) {
            $date = $entry->date;
            $cat = ucfirst($entry->category); 
            
            if (isset($data[$date])) {
                $data[$date][$cat] = $entry->count;
            }
            
            if (!in_array($cat, $categories)) {
                $categories[] = $cat;
            }
        }

        $formattedData = array_values($data); 
        
        foreach ($formattedData as &$row) {
            foreach ($categories as $cat) {
                if (!isset($row[$cat])) {
                    $row[$cat] = 0;
                }
            }
        }

        return response()->json([
            'data' => $formattedData,
            'categories' => $categories 
        ]);
    }

    public function exportStats(Request $request)
    {
        $format = $request->input('format', 'pdf');
        $type = $request->input('type', 'articles'); 
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        if ($type === 'staff') {
            return $this->exportStaff($startDate, $endDate, $format);
        } else {
            return $this->exportArticles($startDate, $endDate, $format);
        }
    }

    private function exportArticles($startDate, $endDate, $format) {
        $data = Publication::with('writers')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get();

        if ($format === 'pdf') {
            $pdf = Pdf::loadView('exports.articles_pdf', ['data' => $data]);
            return $pdf->download('article-report.pdf');
        } 

        $csvContent = "Title,Category,Authors,Views,Date\n";
        foreach ($data as $pub) {
            $authors = $pub->writers->pluck('name')->implode(', ') ?: 'Unknown';
            $title = '"' . str_replace('"', '""', $pub->title) . '"';
            $csvContent .= "{$title},{$pub->category},\"{$authors}\",{$pub->views},{$pub->created_at}\n";
        }
        return response($csvContent)->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="articles.csv"');
    }

    private function exportStaff($startDate, $endDate, $format) {
        $data = User::withCount(['publications' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('created_at', [$startDate, $endDate]);
            }])
            ->whereHas('publications', function ($query) use ($startDate, $endDate) {
                $query->whereBetween('created_at', [$startDate, $endDate]);
            })
            ->orderBy('publications_count', 'desc')
            ->get();

        if ($format === 'pdf') {
            $pdf = Pdf::loadView('exports.staff_pdf', ['data' => $data]);
            return $pdf->download('staff-performance.pdf');
        }

        $csvContent = "Name,Position,Articles Published,Last Active\n";
        foreach ($data as $user) {
            $csvContent .= "{$user->name},{$user->position},{$user->publications_count},{$user->updated_at}\n";
        }
        return response($csvContent)->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="staff-performance.csv"');
    }
}