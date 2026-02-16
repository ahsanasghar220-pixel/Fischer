<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\SaleProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaleController extends Controller
{
    public function index(Request $request)
    {
        $page = $request->get('page', 1);
        $search = $request->get('search');
        $perPage = 15;

        $query = Sale::withCount('saleProducts as products_count');

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        $sales = $query->orderByDesc('created_at')
            ->paginate($perPage, ['*'], 'page', $page);

        return $this->success([
            'data' => $sales->items(),
            'meta' => [
                'current_page' => $sales->currentPage(),
                'last_page' => $sales->lastPage(),
                'total' => $sales->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'banner_image' => 'nullable|string|max:500',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_active' => 'boolean',
            'products' => 'nullable|array',
            'products.*.product_id' => 'required|integer|exists:products,id',
            'products.*.sale_price' => 'nullable|numeric|min:0',
        ]);

        return DB::transaction(function () use ($validated) {
            $sale = Sale::create([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'banner_image' => $validated['banner_image'] ?? null,
                'start_date' => $validated['start_date'] ?? null,
                'end_date' => $validated['end_date'] ?? null,
                'is_active' => $validated['is_active'] ?? true,
            ]);

            if (!empty($validated['products'])) {
                foreach ($validated['products'] as $i => $product) {
                    SaleProduct::create([
                        'sale_id' => $sale->id,
                        'product_id' => $product['product_id'],
                        'sale_price' => !empty($product['sale_price']) ? $product['sale_price'] : null,
                        'sort_order' => $i,
                    ]);
                }
            }

            return $this->success(['data' => $sale->load('saleProducts')], 'Sale created successfully', 201);
        });
    }

    public function show($id)
    {
        $sale = Sale::with(['saleProducts.product:id,name,price'])->findOrFail($id);

        $data = $sale->toArray();
        $data['products'] = $sale->saleProducts->map(function ($sp) {
            return [
                'id' => $sp->id,
                'product_id' => $sp->product_id,
                'product_name' => $sp->product?->name,
                'sale_price' => $sp->sale_price,
                'sort_order' => $sp->sort_order,
            ];
        });

        return $this->success(['data' => $data]);
    }

    public function update(Request $request, $id)
    {
        $sale = Sale::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'banner_image' => 'nullable|string|max:500',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'is_active' => 'boolean',
            'products' => 'nullable|array',
            'products.*.product_id' => 'required|integer|exists:products,id',
            'products.*.sale_price' => 'nullable|numeric|min:0',
        ]);

        return DB::transaction(function () use ($sale, $validated) {
            $sale->update(collect($validated)->except('products')->toArray());

            if (array_key_exists('products', $validated)) {
                $sale->saleProducts()->delete();
                foreach ($validated['products'] ?? [] as $i => $product) {
                    SaleProduct::create([
                        'sale_id' => $sale->id,
                        'product_id' => $product['product_id'],
                        'sale_price' => !empty($product['sale_price']) ? $product['sale_price'] : null,
                        'sort_order' => $i,
                    ]);
                }
            }

            return $this->success(['data' => $sale->fresh()->load('saleProducts')], 'Sale updated successfully');
        });
    }

    public function destroy($id)
    {
        $sale = Sale::findOrFail($id);
        $sale->delete();

        return $this->success(null, 'Sale deleted successfully');
    }

    public function toggle($id)
    {
        $sale = Sale::findOrFail($id);
        $sale->update(['is_active' => !$sale->is_active]);

        return $this->success(['data' => $sale->fresh()], 'Sale status updated');
    }
}
