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
        Schema::table('print_media', function (Blueprint $table) {
            $table->string('byline')->nullable()->after('description');
            $table->string('original_file_path')->nullable();
            $table->string('original_filename')->nullable();
            $table->string('file_path')->change(); 

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('print_media', function (Blueprint $table) {
            $table->dropColumn('byline');
            $table->dropColumn(['original_file_path', 'original_filename']);
            $table->string('file_path')->change();

        });
    }
};
