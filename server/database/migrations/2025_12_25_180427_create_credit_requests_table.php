<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('credit_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            $table->unsignedBigInteger('requestable_id');
            $table->string('requestable_type'); 
            
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamps();

            $table->unique(['user_id', 'requestable_id', 'requestable_type'], 'user_request_unique'); 
            
            $table->index(['requestable_id', 'requestable_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('credit_requests');
    }
};