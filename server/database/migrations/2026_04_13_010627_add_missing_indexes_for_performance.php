<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasIndex('users', 'users_status_index')) {
                $table->index('status', 'users_status_index');
            }
        });

        Schema::table('contact_submissions', function (Blueprint $table) {
            if (!Schema::hasIndex('contact_submissions', 'contact_submissions_is_read_index')) {
                $table->index('is_read', 'contact_submissions_is_read_index');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasIndex('users', 'users_status_index')) {
                $table->dropIndex('users_status_index');
            }
        });

        Schema::table('contact_submissions', function (Blueprint $table) {
            if (Schema::hasIndex('contact_submissions', 'contact_submissions_is_read_index')) {
                $table->dropIndex('contact_submissions_is_read_index');
            }
        });
    }
};
