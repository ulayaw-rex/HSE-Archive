<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Publication;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Str;
use Carbon\CarbonPeriod;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon; 

class AnalyticsController extends Controller
{
    public function getArticleStats(Request $request)
    {
        $startDate = $request->input('start_date') . ' 00:00:00';
        $endDate = $request->input('end_date') . ' 23:59:59';

        $stats = Publication::with('writers')
            ->whereRaw("COALESCE(date_published, created_at) BETWEEN ? AND ?", [$startDate, $endDate])
            ->where('status', 'approved')
            ->orderBy('views', 'desc')
            ->paginate(10);

        $stats->through(function ($pub) {
            $publishedDate = $pub->date_published ? Carbon::parse($pub->date_published) : null;
            $createdDate = Carbon::parse($pub->created_at);

            return [
                'title' => $pub->title,
                'category' => ucfirst($pub->category),
                'views' => $pub->views,
                'date_published' => $publishedDate ? $publishedDate->format('Y-m-d') : null,
                'created_at' => $createdDate->format('Y-m-d'),
                'author_name' => $pub->writers->pluck('name')->implode(', ') ?: 'Unknown',
            ];
        });

        return response()->json($stats);
    }

    public function getStaffStats(Request $request)
    {
        $startDate = $request->input('start_date') . ' 00:00:00';
        $endDate = $request->input('end_date') . ' 23:59:59';

        $stats = User::withCount(['publications' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('date_published', [$startDate, $endDate])
                      ->where('status', 'approved');
            }])
            ->whereHas('publications', function ($query) use ($startDate, $endDate) {
                $query->whereBetween('date_published', [$startDate, $endDate])
                      ->where('status', 'approved');
            })
            ->orderBy('publications_count', 'desc')
            ->paginate(10); 

        $stats->through(function ($user) {
            $lastActive = $user->updated_at ? Carbon::parse($user->updated_at)->format('Y-m-d') : 'N/A';
            
            return [
                'name' => $user->name,
                'position' => $user->position ?? 'Staff',
                'article_count' => $user->publications_count,
                'last_active' => $lastActive,
            ];
        });

        return response()->json($stats);
    }

    public function getTrendStats(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
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
                DATE_FORMAT(COALESCE(date_published, created_at), ?) as date, 
                category, 
                COUNT(*) as count
            ", [$sqlFormat])
            ->whereRaw("COALESCE(date_published, created_at) BETWEEN ? AND ?", [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->where('status', 'approved')
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
        $startDate = $request->input('start_date') . ' 00:00:00';
        $endDate = $request->input('end_date') . ' 23:59:59';

        if ($type === 'staff') {
            return $this->exportStaff($startDate, $endDate, $format);
        } else {
            return $this->exportArticles($startDate, $endDate, $format);
        }
    }

    private function exportArticles($startDate, $endDate, $format) {
        $data = Publication::with('writers')
            ->whereRaw("COALESCE(date_published, created_at) BETWEEN ? AND ?", [$startDate, $endDate])
            ->where('status', 'approved')
            ->get();

        if ($format === 'pdf') {
            $pdf = Pdf::loadView('exports.articles_pdf', ['data' => $data]);
            return $pdf->download('article-report.pdf');
        }

        $csvContent = "Title,Category,Authors,Views,Date Published\n";
        foreach ($data as $pub) {
            $authors = $pub->writers->pluck('name')->implode(', ') ?: 'Unknown';
            $title = '"' . str_replace('"', '""', $pub->title) . '"';
            
            $dateObj = $pub->date_published ? Carbon::parse($pub->date_published) : Carbon::parse($pub->created_at);
            $date = $dateObj->format('Y-m-d');
            
            $csvContent .= "{$title},{$pub->category},\"{$authors}\",{$pub->views},{$date}\n";
        }
        return response($csvContent)->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="articles.csv"');
    }

    private function exportStaff($startDate, $endDate, $format) {
        $data = User::withCount(['publications' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('date_published', [$startDate, $endDate])
                      ->where('status', 'approved');
            }])
            ->whereHas('publications', function ($query) use ($startDate, $endDate) {
                $query->whereBetween('date_published', [$startDate, $endDate])
                      ->where('status', 'approved');
            })
            ->orderBy('publications_count', 'desc')
            ->get();

        if ($format === 'pdf') {
            $pdf = Pdf::loadView('exports.staff_pdf', ['data' => $data]);
            return $pdf->download('staff-performance.pdf');
        }

        $csvContent = "Name,Position,Articles Published,Last Active\n";
        foreach ($data as $user) {
            $lastActive = $user->updated_at ? Carbon::parse($user->updated_at)->format('Y-m-d') : 'N/A';
            $csvContent .= "{$user->name},{$user->position},{$user->publications_count},{$lastActive}\n";
        }
        return response($csvContent)->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="staff-performance.csv"');
    }
}