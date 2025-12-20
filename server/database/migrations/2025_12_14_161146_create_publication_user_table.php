<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
public function up()
{
    Schema::create('publication_user', function (Blueprint $table) {
        $table->id();
        
        $table->foreignId('publication_id')
              ->constrained('publications', 'publication_id') 
              ->onDelete('cascade');
        
        $table->foreignId('user_id')
              ->constrained('users')
              ->onDelete('cascade');
        
        $table->unique(['publication_id', 'user_id']); 
    });

}    public function down(): void
    {
        Schema::dropIfExists('publication_user');
    }
};
