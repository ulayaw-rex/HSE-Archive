<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('publications', function (Blueprint $table) {
            $table->id('publication_id'); 

            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->longText('body');
            $table->string('category')->index(); 
            $table->string('byline')->nullable();
            $table->string('photo_credits')->nullable();
            
            $table->string('image_path')->nullable();
            $table->string('thumbnail_path')->nullable();

            $table->string('status')->default('submitted')->index(); 
            
            $table->unsignedBigInteger('views')->default(0);
            $table->timestamp('date_published')->nullable()->index(); 

            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('reviewed_at')->nullable();

            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();

            $table->timestamps();

            $table->index(['status', 'category', 'date_published'], 'pub_ranking_index');
        });

        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'position')) {
                $table->string('position')->nullable()->after('role');
            }
            $table->index('position', 'users_position_index');
        });
    }

    public function down()
    {
        Schema::dropIfExists('publications');
        
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('users_position_index');
        });
    }
};