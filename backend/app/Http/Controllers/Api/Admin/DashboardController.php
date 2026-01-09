<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        try {
            $today = Carbon::today();
            $thisMonth = Carbon::now()->startOfMonth();
            $lastMonth = Carbon::now()->subMonth()->startOfMonth();
            $lastMonthEnd = Carbon::now()->subMonth()->endOfMonth();

            // Revenue stats
            $revenueThisMonth = $this->safeSum(Order::class, 'total', fn($q) => $q->where('created_at', '>=', $thisMonth));
            $revenueLastMonth = $this->safeSum(Order::class, 'total', fn($q) => $q->whereBetween('created_at', [$lastMonth, $lastMonthEnd]));
            $revenueGrowth = $revenueLastMonth > 0 ? round((($revenueThisMonth - $revenueLastMonth) / $revenueLastMonth) * 100, 1) : 0;

            // Order stats
            $ordersThisMonth = $this->safeCount(Order::class, fn($q) => $q->where('created_at', '>=', $thisMonth));
            $ordersLastMonth = $this->safeCount(Order::class, fn($q) => $q->whereBetween('created_at', [$lastMonth, $lastMonthEnd]));
            $ordersGrowth = $ordersLastMonth > 0 ? round((($ordersThisMonth - $ordersLastMonth) / $ordersLastMonth) * 100, 1) : 0;

            // Customer stats
            $customersTotal = $this->safeCount(User::class);
            $customersThisMonth = $this->safeCount(User::class, fn($q) => $q->where('created_at', '>=', $thisMonth));
            $customersLastMonth = $this->safeCount(User::class, fn($q) => $q->whereBetween('created_at', [$lastMonth, $lastMonthEnd]));
            $customersGrowth = $customersLastMonth > 0 ? round((($customersThisMonth - $customersLastMonth) / $customersLastMonth) * 100, 1) : 0;

            // Product stats
            $productsTotal = $this->safeCount(Product::class);
            $lowStock = $this->safeCount(Product::class, fn($q) => $q->where('stock', '<=', 10)->where('stock', '>', 0));
            $outOfStock = $this->safeCount(Product::class, fn($q) => $q->where('stock', '<=', 0));

            // Recent orders
            $recentOrders = $this->getRecentOrders();

            // Top products
            $topProducts = $this->getTopProducts();

            return $this->success([
                'revenue' => [
                    'today' => $this->safeSum(Order::class, 'total', fn($q) => $q->whereDate('created_at', $today)),
                    'this_month' => $revenueThisMonth,
                    'last_month' => $revenueLastMonth,
                    'growth' => $revenueGrowth,
                ],
                'orders' => [
                    'total' => $ordersThisMonth,
                    'pending' => $this->safeCount(Order::class, fn($q) => $q->where('status', 'pending')),
                    'processing' => $this->safeCount(Order::class, fn($q) => $q->whereIn('status', ['confirmed', 'processing', 'shipped'])),
                    'delivered' => $this->safeCount(Order::class, fn($q) => $q->where('status', 'delivered')),
                    'growth' => $ordersGrowth,
                ],
                'customers' => [
                    'total' => $customersTotal,
                    'new_this_month' => $customersThisMonth,
                    'growth' => $customersGrowth,
                ],
                'products' => [
                    'total' => $productsTotal,
                    'low_stock' => $lowStock,
                    'out_of_stock' => $outOfStock,
                ],
                'recent_orders' => $recentOrders,
                'top_products' => $topProducts,
            ]);
        } catch (\Exception $e) {
            return $this->error('Failed to load dashboard: ' . $e->getMessage(), 500);
        }
    }

    private function safeCount($model, $callback = null)
    {
        try {
            $query = $model::query();
            if ($callback) {
                $callback($query);
            }
            return $query->count();
        } catch (\Exception $e) {
            return 0;
        }
    }

    private function safeSum($model, $column, $callback = null)
    {
        try {
            $query = $model::query();
            if ($callback) {
                $callback($query);
            }
            return $query->sum($column) ?? 0;
        } catch (\Exception $e) {
            return 0;
        }
    }

    private function getRecentOrders()
    {
        try {
            $orders = Order::with(['user:id,first_name,last_name,email'])
                ->orderByDesc('created_at')
                ->limit(10)
                ->get();

            return $orders->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer_name' => $order->user ? ($order->user->first_name . ' ' . $order->user->last_name) : 'Guest',
                    'total' => $order->total,
                    'status' => $order->status,
                    'created_at' => $order->created_at->toISOString(),
                ];
            });
        } catch (\Exception $e) {
            return [];
        }
    }

    private function getTopProducts()
    {
        try {
            $products = Product::with('images')
                ->where('is_active', true)
                ->orderByDesc('id')
                ->limit(5)
                ->get();

            return $products->map(function ($product) {
                $primaryImage = $product->images->where('is_primary', true)->first()
                    ?? $product->images->first();

                // Get image URL - field is 'image' not 'image_path'
                $imageUrl = null;
                if ($primaryImage && $primaryImage->image) {
                    $image = $primaryImage->image;
                    // If already a full URL, use as-is
                    if (str_starts_with($image, 'http')) {
                        $imageUrl = $image;
                    } else {
                        // Relative path - use as-is if starts with /, otherwise prepend /
                        $imageUrl = str_starts_with($image, '/') ? $image : '/' . $image;
                    }
                }

                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'primary_image' => $imageUrl,
                    'total_sold' => $product->sales_count ?? 0,
                    'revenue' => ($product->sales_count ?? 0) * $product->price,
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
                    'orders_completed' => Order::where('created_at', '>=', $startDate)->count(),
                ],
            ]);
        } catch (\Exception $e) {
            return $this->error('Failed to load analytics', 500);
        }
    }
}
