<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function sales(Request $request)
    {
        $startDate = $request->get('start') ? Carbon::parse($request->get('start')) : Carbon::now()->subDays(30);
        $endDate = $request->get('end') ? Carbon::parse($request->get('end')) : Carbon::now();

        try {
            // Get orders in date range
            $orders = Order::whereBetween('created_at', [$startDate, $endDate])->get();

            // Calculate totals
            $totalRevenue = $orders->sum('total');
            $totalOrders = $orders->count();
            $avgOrderValue = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;

            // Group by week for chart data
            $salesByWeek = $orders->groupBy(function ($order) {
                return $order->created_at->startOfWeek()->format('M d');
            })->map(function ($weekOrders, $week) {
                return [
                    'date' => $week,
                    'revenue' => $weekOrders->sum('total'),
                    'orders' => $weekOrders->count(),
                    'profit' => $weekOrders->sum('total') * 0.2, // Estimated profit margin
                ];
            })->values();

            return $this->success([
                'summary' => [
                    'total_revenue' => $totalRevenue,
                    'total_orders' => $totalOrders,
                    'avg_order_value' => round($avgOrderValue, 2),
                    'total_profit' => $totalRevenue * 0.2,
                ],
                'chart_data' => $salesByWeek,
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
            // Get top selling products
            $products = Product::with('orderItems')
                ->withCount(['orderItems as units_sold' => function ($q) use ($startDate, $endDate) {
                    $q->whereHas('order', function ($oq) use ($startDate, $endDate) {
                        $oq->whereBetween('created_at', [$startDate, $endDate]);
                    });
                }])
                ->orderByDesc('units_sold')
                ->limit(10)
                ->get();

            $productData = $products->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'sku' => $product->sku,
                    'sold' => $product->units_sold ?? 0,
                    'revenue' => ($product->units_sold ?? 0) * $product->price,
                    'stock' => $product->stock_quantity ?? 0,
                ];
            });

            return $this->success([
                'products' => $productData,
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
            // Customer segments
            $newCustomers = User::role('customer')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count();

            $totalCustomers = User::role('customer')->count();

            $returningCustomers = User::role('customer')
                ->whereHas('orders', function ($q) {
                    $q->groupBy('user_id')->havingRaw('COUNT(*) > 1');
                })
                ->count();

            // VIP customers (spent more than 50000)
            $vipCustomers = User::role('customer')
                ->withSum('orders', 'total')
                ->having('orders_sum_total', '>', 50000)
                ->count();

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
            $inStock = Product::where('stock_quantity', '>', 10)->count();
            $lowStock = Product::where('stock_quantity', '>', 0)->where('stock_quantity', '<=', 10)->count();
            $outOfStock = Product::where('stock_quantity', '<=', 0)->count();
            $discontinued = Product::where('is_active', false)->count();
            $total = Product::count();

            $status = [
                ['status' => 'In Stock', 'count' => $inStock, 'percentage' => $total > 0 ? round(($inStock / $total) * 100) : 0],
                ['status' => 'Low Stock', 'count' => $lowStock, 'percentage' => $total > 0 ? round(($lowStock / $total) * 100) : 0],
                ['status' => 'Out of Stock', 'count' => $outOfStock, 'percentage' => $total > 0 ? round(($outOfStock / $total) * 100) : 0],
                ['status' => 'Discontinued', 'count' => $discontinued, 'percentage' => $total > 0 ? round(($discontinued / $total) * 100) : 0],
            ];

            // Low stock products
            $lowStockProducts = Product::where('stock_quantity', '>', 0)
                ->where('stock_quantity', '<=', 10)
                ->limit(10)
                ->get()
                ->map(function ($product) {
                    return [
                        'id' => $product->id,
                        'name' => $product->name,
                        'sku' => $product->sku,
                        'stock' => $product->stock_quantity,
                    ];
                });

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
