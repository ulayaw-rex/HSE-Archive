<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::disableForeignKeyConstraints();

        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['hillsider', 'alumni', 'admin'])->default('hillsider')->after('password');
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::disableForeignKeyConstraints();

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });

        Schema::enableForeignKeyConstraints();
    }
};
