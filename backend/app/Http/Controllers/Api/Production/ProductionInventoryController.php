<?php

namespace App\Http\Controllers\Api\Production;

use App\Http\Controllers\Controller;
use App\Models\ProductionInventory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductionInventoryController extends Controller
{
    /**
     * GET /api/production/inventory
     * Returns all inventory records with total_b2b_demand computed field.
     */
    public function index(): JsonResponse
    {
        // Compute active B2B demand per SKU in one query
        $demandBySku = DB::table('b2b_order_items')
            ->join('b2b_orders', 'b2b_order_items.b2b_order_id', '=', 'b2b_orders.id')
            ->whereNotIn('b2b_orders.status', ['delivered', 'cancelled'])
            ->select('b2b_order_items.sku', DB::raw('SUM(b2b_order_items.quantity) as total_demand'))
            ->groupBy('b2b_order_items.sku')
            ->pluck('total_demand', 'sku')
            ->toArray();

        $inventory = ProductionInventory::orderBy('product_name')->get();

        $inventory->transform(function ($item) use ($demandBySku) {
            $item->total_b2b_demand = (int) ($demandBySku[$item->sku] ?? 0);
            $item->gap = max(
                0,
                $item->total_b2b_demand - $item->quantity_available - $item->quantity_in_production
            );
            return $item;
        });

        return response()->json(['data' => $inventory]);
    }

    /**
     * PUT /api/production/inventory/{inventory}
     * Update quantity_available and/or quantity_in_production.
     */
    public function update(Request $request, ProductionInventory $inventory): JsonResponse
    {
        $validated = $request->validate([
            'quantity_available'     => 'sometimes|integer|min:0',
            'quantity_in_production' => 'sometimes|integer|min:0',
            'product_name'           => 'sometimes|string|max:255',
        ]);

        $validated['last_updated_by'] = auth()->id();

        $inventory->update($validated);

        return response()->json([
            'message' => 'Inventory updated.',
            'data'    => $inventory->fresh(),
        ]);
    }

    /**
     * POST /api/production/inventory
     * Create a new inventory entry for a SKU that isn't yet tracked.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'sku'                    => 'required|string|max:100|unique:production_inventory,sku',
            'product_name'           => 'required|string|max:255',
            'product_id'             => 'nullable|integer|exists:products,id',
            'quantity_available'     => 'required|integer|min:0',
            'quantity_in_production' => 'required|integer|min:0',
        ]);

        $validated['last_updated_by'] = auth()->id();

        $inventory = ProductionInventory::create($validated);

        return response()->json([
            'message' => 'Inventory entry created.',
            'data'    => $inventory,
        ], 201);
    }
}
