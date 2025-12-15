<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        $customers = [
            [
                'name' => 'Budi Santoso',
                'phone' => '081234567890',
                'email' => 'budi@example.com',
                'address' => 'Jl. Merdeka No. 123, Jakarta',
                'points' => 50,
            ],
            [
                'name' => 'Siti Nurhaliza',
                'phone' => '081234567891',
                'email' => 'siti@example.com',
                'address' => 'Jl. Sudirman No. 45, Bandung',
                'points' => 120,
            ],
            [
                'name' => 'Ahmad Rizki',
                'phone' => '081234567892',
                'email' => 'ahmad@example.com',
                'address' => 'Jl. Gatot Subroto No. 78, Surabaya',
                'points' => 30,
            ],
            [
                'name' => 'Dewi Lestari',
                'phone' => '081234567893',
                'email' => 'dewi@example.com',
                'address' => 'Jl. Ahmad Yani No. 90, Yogyakarta',
                'points' => 85,
            ],
            [
                'name' => 'Rudi Hartono',
                'phone' => '081234567894',
                'email' => 'rudi@example.com',
                'address' => 'Jl. Diponegoro No. 12, Semarang',
                'points' => 0,
            ],
        ];

        foreach ($customers as $customer) {
            Customer::create($customer);
        }
    }
}
