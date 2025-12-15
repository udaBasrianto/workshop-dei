<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Admin',
            'email' => 'admin@deistok.com',
            'password' => bcrypt('admin123'),
        ]);

        // Run all seeders
        $this->call([
            CategorySeeder::class,
            MaterialSeeder::class,
            ProductSeeder::class,
            CustomerSeeder::class,
        ]);
    }
}
