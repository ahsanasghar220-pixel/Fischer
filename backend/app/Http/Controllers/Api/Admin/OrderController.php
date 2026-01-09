<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with(['user:id,first_name,last_name,email', 'items.product:id,name,slug']);

        // Search
        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($userQuery) use ($search) {
                      $userQuery->where('email', 'like', "%{$search}%")
                               ->orWhere('first_name', 'like', "%{$search}%")
                               ->orWhere('last_name', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by status
        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        // Filter by payment status
        if ($paymentStatus = $request->get('payment_status')) {
            $query->where('payment_status', $paymentStatus);
        }

        // Filter by date range
        if ($from = $request->get('from')) {
            $query->whereDate('created_at', '>=', $from);
        }
        if ($to = $request->get('to')) {
            $query->whereDate('created_at', '<=', $to);
        }

        $orders = $query->orderByDesc('created_at')->paginate(15);

        return $this->success([
            'data' => $orders->items(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'total' => $orders->total(),
            ],
        ]);
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
