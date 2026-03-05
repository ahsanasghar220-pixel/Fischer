<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StockController extends Controller
{
    /**
     * List all products with their variants and stock info.
     * GET /api/admin/stock
     */
    public function index(Request $request)
    {
        $search  = $request->get('search');
        $perPage = 50;

        $query = Product::with(['variants' => function ($q) {
            $q->orderBy('sort_order')->orderBy('id');
        }])->orderBy('name');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('model_number', 'like', "%{$search}%");
            });
        }

        $products = $query->paginate($perPage);

        $data = collect($products->items())->map(function ($product) {
            return [
                'id'             => $product->id,
                'name'           => $product->name,
                'sku'            => $product->sku,
                'stock_quantity' => $product->stock_quantity ?? 0,
                'stock_status'   => $product->stock_status ?? 'out_of_stock',
                'variants'       => $product->variants->map(fn($v) => [
                    'id'             => $v->id,
                    'name'           => $v->name,
                    'sku'            => $v->sku,
                    'stock_quantity' => $v->stock_quantity ?? 0,
                    'is_active'      => (bool) $v->is_active,
                ]),
            ];
        });

        return $this->success([
            'data' => $data,
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page'    => $products->lastPage(),
                'total'        => $products->total(),
            ],
        ]);
    }

    /**
     * Bulk update stock for specific products and/or variants.
     * PUT /api/admin/stock/bulk
     *
     * Body: {
     *   products: [{ id, stock_quantity, stock_status }],
     *   variants:  [{ id, stock_quantity }]
     * }
     */
    public function bulk(Request $request)
    {
        $request->validate([
            'products'                  => 'sometimes|array',
            'products.*.id'             => 'required|integer|exists:products,id',
            'products.*.stock_quantity' => 'required|integer|min:0',
            'products.*.stock_status'   => 'required|string|in:in_stock,out_of_stock,backorder,preorder',
            'variants'                  => 'sometimes|array',
            'variants.*.id'             => 'required|integer|exists:product_variants,id',
            'variants.*.stock_quantity' => 'required|integer|min:0',
        ]);

        DB::transaction(function () use ($request) {
            foreach ($request->input('products', []) as $row) {
                Product::where('id', $row['id'])->update([
                    'stock_quantity' => $row['stock_quantity'],
                    'stock_status'   => $row['stock_status'],
                ]);
            }
            foreach ($request->input('variants', []) as $row) {
                ProductVariant::where('id', $row['id'])->update([
                    'stock_quantity' => $row['stock_quantity'],
                ]);
            }
        });

        return $this->success(null, 'Stock updated successfully');
    }

    /**
     * Set ALL products and variants to the same quantity.
     * PUT /api/admin/stock/set-all
     *
     * Body: { stock_quantity: 100, stock_status: "in_stock" }
     */
    public function setAll(Request $request)
    {
        $request->validate([
            'stock_quantity' => 'required|integer|min:0',
            'stock_status'   => 'required|string|in:in_stock,out_of_stock,backorder,preorder',
        ]);

        $qty    = $request->integer('stock_quantity');
        $status = $request->input('stock_status');

        DB::transaction(function () use ($qty, $status) {
            DB::table('products')->update([
                'stock_quantity' => $qty,
                'stock_status'   => $status,
            ]);
            DB::table('product_variants')->update([
                'stock_quantity' => $qty,
            ]);
        });

        $productCount = DB::table('products')->count();
        $variantCount = DB::table('product_variants')->count();

        return $this->success(null, "Set {$productCount} products and {$variantCount} variants to {$qty}");
    }
}
