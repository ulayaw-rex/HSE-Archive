<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
public function up()
{
    Schema::table('users', function (Blueprint $table) {
        $table->string('department')->nullable()->after('email');
        $table->string('year_graduated')->nullable()->after('course'); 
    });
}

public function down()
{
    Schema::table('users', function (Blueprint $table) {
        $table->dropColumn(['department', 'year_graduated']);
    });
}
};
