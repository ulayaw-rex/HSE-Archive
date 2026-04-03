<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\PublicationView;

class PurgeOldPublicationViews extends Command
{
    protected $signature = 'views:purge {--days=90 : Delete view records older than this many days}';
    
    protected $description = 'Purge old publication_views records to prevent unbounded table growth';

    public function handle(): int
    {
        $days = (int) $this->option('days');
        
        $deleted = PublicationView::where('created_at', '<', now()->subDays($days))->delete();

        $this->info("Purged {$deleted} publication view records older than {$days} days.");

        return Command::SUCCESS;
    }
}
