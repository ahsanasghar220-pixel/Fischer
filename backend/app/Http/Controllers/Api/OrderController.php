<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $orders = Order::where('user_id', $user->id)
            ->with(['items'])
            ->orderByDesc('created_at')
            ->paginate(10);

        return $this->paginated($orders);
    }

    public function show(Request $request, string $orderNumber)
    {
        $user = $request->user();

        $order = Order::where('order_number', $orderNumber)
            ->with(['items.product', 'statusHistory'])
            ->firstOrFail();

        // Check ownership
        if ($order->user_id && $order->user_id !== $user?->id && !$user?->isAdmin()) {
            return $this->error('Order not found', 404);
        }

        return $this->success([
            'order' => $order,
        ]);
    }

    public function track(string $orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)
            ->with(['statusHistory', 'items'])
            ->firstOrFail();

        return $this->success([
            'order_number' => $order->order_number,
            'status' => $order->status,
            'payment_status' => $order->payment_status,
            'tracking_number' => $order->tracking_number,
            'courier_name' => $order->courier_name,
            'shipping_city' => $order->shipping_city,
            'created_at' => $order->created_at,
            'shipped_at' => $order->shipped_at,
            'delivered_at' => $order->delivered_at,
            'history' => $order->statusHistory->map(function ($item) {
                return [
                    'status' => $item->status,
                    'status_label' => $item->status_label,
                    'notes' => $item->notes,
                    'created_at' => $item->created_at,
                ];
            }),
            'items_count' => $order->items_count,
            'total' => $order->total,
        ]);
    }

    public function cancel(Request $request, string $orderNumber)
    {
        $user = $request->user();

        $order = Order::where('order_number', $orderNumber)
            ->where('user_id', $user->id)
            ->firstOrFail();

        if (!$order->canBeCancelled()) {
            return $this->error('This order cannot be cancelled', 400);
        }

        $order->updateStatus('cancelled', 'Cancelled by customer', $user->id);

        // Restore stock
        foreach ($order->items as $item) {
            if ($item->product_variant_id) {
                $item->productVariant?->updateStock($item->quantity, 'increment');
            } else {
                $item->product?->updateStock($item->quantity, 'increment');
            }
        }

        // Restore loyalty points if used
        if ($order->loyalty_points_used > 0 && $order->user) {
            $order->user->addLoyaltyPoints(
                $order->loyalty_points_used,
                "Restored from cancelled order #{$order->order_number}",
                Order::class,
                $order->id
            );
        }

        return $this->success(null, 'Order cancelled successfully');
    }

    public function reorder(Request $request, string $orderNumber)
    {
        $user = $request->user();

        $order = Order::where('order_number', $orderNumber)
            ->where('user_id', $user->id)
            ->with('items.product')
            ->firstOrFail();

        $cart = \App\Models\Cart::getOrCreate($user->id);

        $unavailable = [];

        foreach ($order->items as $item) {
            if (!$item->product || !$item->product->is_active) {
                $unavailable[] = $item->product_name;
                continue;
            }

            $cart->addItem($item->product, $item->quantity, $item->productVariant);
        }

        $message = 'Items added to cart';
        if (!empty($unavailable)) {
            $message .= '. Some items are no longer available: ' . implode(', ', $unavailable);
        }

        return $this->success(null, $message);
    }

    public function downloadInvoice(Request $request, string $orderNumber)
    {
        $user = $request->user();

        $order = Order::where('order_number', $orderNumber)
            ->with(['items', 'user'])
            ->firstOrFail();

        // Check ownership
        if ($order->user_id && $order->user_id !== $user?->id && !$user?->isAdmin()) {
            return $this->error('Order not found', 404);
        }

        $pdf = \PDF::loadView('invoices.order', ['order' => $order]);

        return $pdf->download("Fischer-Invoice-{$order->order_number}.pdf");
    }
}
