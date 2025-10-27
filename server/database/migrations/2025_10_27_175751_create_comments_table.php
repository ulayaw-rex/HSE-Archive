<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    public function up(): void
    {
        Schema::disableForeignKeyConstraints(); 

        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->text('body'); // The text of the comment

            // This links to the 'users' table
            $table->foreignId('user_id')
                  ->constrained('users')
                  ->onDelete('cascade');

            // This links to the 'publications' table
            $table->unsignedInteger('publication_id'); // Must be integer to match 'increments()'
            
            $table->foreign('publication_id')
                  ->references('publication_id')
                  ->on('publications')
                  ->onDelete('cascade');

            $table->timestamps();
        });

        Schema::enableForeignKeyConstraints(); 
    }


    public function down(): void
    {
        Schema::disableForeignKeyConstraints(); 

        Schema::dropIfExists('comments');
        
        Schema::enableForeignKeyConstraints(); 
    }
};