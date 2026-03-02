<?php

namespace App\Http\Controllers\Api\Production;

use App\Http\Controllers\Controller;
use App\Models\B2bOrder;
use App\Models\B2bOrderItem;
use App\Models\ProductionInventory;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ProductionDashboardController extends Controller
{
    /**
     * GET /api/production/dashboard
     */
    public function index(): JsonResponse
    {
        // KPIs
        $pendingOrders = B2bOrder::where('status', 'pending')->count();

        $unitsToManufacture = B2bOrderItem::join('b2b_orders', 'b2b_order_items.b2b_order_id', '=', 'b2b_orders.id')
            ->whereNotIn('b2b_orders.status', ['delivered', 'cancelled'])
            ->sum('b2b_order_items.quantity');

        // SKUs with a gap (demand > available + in_production)
        $skuShortageCount = DB::table('b2b_order_items')
            ->join('b2b_orders', 'b2b_order_items.b2b_order_id', '=', 'b2b_orders.id')
            ->leftJoin('production_inventory', 'b2b_order_items.sku', '=', 'production_inventory.sku')
            ->whereNotIn('b2b_orders.status', ['delivered', 'cancelled'])
            ->select(
                'b2b_order_items.sku',
                DB::raw('SUM(b2b_order_items.quantity) as total_ordered'),
                DB::raw('COALESCE(MAX(production_inventory.quantity_available), 0) as quantity_available'),
                DB::raw('COALESCE(MAX(production_inventory.quantity_in_production), 0) as quantity_in_production')
            )
            ->groupBy('b2b_order_items.sku')
            ->havingRaw(
                'SUM(b2b_order_items.quantity) > (COALESCE(MAX(production_inventory.quantity_available), 0) + COALESCE(MAX(production_inventory.quantity_in_production), 0))'
            )
            ->get()
            ->count();

        $deliveredToday = B2bOrder::where('status', 'delivered')
            ->whereDate('updated_at', today())
            ->count();

        // SKU aggregation (active orders only)
        $skuAggregation = DB::table('b2b_order_items')
            ->join('b2b_orders', 'b2b_order_items.b2b_order_id', '=', 'b2b_orders.id')
            ->leftJoin('production_inventory', 'b2b_order_items.sku', '=', 'production_inventory.sku')
            ->whereNotIn('b2b_orders.status', ['delivered', 'cancelled'])
            ->select(
                'b2b_order_items.sku',
                DB::raw('MAX(b2b_order_items.product_name) as product_name'),
                DB::raw('SUM(b2b_order_items.quantity) as total_ordered'),
                DB::raw('COALESCE(MAX(production_inventory.quantity_available), 0) as quantity_available'),
                DB::raw('COALESCE(MAX(production_inventory.quantity_in_production), 0) as quantity_in_production'),
                DB::raw(
                    'GREATEST(0, SUM(b2b_order_items.quantity) - COALESCE(MAX(production_inventory.quantity_available), 0) - COALESCE(MAX(production_inventory.quantity_in_production), 0)) as gap'
                )
            )
            ->groupBy('b2b_order_items.sku')
            ->orderByDesc('gap')
            ->get();

        // Recent orders (last 10, excluding delivered/cancelled)
        $recentOrders = B2bOrder::with(['items', 'salesperson'])
            ->whereNotIn('status', ['delivered', 'cancelled'])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(function ($order) {
                $order->salesperson_name = $order->salesperson
                    ? $order->salesperson->full_name
                    : null;
                return $order;
            });

        return response()->json([
            'data' => [
                'kpis' => [
                    'pending_orders'      => $pendingOrders,
                    'units_to_manufacture' => (int) $unitsToManufacture,
                    'skus_with_shortage'  => $skuShortageCount,
                    'delivered_today'     => $deliveredToday,
                ],
                'sku_aggregation' => $skuAggregation,
                'recent_orders'   => $recentOrders,
            ],
        ]);
    }
}
