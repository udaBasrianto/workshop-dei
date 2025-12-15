<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('materials', function (Blueprint $table) {
            $table->string('image')->nullable()->after('stock');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->string('image')->nullable()->after('profit_margin');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('materials', function (Blueprint $table) {
            $table->dropColumn('image');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('image');
        });
    }
};
