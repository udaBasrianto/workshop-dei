<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Makanan', 'slug' => 'makanan', 'description' => 'Produk makanan dan kue'],
            ['name' => 'Minuman', 'slug' => 'minuman', 'description' => 'Produk minuman segar'],
            ['name' => 'Snack', 'slug' => 'snack', 'description' => 'Camilan dan snack ringan'],
            ['name' => 'Roti & Kue', 'slug' => 'roti-kue', 'description' => 'Roti dan kue kering'],
            ['name' => 'Frozen Food', 'slug' => 'frozen-food', 'description' => 'Makanan beku siap saji'],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
