<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Dealer;
use App\Models\ServiceRequest;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // Overview stats
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();

        $stats = [
            'orders' => [
                'today' => Order::whereDate('created_at', $today)->count(),
                'this_month' => Order::where('created_at', '>=', $thisMonth)->count(),
                'pending' => Order::where('status', 'pending')->count(),
                'processing' => Order::whereIn('status', ['confirmed', 'processing', 'shipped'])->count(),
            ],
            'revenue' => [
                'today' => Order::whereDate('created_at', $today)
                    ->where('payment_status', 'paid')
                    ->sum('total'),
                'this_month' => Order::where('created_at', '>=', $thisMonth)
                    ->where('payment_status', 'paid')
                    ->sum('total'),
                'last_month' => Order::whereBetween('created_at', [$lastMonth, $thisMonth])
                    ->where('payment_status', 'paid')
                    ->sum('total'),
            ],
            'customers' => [
                'total' => User::role('customer')->count(),
                'new_this_month' => User::role('customer')
                    ->where('created_at', '>=', $thisMonth)
                    ->count(),
            ],
            'products' => [
                'total' => Product::count(),
                'active' => Product::where('is_active', true)->count(),
                'low_stock' => Product::where('is_active', true)
                    ->where('track_inventory', true)
                    ->whereColumn('stock_quantity', '<=', 'low_stock_threshold')
                    ->count(),
                'out_of_stock' => Product::where('stock_status', 'out_of_stock')->count(),
            ],
            'dealers' => [
                'total' => Dealer::count(),
                'pending' => Dealer::where('status', 'pending')->count(),
                'approved' => Dealer::where('status', 'approved')->count(),
            ],
            'service_requests' => [
                'pending' => ServiceRequest::where('status', 'pending')->count(),
                'in_progress' => ServiceRequest::whereIn('status', ['assigned', 'in_progress'])->count(),
            ],
            'reviews' => [
                'pending' => Review::where('status', 'pending')->count(),
            ],
        ];

        // Recent orders
        $recentOrders = Order::with(['user:id,first_name,last_name,email', 'items'])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        // Recent customers
        $recentCustomers = User::role('customer')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get(['id', 'first_name', 'last_name', 'email', 'created_at']);

        // Top selling products
        $topProducts = Product::with('images')
            ->orderByDesc('sales_count')
            ->limit(5)
            ->get(['id', 'name', 'slug', 'price', 'sales_count']);

        // Low stock products
        $lowStockProducts = Product::where('is_active', true)
            ->where('track_inventory', true)
            ->whereColumn('stock_quantity', '<=', 'low_stock_threshold')
            ->orderBy('stock_quantity')
            ->limit(10)
            ->get(['id', 'name', 'sku', 'stock_quantity', 'low_stock_threshold']);

        return $this->success([
            'stats' => $stats,
            'recent_orders' => $recentOrders,
            'recent_customers' => $recentCustomers,
            'top_products' => $topProducts,
            'low_stock_products' => $lowStockProducts,
        ]);
    }

    public function analytics(Request $request)
    {
        $period = $request->get('period', '30days');
        $startDate = match ($period) {
            '7days' => Carbon::now()->subDays(7),
            '30days' => Carbon::now()->subDays(30),
            '90days' => Carbon::now()->subDays(90),
            '12months' => Carbon::now()->subMonths(12),
            default => Carbon::now()->subDays(30),
        };

        // Sales chart data
        $salesData = Order::where('created_at', '>=', $startDate)
            ->where('payment_status', 'paid')
            ->selectRaw('DATE(created_at) as date, COUNT(*) as orders, SUM(total) as revenue')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Orders by status
        $ordersByStatus = Order::where('created_at', '>=', $startDate)
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        // Revenue by payment method
        $revenueByPayment = Order::where('created_at', '>=', $startDate)
            ->where('payment_status', 'paid')
            ->selectRaw('payment_method, SUM(total) as revenue')
            ->groupBy('payment_method')
            ->pluck('revenue', 'payment_method');

        // Top categories
        $topCategories = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->where('orders.created_at', '>=', $startDate)
            ->selectRaw('categories.name, SUM(order_items.total_price) as revenue, SUM(order_items.quantity) as quantity')
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('revenue')
            ->limit(5)
            ->get();

        // Sales by city
        $salesByCity = Order::where('created_at', '>=', $startDate)
            ->where('payment_status', 'paid')
            ->selectRaw('shipping_city as city, COUNT(*) as orders, SUM(total) as revenue')
            ->groupBy('shipping_city')
            ->orderByDesc('revenue')
            ->limit(10)
            ->get();

        // Average order value
        $avgOrderValue = Order::where('created_at', '>=', $startDate)
            ->where('payment_status', 'paid')
            ->avg('total');

        // Conversion metrics
        $conversionMetrics = [
            'total_visitors' => 0, // Would come from analytics tracking
            'cart_additions' => 0, // Would track cart events
            'checkouts_started' => 0,
            'orders_completed' => Order::where('created_at', '>=', $startDate)->count(),
        ];

        return $this->success([
            'period' => $period,
            'sales_chart' => $salesData,
            'orders_by_status' => $ordersByStatus,
            'revenue_by_payment' => $revenueByPayment,
            'top_categories' => $topCategories,
            'sales_by_city' => $salesByCity,
            'average_order_value' => round($avgOrderValue ?? 0, 2),
            'conversion_metrics' => $conversionMetrics,
        ]);
    }
}
