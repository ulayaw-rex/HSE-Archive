<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('print_media_owners', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('print_media_id');
            
            $table->unsignedBigInteger('user_id');

            $table->timestamps();

            $table->foreign('print_media_id')
                  ->references('print_media_id') 
                  ->on('print_media')
                  ->onDelete('cascade');

            $table->foreign('user_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');

            $table->unique(['print_media_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('print_media_owners');
    }
};