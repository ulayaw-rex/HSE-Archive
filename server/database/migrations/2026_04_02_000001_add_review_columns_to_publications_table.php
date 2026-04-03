<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('publications', function (Blueprint $table) {
            if (!Schema::hasColumn('publications', 'thumbnail_path')) {
                $table->string('thumbnail_path')->nullable()->after('image_path');
            }
            if (!Schema::hasColumn('publications', 'reviewed_by')) {
                $table->unsignedBigInteger('reviewed_by')->nullable()->after('status');
            }
            if (!Schema::hasColumn('publications', 'reviewed_at')) {
                $table->timestamp('reviewed_at')->nullable()->after('reviewed_by');
            }
            if (!Schema::hasColumn('publications', 'approved_by')) {
                $table->unsignedBigInteger('approved_by')->nullable()->after('reviewed_at');
            }
            if (!Schema::hasColumn('publications', 'approved_at')) {
                $table->timestamp('approved_at')->nullable()->after('approved_by');
            }
        });
    }

    public function down(): void
    {
        Schema::table('publications', function (Blueprint $table) {
            $table->dropColumn(['thumbnail_path', 'reviewed_by', 'reviewed_at', 'approved_by', 'approved_at']);
        });
    }
};
