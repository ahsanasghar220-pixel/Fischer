<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        try {
            $page = $request->get('page', 1);
            $search = $request->get('search');
            $status = $request->get('status');
            $paymentStatus = $request->get('payment_status');
            $from = $request->get('from');
            $to = $request->get('to');
            $perPage = 15;

            // Build raw query for maximum performance
            $query = DB::table('orders')
                ->leftJoin('users', 'orders.user_id', '=', 'users.id')
                ->select([
                    'orders.id',
                    'orders.order_number',
                    'orders.status',
                    'orders.payment_status',
                    'orders.payment_method',
                    'orders.total',
                    'orders.created_at',
                    'orders.shipping_first_name',
                    'orders.shipping_last_name',
                    'orders.shipping_email',
                    'users.first_name as user_first_name',
                    'users.last_name as user_last_name',
                    'users.email as user_email',
                ])
                ->whereNull('orders.deleted_at');

            // Search
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('orders.order_number', 'like', "%{$search}%")
                      ->orWhere('users.email', 'like', "%{$search}%")
                      ->orWhere('users.first_name', 'like', "%{$search}%")
                      ->orWhere('users.last_name', 'like', "%{$search}%");
                });
            }

            // Filters
            if ($status) {
                $query->where('orders.status', $status);
            }
            if ($paymentStatus) {
                $query->where('orders.payment_status', $paymentStatus);
            }
            if ($from) {
                $query->whereDate('orders.created_at', '>=', $from);
            }
            if ($to) {
                $query->whereDate('orders.created_at', '<=', $to);
            }

            // Get total count for pagination
            $total = $query->count();

            // Get paginated results
            $orders = $query->orderByDesc('orders.created_at')
                ->offset(($page - 1) * $perPage)
                ->limit($perPage)
                ->get();

            // Get items count in a separate query to avoid subquery issues
            $orderIds = $orders->pluck('id')->toArray();
            $itemsCounts = [];
            if (!empty($orderIds)) {
                $itemsCounts = DB::table('order_items')
                    ->select('order_id', DB::raw('COUNT(*) as count'))
                    ->whereIn('order_id', $orderIds)
                    ->groupBy('order_id')
                    ->pluck('count', 'order_id')
                    ->toArray();
            }

            // Transform
            $transformedOrders = $orders->map(function ($order) use ($itemsCounts) {
                if ($order->user_first_name) {
                    $customerName = trim($order->user_first_name . ' ' . $order->user_last_name);
                } else {
                    $shippingName = trim(($order->shipping_first_name ?? '') . ' ' . ($order->shipping_last_name ?? ''));
                    $customerName = $shippingName ?: 'Guest';
                }

                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer_name' => $customerName,
                    'customer_email' => $order->user_email ?? $order->shipping_email ?? '',
                    'status' => $order->status,
                    'payment_status' => $order->payment_status ?? 'pending',
                    'payment_method' => $order->payment_method ?? 'cod',
                    'total' => (float) $order->total,
                    'items_count' => (int) ($itemsCounts[$order->id] ?? 0),
                    'created_at' => $order->created_at,
                ];
            });

            return $this->success([
                'data' => $transformedOrders,
                'meta' => [
                    'current_page' => (int) $page,
                    'last_page' => (int) ceil($total / $perPage),
                    'total' => $total,
                ],
            ]);
        } catch (\Exception $e) {
            return $this->error('Failed to load orders: ' . $e->getMessage(), 500);
        }
    }

    public function show($id)
    {
        $order = Order::with([
            'user:id,first_name,last_name,email,phone',
            'items.product:id,name,slug,sku',
        ])->findOrFail($id);

        return $this->success([
            'data' => $order,
        ]);
    }

    public function update(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'status' => 'sometimes|string|in:pending,confirmed,processing,shipped,delivered,cancelled',
            'payment_status' => 'sometimes|string|in:pending,paid,failed,refunded',
            'notes' => 'nullable|string',
        ]);

        $order->update($validated);

        // Clear dashboard cache when order status changes
        Cache::forget('admin_dashboard');

        return $this->success([
            'data' => $order->fresh(),
        ], 'Order updated successfully');
    }

    public function updateStatus(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|string|in:pending,confirmed,processing,shipped,delivered,cancelled',
        ]);

        $order->update(['status' => $validated['status']]);

        // Clear dashboard cache
        Cache::forget('admin_dashboard');

        return $this->success([
            'data' => $order->fresh(),
        ], 'Order status updated');
    }

    public function updateTracking(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'tracking_number' => 'required|string|max:100',
            'tracking_url' => 'nullable|url|max:500',
            'courier' => 'nullable|string|max:100',
        ]);

        $order->update($validated);

        return $this->success([
            'data' => $order->fresh(),
        ], 'Tracking information updated');
    }
}
