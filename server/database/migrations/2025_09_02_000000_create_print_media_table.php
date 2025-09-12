<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::disableForeignKeyConstraints();

        Schema::create('print_media', function (Blueprint $table) {
            $table->increments('print_media_id');
            $table->string('title');
            $table->string('type'); // e.g., 'folio', 'magazine', 'tabloid', 'other'
            $table->date('date');
            $table->text('description');
            $table->string('image_path')->nullable();
            $table->string('file_path')->nullable();
            $table->timestamps();
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('print_media');
        Schema::enableForeignKeyConstraints();
    }
};
