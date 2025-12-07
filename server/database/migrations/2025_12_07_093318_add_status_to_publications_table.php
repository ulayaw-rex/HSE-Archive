<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
public function up(): void
{
    Schema::table('publications', function (Blueprint $table) {
        $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending')->after('category');
    });
}
    public function down(): void
    {
        Schema::table('publications', function (Blueprint $table) {
        });
    }
};
