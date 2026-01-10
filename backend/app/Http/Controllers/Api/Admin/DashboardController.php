<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        try {
            // Cache dashboard data for 5 minutes to reduce DB load
            $data = Cache::remember('admin_dashboard', 300, function () {
                return $this->getDashboardData();
            });

            return $this->success($data);
        } catch (\Exception $e) {
            return $this->error('Failed to load dashboard: ' . $e->getMessage(), 500);
        }
    }

    private function getDashboardData()
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();
        $lastMonthEnd = Carbon::now()->subMonth()->endOfMonth();

        // Single query for all order stats using conditional aggregation
        $orderStats = DB::table('orders')
            ->selectRaw("
                COALESCE(SUM(CASE WHEN created_at >= ? THEN total ELSE 0 END), 0) as revenue_this_month,
                COALESCE(SUM(CASE WHEN created_at >= ? AND created_at <= ? THEN total ELSE 0 END), 0) as revenue_last_month,
                COALESCE(SUM(CASE WHEN DATE(created_at) = ? THEN total ELSE 0 END), 0) as revenue_today,
                COUNT(CASE WHEN created_at >= ? THEN 1 END) as orders_this_month,
                COUNT(CASE WHEN created_at >= ? AND created_at <= ? THEN 1 END) as orders_last_month,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as orders_pending,
                COUNT(CASE WHEN status IN ('confirmed', 'processing', 'shipped') THEN 1 END) as orders_processing,
                COUNT(CASE WHEN status = 'delivered' THEN 1 END) as orders_delivered
            ", [$thisMonth, $lastMonth, $lastMonthEnd, $today, $thisMonth, $lastMonth, $lastMonthEnd])
            ->whereNull('deleted_at')
            ->first();

        // Single query for customer stats
        $customerStats = DB::table('users')
            ->selectRaw("
                COUNT(*) as total,
                COUNT(CASE WHEN created_at >= ? THEN 1 END) as new_this_month,
                COUNT(CASE WHEN created_at >= ? AND created_at <= ? THEN 1 END) as new_last_month
            ", [$thisMonth, $lastMonth, $lastMonthEnd])
            ->whereNull('deleted_at')
            ->first();

        // Single query for product stats
        $productStats = DB::table('products')
            ->selectRaw("
                COUNT(*) as total,
                COUNT(CASE WHEN stock <= 10 AND stock > 0 THEN 1 END) as low_stock,
                COUNT(CASE WHEN stock <= 0 THEN 1 END) as out_of_stock
            ")
            ->whereNull('deleted_at')
            ->first();

        // Calculate growth percentages
        $revenueGrowth = $orderStats->revenue_last_month > 0
            ? round((($orderStats->revenue_this_month - $orderStats->revenue_last_month) / $orderStats->revenue_last_month) * 100, 1)
            : 0;
        $ordersGrowth = $orderStats->orders_last_month > 0
            ? round((($orderStats->orders_this_month - $orderStats->orders_last_month) / $orderStats->orders_last_month) * 100, 1)
            : 0;
        $customersGrowth = $customerStats->new_last_month > 0
            ? round((($customerStats->new_this_month - $customerStats->new_last_month) / $customerStats->new_last_month) * 100, 1)
            : 0;

        // Recent orders - simple query with limit
        $recentOrders = $this->getRecentOrders();

        // Top products - simple query with limit
        $topProducts = $this->getTopProducts();

        return [
            'revenue' => [
                'today' => (float) $orderStats->revenue_today,
                'this_month' => (float) $orderStats->revenue_this_month,
                'last_month' => (float) $orderStats->revenue_last_month,
                'growth' => $revenueGrowth,
            ],
            'orders' => [
                'total' => (int) $orderStats->orders_this_month,
                'pending' => (int) $orderStats->orders_pending,
                'processing' => (int) $orderStats->orders_processing,
                'delivered' => (int) $orderStats->orders_delivered,
                'growth' => $ordersGrowth,
            ],
            'customers' => [
                'total' => (int) $customerStats->total,
                'new_this_month' => (int) $customerStats->new_this_month,
                'growth' => $customersGrowth,
            ],
            'products' => [
                'total' => (int) $productStats->total,
                'low_stock' => (int) $productStats->low_stock,
                'out_of_stock' => (int) $productStats->out_of_stock,
            ],
            'recent_orders' => $recentOrders,
            'top_products' => $topProducts,
        ];
    }

    private function getRecentOrders()
    {
        try {
            return DB::table('orders')
                ->leftJoin('users', 'orders.user_id', '=', 'users.id')
                ->select([
                    'orders.id',
                    'orders.order_number',
                    'orders.total',
                    'orders.status',
                    'orders.created_at',
                    'users.first_name',
                    'users.last_name',
                ])
                ->whereNull('orders.deleted_at')
                ->orderByDesc('orders.created_at')
                ->limit(10)
                ->get()
                ->map(function ($order) {
                    return [
                        'id' => $order->id,
                        'order_number' => $order->order_number,
                        'customer_name' => trim(($order->first_name ?? '') . ' ' . ($order->last_name ?? '')) ?: 'Guest',
                        'total' => (float) $order->total,
                        'status' => $order->status,
                        'created_at' => $order->created_at,
                    ];
                });
        } catch (\Exception $e) {
            return [];
        }
    }

    private function getTopProducts()
    {
        try {
            return DB::table('products')
                ->leftJoin('product_images', function ($join) {
                    $join->on('products.id', '=', 'product_images.product_id')
                        ->where('product_images.is_primary', '=', true);
                })
                ->select([
                    'products.id',
                    'products.name',
                    'products.price',
                    'products.sales_count',
                    'product_images.image',
                ])
                ->where('products.is_active', true)
                ->whereNull('products.deleted_at')
                ->orderByDesc('products.sales_count')
                ->limit(5)
                ->get()
                ->map(function ($product) {
                    $imageUrl = null;
                    if ($product->image) {
                        $imageUrl = str_starts_with($product->image, 'http')
                            ? $product->image
                            : (str_starts_with($product->image, '/') ? $product->image : '/' . $product->image);
                    }

                    return [
                        'id' => $product->id,
                        'name' => $product->name,
                        'primary_image' => $imageUrl,
                        'total_sold' => (int) ($product->sales_count ?? 0),
                        'revenue' => (float) (($product->sales_count ?? 0) * $product->price),
                    ];
                });
        } catch (\Exception $e) {
            return [];
        }
    }

    public function analytics(Request $request)
    {
        try {
            $period = $request->get('period', '30days');
            $startDate = match ($period) {
                '7days' => Carbon::now()->subDays(7),
                '30days' => Carbon::now()->subDays(30),
                '90days' => Carbon::now()->subDays(90),
                '12months' => Carbon::now()->subMonths(12),
                default => Carbon::now()->subDays(30),
            };

            // Cache analytics for 10 minutes
            $cacheKey = "admin_analytics_{$period}";
            $data = Cache::remember($cacheKey, 600, function () use ($startDate) {
                $ordersCompleted = DB::table('orders')
                    ->where('created_at', '>=', $startDate)
                    ->whereNull('deleted_at')
                    ->count();

                return [
                    'orders_completed' => $ordersCompleted,
                ];
            });

            return $this->success([
                'period' => $period,
                'sales_chart' => [],
                'orders_by_status' => [],
                'revenue_by_payment' => [],
                'top_categories' => [],
                'sales_by_city' => [],
                'average_order_value' => 0,
                'conversion_metrics' => [
                    'total_visitors' => 0,
                    'cart_additions' => 0,
                    'checkouts_started' => 0,
                    'orders_completed' => $data['orders_completed'],
                ],
            ]);
        } catch (\Exception $e) {
            return $this->error('Failed to load analytics', 500);
        }
    }
}
