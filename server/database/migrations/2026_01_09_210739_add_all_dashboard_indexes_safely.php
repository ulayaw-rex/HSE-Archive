<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $this->safeAddIndex('publications', 'status', 'publications_status_index');
        $this->safeAddIndex('publications', 'category', 'publications_category_index');
        $this->safeAddIndex('publications', 'user_id', 'publications_user_id_index');
        $this->safeAddIndex('publications', 'views', 'publications_views_index');     // For "Most Popular"
        $this->safeAddIndex('publications', 'created_at', 'publications_created_at_index'); // For "Recent"
        
        if (Schema::hasTable('publications') && !Schema::hasIndex('publications', 'publications_status_category_index')) {
            Schema::table('publications', function (Blueprint $table) {
                $table->index(['status', 'category'], 'publications_status_category_index');
            });
        }


        $this->safeAddIndex('publication_views', 'created_at', 'publication_views_created_at_index');
        $this->safeAddIndex('publication_views', 'publication_id', 'publication_views_publication_id_index');


        $this->safeAddIndex('users', 'role', 'users_role_index');
        $this->safeAddIndex('users', 'created_at', 'users_created_at_index');


        $this->safeAddIndex('comments', 'created_at', 'comments_created_at_index');


        $this->safeAddIndex('print_media', 'created_at', 'print_media_created_at_index');
    }

    protected function safeAddIndex($tableName, $columnName, $indexName)
    {
        if (Schema::hasTable($tableName) && !Schema::hasIndex($tableName, $indexName)) {
            Schema::table($tableName, function (Blueprint $table) use ($columnName, $indexName) {
                $table->index($columnName, $indexName);
            });
        }
    }

    public function down(): void
    {
        
        $this->safeDropIndex('publications', ['status', 'category']);
        $this->safeDropIndex('publications', 'status');
        $this->safeDropIndex('publications', 'category');
        $this->safeDropIndex('publications', 'user_id');
        $this->safeDropIndex('publications', 'views');
        $this->safeDropIndex('publications', 'created_at');

        $this->safeDropIndex('publication_views', 'created_at');
        $this->safeDropIndex('publication_views', 'publication_id');

        $this->safeDropIndex('users', 'role');
        $this->safeDropIndex('users', 'created_at');

        $this->safeDropIndex('comments', 'created_at');
        $this->safeDropIndex('print_media', 'created_at');
    }

    protected function safeDropIndex($tableName, $indexName)
    {
        if (Schema::hasTable($tableName)) {
            Schema::table($tableName, function (Blueprint $table) use ($indexName) {
                $table->dropIndex(is_array($indexName) ? $indexName : [$indexName]);
            });
        }
    }
};