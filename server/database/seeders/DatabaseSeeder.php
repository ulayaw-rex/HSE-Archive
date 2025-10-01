<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Add your seeder here
        $this->call([
            UserSeeder::class,
            // You can add other seeders here as well
        ]);
    }
}