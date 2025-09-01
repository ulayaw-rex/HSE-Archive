<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\News;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create sample users
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);

        User::create([
            'name' => 'John Hillsider',
            'email' => 'john@example.com',
            'password' => Hash::make('password123'),
            'role' => 'hillsider',
        ]);

        User::create([
            'name' => 'Jane Alumni',
            'email' => 'jane@example.com',
            'password' => Hash::make('password123'),
            'role' => 'alumni',
        ]);

        User::create([
            'name' => 'Guest User',
            'email' => 'guest@example.com',
            'password' => Hash::make('password123'),
            'role' => 'guest',
        ]);

        // Create sample news
        News::create([
            'title' => 'Welcome to HSE Archive',
            'excerpt' => 'This is a sample news article for testing purposes.',
            'content' => 'This is the full content of the sample news article. It contains more detailed information about the topic.',
            'image_url' => 'https://via.placeholder.com/300x200',
            'href' => '/news/1',
            'date' => '2025-09-01',
            'views' => 0,
        ]);

        News::create([
            'title' => 'Another Sample Article',
            'excerpt' => 'This is another sample news article.',
            'content' => 'This is the full content of another sample news article.',
            'image_url' => 'https://via.placeholder.com/300x200',
            'href' => '/news/2',
            'date' => '2025-09-01',
            'views' => 5,
        ]);
    }
}
