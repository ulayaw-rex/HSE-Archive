<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('print_media', function (Blueprint $table) {
            $table->string('original_file_path')->nullable();
            $table->string('original_filename')->nullable();
            $table->string('file_path')->change(); // Make existing column nullable
        });
    }

    public function down()
    {
        Schema::table('print_media', function (Blueprint $table) {
            $table->dropColumn(['original_file_path', 'original_filename']);
            $table->string('file_path')->change();
        });
    }
};
