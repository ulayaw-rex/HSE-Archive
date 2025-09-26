<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('print_media', function (Blueprint $table) {
            $table->string('thumbnail_path')->nullable()->after('file_path');
        });
    }

    public function down()
    {
        Schema::table('print_media', function (Blueprint $table) {
            $table->dropColumn('thumbnail_path');
        });
    }
};
