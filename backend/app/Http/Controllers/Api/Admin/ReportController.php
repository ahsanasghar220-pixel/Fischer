<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function sales(Request $request)
    {
        $startDate = $request->get('start') ? Carbon::parse($request->get('start')) : Carbon::now()->subDays(30);
        $endDate = $request->get('end') ? Carbon::parse($request->get('end')) : Carbon::now();

        try {
            // Single aggregated query - no loading all orders!
            $summary = DB::table('orders')
                ->selectRaw('
                    COALESCE(SUM(total), 0) as total_revenue,
                    COUNT(*) as total_orders,
                    COALESCE(AVG(total), 0) as avg_order_value
                ')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->whereNull('deleted_at')
                ->first();

            // Weekly aggregation at database level
            $weeklyData = DB::table('orders')
                ->selectRaw('
                    DATE(DATE_SUB(created_at, INTERVAL WEEKDAY(created_at) DAY)) as week_start,
                    SUM(total) as revenue,
                    COUNT(*) as orders
                ')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->whereNull('deleted_at')
                ->groupBy('week_start')
                ->orderBy('week_start')
                ->get()
                ->map(function ($row) {
                    return [
                        'date' => Carbon::parse($row->week_start)->format('M d'),
                        'revenue' => (float) $row->revenue,
                        'orders' => (int) $row->orders,
                        'profit' => (float) $row->revenue * 0.2,
                    ];
                });

            return $this->success([
                'summary' => [
                    'total_revenue' => (float) $summary->total_revenue,
                    'total_orders' => (int) $summary->total_orders,
                    'avg_order_value' => round((float) $summary->avg_order_value, 2),
                    'total_profit' => (float) $summary->total_revenue * 0.2,
                ],
                'chart_data' => $weeklyData,
            ]);
        } catch (\Exception $e) {
            return $this->success([
                'summary' => [
                    'total_revenue' => 0,
                    'total_orders' => 0,
                    'avg_order_value' => 0,
                    'total_profit' => 0,
                ],
                'chart_data' => [],
            ]);
        }
    }

    public function products(Request $request)
    {
        $startDate = $request->get('start') ? Carbon::parse($request->get('start')) : Carbon::now()->subDays(30);
        $endDate = $request->get('end') ? Carbon::parse($request->get('end')) : Carbon::now();

        try {
            // Fast raw query with join
            $products = DB::table('products')
                ->leftJoin('order_items', 'products.id', '=', 'order_items.product_id')
                ->leftJoin('orders', function ($join) use ($startDate, $endDate) {
                    $join->on('order_items.order_id', '=', 'orders.id')
                        ->whereBetween('orders.created_at', [$startDate, $endDate])
                        ->whereNull('orders.deleted_at');
                })
                ->select([
                    'products.id',
                    'products.name',
                    'products.sku',
                    'products.price',
                    'products.stock_quantity',
                    DB::raw('COALESCE(SUM(order_items.quantity), 0) as units_sold'),
                ])
                ->whereNull('products.deleted_at')
                ->groupBy('products.id', 'products.name', 'products.sku', 'products.price', 'products.stock_quantity')
                ->orderByDesc('units_sold')
                ->limit(10)
                ->get()
                ->map(function ($product) {
                    return [
                        'id' => $product->id,
                        'name' => $product->name,
                        'sku' => $product->sku,
                        'sold' => (int) $product->units_sold,
                        'revenue' => (float) ($product->units_sold * $product->price),
                        'stock' => (int) ($product->stock_quantity ?? 0),
                    ];
                });

            return $this->success([
                'products' => $products,
            ]);
        } catch (\Exception $e) {
            return $this->success([
                'products' => [],
            ]);
        }
    }

    public function customers(Request $request)
    {
        $startDate = $request->get('start') ? Carbon::parse($request->get('start')) : Carbon::now()->subDays(30);
        $endDate = $request->get('end') ? Carbon::parse($request->get('end')) : Carbon::now();

        try {
            // Single query to get all customer stats
            $stats = DB::selectOne("
                SELECT
                    (SELECT COUNT(DISTINCT user_id) FROM orders WHERE user_id IS NOT NULL AND deleted_at IS NULL) as total_customers,
                    (SELECT COUNT(DISTINCT u.id) FROM users u
                     INNER JOIN orders o ON u.id = o.user_id
                     WHERE u.created_at >= ? AND u.created_at <= ? AND o.deleted_at IS NULL) as new_customers,
                    (SELECT COUNT(*) FROM (
                        SELECT user_id FROM orders WHERE user_id IS NOT NULL AND deleted_at IS NULL
                        GROUP BY user_id HAVING COUNT(*) > 1
                    ) as returning) as returning_customers,
                    (SELECT COUNT(*) FROM (
                        SELECT user_id FROM orders WHERE user_id IS NOT NULL AND deleted_at IS NULL
                        GROUP BY user_id HAVING SUM(total) > 50000
                    ) as vip) as vip_customers
            ", [$startDate, $endDate]);

            $totalCustomers = (int) $stats->total_customers;
            $newCustomers = (int) $stats->new_customers;
            $returningCustomers = (int) $stats->returning_customers;
            $vipCustomers = (int) $stats->vip_customers;

            $segments = [
                ['segment' => 'New', 'count' => $newCustomers, 'value' => $newCustomers * 15000],
                ['segment' => 'Returning', 'count' => $returningCustomers, 'value' => $returningCustomers * 25000],
                ['segment' => 'VIP', 'count' => $vipCustomers, 'value' => $vipCustomers * 75000],
                ['segment' => 'Inactive', 'count' => max(0, $totalCustomers - $newCustomers - $returningCustomers - $vipCustomers), 'value' => 0],
            ];

            return $this->success([
                'segments' => $segments,
                'total' => $totalCustomers,
            ]);
        } catch (\Exception $e) {
            return $this->success([
                'segments' => [],
                'total' => 0,
            ]);
        }
    }

    public function inventory(Request $request)
    {
        try {
            // Single query for all inventory stats
            $stats = DB::table('products')
                ->selectRaw("
                    COUNT(*) as total,
                    SUM(CASE WHEN stock_quantity > 10 THEN 1 ELSE 0 END) as in_stock,
                    SUM(CASE WHEN stock_quantity > 0 AND stock_quantity <= 10 THEN 1 ELSE 0 END) as low_stock,
                    SUM(CASE WHEN stock_quantity <= 0 THEN 1 ELSE 0 END) as out_of_stock,
                    SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as discontinued
                ")
                ->whereNull('deleted_at')
                ->first();

            $total = (int) $stats->total;
            $inStock = (int) $stats->in_stock;
            $lowStock = (int) $stats->low_stock;
            $outOfStock = (int) $stats->out_of_stock;
            $discontinued = (int) $stats->discontinued;

            $status = [
                ['status' => 'In Stock', 'count' => $inStock, 'percentage' => $total > 0 ? round(($inStock / $total) * 100) : 0],
                ['status' => 'Low Stock', 'count' => $lowStock, 'percentage' => $total > 0 ? round(($lowStock / $total) * 100) : 0],
                ['status' => 'Out of Stock', 'count' => $outOfStock, 'percentage' => $total > 0 ? round(($outOfStock / $total) * 100) : 0],
                ['status' => 'Discontinued', 'count' => $discontinued, 'percentage' => $total > 0 ? round(($discontinued / $total) * 100) : 0],
            ];

            // Low stock products - simple query
            $lowStockProducts = DB::table('products')
                ->select(['id', 'name', 'sku', 'stock_quantity as stock'])
                ->where('stock_quantity', '>', 0)
                ->where('stock_quantity', '<=', 10)
                ->whereNull('deleted_at')
                ->limit(10)
                ->get();

            return $this->success([
                'status' => $status,
                'low_stock_products' => $lowStockProducts,
                'total' => $total,
            ]);
        } catch (\Exception $e) {
            return $this->success([
                'status' => [],
                'low_stock_products' => [],
                'total' => 0,
            ]);
        }
    }
}
