<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('print_media', function (Blueprint $table) {
            $table->foreignId('user_id')
                  ->nullable()
                  ->after('print_media_id') 
                  ->constrained('users')
                  ->onDelete('set null'); 
        });
    }

    public function down(): void
    {
        Schema::table('print_media', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
        });
    }
};