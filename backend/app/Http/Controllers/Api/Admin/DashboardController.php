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

            // Basic stats - wrap in try-catch for each section
            $stats = [
                'orders' => $this->getOrderStats($today, $thisMonth),
                'revenue' => $this->getRevenueStats($today, $thisMonth, $lastMonth),
                'customers' => $this->getCustomerStats($thisMonth),
                'products' => $this->getProductStats(),
            ];

            // Recent orders
            $recentOrders = [];
            try {
                $recentOrders = Order::with(['user:id,first_name,last_name,email'])
                    ->orderByDesc('created_at')
                    ->limit(10)
                    ->get();
            } catch (\Exception $e) {
                // Orders table might not exist
            }

            // Top selling products
            $topProducts = [];
            try {
                $topProducts = Product::with('images')
                    ->where('is_active', true)
                    ->orderByDesc('id')
                    ->limit(5)
                    ->get(['id', 'name', 'slug', 'price']);
            } catch (\Exception $e) {
                // Products table might have issues
            }

            // Low stock products
            $lowStockProducts = [];
            try {
                $lowStockProducts = Product::where('is_active', true)
                    ->where('stock', '<=', 10)
                    ->where('stock', '>', 0)
                    ->orderBy('stock')
                    ->limit(10)
                    ->get(['id', 'name', 'sku', 'stock']);
            } catch (\Exception $e) {
                // Stock column might not exist
            }

            return $this->success([
                'stats' => $stats,
                'recent_orders' => $recentOrders,
                'top_products' => $topProducts,
                'low_stock_products' => $lowStockProducts,
            ]);
        } catch (\Exception $e) {
            return $this->error('Failed to load dashboard: ' . $e->getMessage(), 500);
        }
    }

    private function getOrderStats($today, $thisMonth)
    {
        try {
            return [
                'today' => Order::whereDate('created_at', $today)->count(),
                'this_month' => Order::where('created_at', '>=', $thisMonth)->count(),
                'pending' => Order::where('status', 'pending')->count(),
                'processing' => Order::whereIn('status', ['confirmed', 'processing', 'shipped'])->count(),
            ];
        } catch (\Exception $e) {
            return ['today' => 0, 'this_month' => 0, 'pending' => 0, 'processing' => 0];
        }
    }

    private function getRevenueStats($today, $thisMonth, $lastMonth)
    {
        try {
            return [
                'today' => Order::whereDate('created_at', $today)->sum('total') ?? 0,
                'this_month' => Order::where('created_at', '>=', $thisMonth)->sum('total') ?? 0,
                'last_month' => Order::whereBetween('created_at', [$lastMonth, $thisMonth])->sum('total') ?? 0,
            ];
        } catch (\Exception $e) {
            return ['today' => 0, 'this_month' => 0, 'last_month' => 0];
        }
    }

    private function getCustomerStats($thisMonth)
    {
        try {
            return [
                'total' => User::count(),
                'new_this_month' => User::where('created_at', '>=', $thisMonth)->count(),
            ];
        } catch (\Exception $e) {
            return ['total' => 0, 'new_this_month' => 0];
        }
    }

    private function getProductStats()
    {
        try {
            return [
                'total' => Product::count(),
                'active' => Product::where('is_active', true)->count(),
                'low_stock' => Product::where('stock', '<=', 10)->where('stock', '>', 0)->count(),
                'out_of_stock' => Product::where('stock', 0)->orWhere('stock_status', 'out_of_stock')->count(),
            ];
        } catch (\Exception $e) {
            return ['total' => 0, 'active' => 0, 'low_stock' => 0, 'out_of_stock' => 0];
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
