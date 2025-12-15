<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            // Resale products
            [
                'name' => 'Aqua 600ml',
                'type' => 'resale',
                'category_id' => 2, // Minuman
                'unit' => 'botol',
                'buy_price' => 3000,
                'price' => 5000,
                'stock' => 100,
                'profit_margin' => 30,
                'production_capacity' => 100,
            ],
            [
                'name' => 'Indomie Goreng',
                'type' => 'resale',
                'category_id' => 5, // Frozen Food
                'unit' => 'pcs',
                'buy_price' => 2500,
                'price' => 4000,
                'stock' => 150,
                'profit_margin' => 30,
                'production_capacity' => 150,
            ],
            [
                'name' => 'Chitato Sapi Panggang',
                'type' => 'resale',
                'category_id' => 3, // Snack
                'unit' => 'pack',
                'buy_price' => 8000,
                'price' => 12000,
                'stock' => 50,
                'profit_margin' => 30,
                'production_capacity' => 50,
            ],
            
            // Manufactured products
            [
                'name' => 'Brownies Coklat',
                'type' => 'manufactured',
                'category_id' => 4, // Roti & Kue
                'unit' => 'box',
                'profit_margin' => 40,
                'production_capacity' => 30,
                'stock' => 0,
            ],
            [
                'name' => 'Kue Nastar',
                'type' => 'manufactured',
                'category_id' => 4, // Roti & Kue
                'unit' => 'toples',
                'profit_margin' => 35,
                'production_capacity' => 20,
                'stock' => 0,
            ],
            [
                'name' => 'Roti Tawar',
                'type' => 'manufactured',
                'category_id' => 4, // Roti & Kue
                'unit' => 'loyang',
                'profit_margin' => 30,
                'production_capacity' => 50,
                'stock' => 0,
            ],
        ];

        foreach ($products as $productData) {
            Product::create($productData);
        }
    }
}
