<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('print_media', function (Blueprint $table) {
            $table->date('date_published')->nullable()->after('description');
        });
    }

    public function down()
    {
        Schema::table('print_media', function (Blueprint $table) {
            $table->dropColumn('date_published');
        });
    }
};