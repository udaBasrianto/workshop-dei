<?php

namespace Database\Seeders;

use App\Models\Material;
use Illuminate\Database\Seeder;

class MaterialSeeder extends Seeder
{
    public function run(): void
    {
        $materials = [
            ['item' => 'Tepung Terigu', 'unit' => 'kg', 'price' => 12000, 'stock' => 50],
            ['item' => 'Gula Pasir', 'unit' => 'kg', 'price' => 15000, 'stock' => 30],
            ['item' => 'Mentega', 'unit' => 'kg', 'price' => 45000, 'stock' => 20],
            ['item' => 'Telur', 'unit' => 'kg', 'price' => 28000, 'stock' => 40],
            ['item' => 'Susu Cair', 'unit' => 'liter', 'price' => 18000, 'stock' => 25],
            ['item' => 'Coklat Bubuk', 'unit' => 'kg', 'price' => 65000, 'stock' => 15],
            ['item' => 'Vanili', 'unit' => 'botol', 'price' => 8000, 'stock' => 10],
            ['item' => 'Baking Powder', 'unit' => 'kg', 'price' => 25000, 'stock' => 8],
        ];

        foreach ($materials as $material) {
            Material::create($material);
        }
    }
}
