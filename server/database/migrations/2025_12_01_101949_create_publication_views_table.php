<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
public function up(): void
{
    Schema::enableForeignKeyConstraints();
    
    Schema::create('publication_views', function (Blueprint $table) {
        $table->id();
        $table->foreignId('publication_id')->constrained()->onDelete('cascade');
        $table->string('ip_address')->nullable(); 
        $table->timestamps(); 
    });
    
    Schema::disableForeignKeyConstraints();

}

    public function down(): void
    {
        Schema::enableForeignKeyConstraints();
        Schema::dropIfExists('publication_views');
        Schema::disableForeignKeyConstraints();

    }
};
