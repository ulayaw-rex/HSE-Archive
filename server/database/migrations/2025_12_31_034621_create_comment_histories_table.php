<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('comment_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('comment_id')->constrained('comments')->onDelete('cascade');
            $table->text('body');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('comment_histories');
        
        if (Schema::hasColumn('comments', 'is_edited')) {
            Schema::table('comments', function (Blueprint $table) {
                $table->dropColumn('is_edited');
            });
        }
    }
};