<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StockResetSeeder extends Seeder
{
    public function run(): void
    {
        // Set all products to 100 stock and in_stock status
        DB::table('products')->update([
            'stock_quantity' => 100,
            'stock_status'   => 'in_stock',
        ]);

        // Set all product variants to 100 stock
        DB::table('product_variants')->update([
            'stock_quantity' => 100,
        ]);

        $productCount = DB::table('products')->count();
        $variantCount = DB::table('product_variants')->count();

        $this->command->info("Updated {$productCount} products and {$variantCount} variants to stock_quantity = 100.");
    }
}
