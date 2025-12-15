<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('type')->default('manufactured'); // 'manufactured', 'resale'
            $table->decimal('buy_price', 15, 2)->nullable(); // Harga Modal (for resale)
            $table->decimal('price', 15, 2)->nullable(); // Harga Jual Manual
            $table->integer('stock')->default(0); // Stok Produk Jadi
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['type', 'buy_price', 'price', 'stock']);
        });
    }
};
