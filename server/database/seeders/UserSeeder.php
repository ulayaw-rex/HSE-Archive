<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User; // <-- Import the User model
use Illuminate\Support\Facades\Hash; // <-- Import the Hash facade

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@example.com'], // <-- Unique identifier to find the user
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'), // <-- Change 'password' to a secure password
                'role' => User::ROLE_ADMIN, // <-- Use the constant from your User model
                'email_verified_at' => now(), // <-- Optionally verify the email right away
            ]
        );

        // You can also add other users here if you want
        // For example, a regular 'hillsider' user:
        /*
        User::firstOrCreate(
            ['email' => 'hillsider@example.com'],
            [
                'name' => 'Hillsider User',
                'password' => Hash::make('password'),
                'role' => User::ROLE_HILLSIDER,
                'email_verified_at' => now(),
            ]
        );
        */
    }
}