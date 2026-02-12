<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Coupon;
use App\Models\ShippingZone;
use App\Models\ShippingMethod;
use App\Models\Setting;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CheckoutController extends Controller
{
    public function getShippingMethods(Request $request)
    {
        $request->validate([
            'city' => 'required|string',
        ]);

        $zone = ShippingZone::findByCity($request->city);
        $methods = ShippingMethod::active()->ordered()->get();

        $cart = $this->getCart($request);
        $subtotal = $cart ? $cart->subtotal : 0;
        $weight = $cart ? $cart->total_weight : 0;
        $itemCount = $cart ? $cart->items_count : 0;

        $formattedMethods = $methods->map(function ($method) use ($subtotal, $weight, $itemCount, $zone) {
            return [
                'id' => $method->id,
                'code' => $method->code,
                'name' => $method->name,
                'description' => $method->description,
                'cost' => $method->calculateCost($subtotal, $weight, $itemCount, $zone),
                'estimated_delivery' => $method->getEstimatedDelivery($zone),
            ];
        });

        return $this->success($formattedMethods);
    }

    public function calculateTotals(Request $request)
    {
        $request->validate([
            'shipping_method_id' => 'nullable|exists:shipping_methods,id',
            'city' => 'nullable|string',
            'loyalty_points' => 'nullable|integer|min:0',
        ]);

        $cart = $this->getCart($request);

        if (!$cart || $cart->items->isEmpty()) {
            return $this->error('Cart is empty', 400);
        }

        $subtotal = $cart->subtotal;
        $discount = $cart->getDiscount();

        // Calculate shipping
        $shippingCost = 0;
        if ($request->shipping_method_id && $request->city) {
            $method = ShippingMethod::find($request->shipping_method_id);
            $zone = ShippingZone::findByCity($request->city);
            if ($method) {
                $shippingCost = $method->calculateCost($subtotal, $cart->total_weight, $cart->items_count, $zone);
            }
        }

        // Calculate loyalty points discount
        $loyaltyDiscount = 0;
        $loyaltyPoints = $request->loyalty_points ?? 0;
        $user = auth('sanctum')->user();
        if ($loyaltyPoints > 0 && $user) {
            $maxPoints = min($loyaltyPoints, $user->loyalty_points);
            $loyaltyDiscount = $maxPoints * 1; // 1 point = Rs. 1
            $loyaltyDiscount = min($loyaltyDiscount, $subtotal - $discount); // Can't exceed order total
        }

        $total = $subtotal - $discount + $shippingCost - $loyaltyDiscount;

        return $this->success([
            'subtotal' => round($subtotal, 2),
            'discount' => round($discount, 2),
            'coupon_code' => $cart->coupon_code,
            'shipping_cost' => round($shippingCost, 2),
            'loyalty_points_used' => $loyaltyPoints,
            'loyalty_discount' => round($loyaltyDiscount, 2),
            'total' => round(max(0, $total), 2),
        ]);
    }

    public function placeOrder(Request $request)
    {
        $validated = $request->validate([
            // Shipping info (accept either name or first_name/last_name)
            'shipping_name' => 'required_without_all:shipping_first_name,shipping_last_name|nullable|string|max:255',
            'shipping_first_name' => 'required_without:shipping_name|nullable|string|max:255',
            'shipping_last_name' => 'required_without:shipping_name|nullable|string|max:255',
            'shipping_phone' => 'required|string|max:20',
            'shipping_email' => 'nullable|email|max:255',
            'shipping_address_line_1' => 'required|string|max:500',
            'shipping_address_line_2' => 'nullable|string|max:500',
            'shipping_city' => 'required|string|max:255',
            'shipping_state' => 'nullable|string|max:255',
            'shipping_postal_code' => 'nullable|string|max:10',

            // Billing (optional)
            'billing_same_as_shipping' => 'boolean',
            'billing_name' => 'nullable|string|max:255',
            'billing_first_name' => 'nullable|string|max:255',
            'billing_last_name' => 'nullable|string|max:255',
            'billing_phone' => 'nullable|string|max:20',
            'billing_address_line_1' => 'nullable|string|max:500',
            'billing_city' => 'nullable|string|max:255',

            // Payment
            'payment_method' => 'required|in:cod,bank_transfer,jazzcash,easypaisa,card',

            // Shipping method
            'shipping_method_id' => 'required|exists:shipping_methods,id',

            // Loyalty points
            'loyalty_points' => 'nullable|integer|min:0',

            // Notes
            'notes' => 'nullable|string|max:1000',
        ]);

        // Parse shipping name into first/last if not provided separately
        if (!empty($validated['shipping_name']) && empty($validated['shipping_first_name'])) {
            $nameParts = explode(' ', $validated['shipping_name'], 2);
            $validated['shipping_first_name'] = $nameParts[0];
            $validated['shipping_last_name'] = $nameParts[1] ?? '';
        }

        // Parse billing name if provided
        if (!empty($validated['billing_name']) && empty($validated['billing_first_name'])) {
            $nameParts = explode(' ', $validated['billing_name'], 2);
            $validated['billing_first_name'] = $nameParts[0];
            $validated['billing_last_name'] = $nameParts[1] ?? '';
        }

        // Map notes field
        $validated['customer_notes'] = $validated['notes'] ?? null;

        $cart = $this->getCart($request);

        if (!$cart || $cart->items->isEmpty()) {
            return $this->error('Your cart is empty', 400);
        }

        // Validate stock availability
        foreach ($cart->items as $item) {
            if (!$item->is_available) {
                return $this->error("Product '{$item->product->name}' is no longer available", 400);
            }
        }

        return DB::transaction(function () use ($validated, $cart, $request) {
            // Try to get authenticated user (works even without auth:sanctum middleware)
            $user = auth('sanctum')->user();

            // Calculate amounts
            $subtotal = $cart->subtotal;
            $discount = $cart->getDiscount();

            // Shipping
            $shippingMethod = ShippingMethod::find($validated['shipping_method_id']);
            $zone = ShippingZone::findByCity($validated['shipping_city']);
            $shippingAmount = $shippingMethod->calculateCost($subtotal, $cart->total_weight, $cart->items_count, $zone);

            // Free shipping coupon
            if ($cart->coupon_code) {
                $coupon = Coupon::where('code', $cart->coupon_code)->first();
                if ($coupon && $coupon->type === 'free_shipping') {
                    $shippingAmount = 0;
                }
            }

            // Loyalty points
            $loyaltyPointsUsed = 0;
            $loyaltyDiscount = 0;
            if ($user && ($validated['loyalty_points'] ?? 0) > 0) {
                $loyaltyPointsUsed = min($validated['loyalty_points'], $user->loyalty_points);
                $loyaltyDiscount = $loyaltyPointsUsed * 1; // 1 point = Rs. 1
                $loyaltyDiscount = min($loyaltyDiscount, $subtotal - $discount);
            }

            $total = $subtotal - $discount + $shippingAmount - $loyaltyDiscount;

            // Create order
            $order = Order::create([
                'user_id' => $user?->id,
                'guest_email' => $user ? null : ($validated['shipping_email'] ?? null),
                'guest_phone' => $user ? null : ($validated['shipping_phone'] ?? null),
                'status' => 'pending',
                'payment_status' => 'pending',
                'payment_method' => $validated['payment_method'],

                'subtotal' => $subtotal,
                'discount_amount' => $discount,
                'shipping_amount' => $shippingAmount,
                'tax_amount' => 0,
                'total' => $total,

                'shipping_first_name' => $validated['shipping_first_name'],
                'shipping_last_name' => $validated['shipping_last_name'],
                'shipping_phone' => $validated['shipping_phone'],
                'shipping_email' => ($validated['shipping_email'] ?? null) ?? $user?->email,
                'shipping_address_line_1' => $validated['shipping_address_line_1'],
                'shipping_address_line_2' => $validated['shipping_address_line_2'] ?? null,
                'shipping_city' => $validated['shipping_city'],
                'shipping_state' => $validated['shipping_state'] ?? null,
                'shipping_postal_code' => $validated['shipping_postal_code'] ?? null,
                'shipping_country' => 'Pakistan',

                'same_billing_address' => $validated['billing_same_as_shipping'] ?? true,
                'billing_first_name' => $validated['billing_first_name'] ?? null,
                'billing_last_name' => $validated['billing_last_name'] ?? null,
                'billing_phone' => $validated['billing_phone'] ?? null,
                'billing_address_line_1' => $validated['billing_address_line_1'] ?? null,
                'billing_city' => $validated['billing_city'] ?? null,

                'shipping_method' => $shippingMethod->name,

                'coupon_code' => $cart->coupon_code,
                'coupon_id' => $cart->coupon?->id,

                'loyalty_points_used' => $loyaltyPointsUsed,
                'loyalty_discount' => $loyaltyDiscount,

                'customer_notes' => $validated['customer_notes'] ?? null,
                'source' => 'website',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            // Create order items
            foreach ($cart->items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'product_variant_id' => $item->product_variant_id,
                    'product_name' => $item->product->name,
                    'product_sku' => $item->productVariant?->sku ?? $item->product->sku,
                    'product_image' => $item->product->primary_image,
                    'variant_attributes' => $item->productVariant?->attribute_values_formatted,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'total_price' => $item->total_price,
                ]);

                // Update stock
                if ($item->product_variant_id) {
                    $item->productVariant->updateStock($item->quantity, 'decrement');
                } else {
                    $item->product->updateStock($item->quantity, 'decrement');
                }

                // Update sales count
                $item->product->incrementSalesCount($item->quantity);
            }

            // Record coupon usage
            if ($cart->coupon_code && $cart->coupon) {
                $cart->coupon->recordUsage($order, $user?->id, $discount);
            }

            // Deduct loyalty points
            if ($loyaltyPointsUsed > 0 && $user) {
                $user->redeemLoyaltyPoints(
                    $loyaltyPointsUsed,
                    "Redeemed for order #{$order->order_number}",
                    Order::class,
                    $order->id
                );
            }

            // Calculate loyalty points earned
            $pointsEarned = floor($total / 100); // 1 point per Rs. 100
            $order->update(['loyalty_points_earned' => $pointsEarned]);

            // Clear cart
            $cart->clear();

            // Handle payment
            $paymentResult = $this->handlePayment($order, $validated['payment_method'], $request);

            return $this->success([
                'order' => $order->fresh()->load('items'),
                'payment' => $paymentResult,
            ], 'Order placed successfully', 201);
        });
    }

    protected function handlePayment(Order $order, string $method, Request $request): array
    {
        switch ($method) {
            case 'cod':
                $order->updateStatus('confirmed', 'Order confirmed - Cash on Delivery');
                return [
                    'method' => 'cod',
                    'message' => 'Order confirmed. Pay on delivery.',
                ];

            case 'bank_transfer':
                return [
                    'method' => 'bank_transfer',
                    'message' => 'Please transfer the amount to our bank account.',
                    'bank_details' => [
                        'bank_name' => Setting::get('bank.bank_name', 'Contact us for bank details'),
                        'account_title' => Setting::get('bank.account_title', 'Fischer Pakistan'),
                        'account_number' => Setting::get('bank.account_number', ''),
                        'iban' => Setting::get('bank.iban', ''),
                    ],
                ];

            case 'jazzcash':
            case 'easypaisa':
            case 'card':
                // Generate payment URL
                $paymentService = new PaymentService();
                $paymentUrl = $paymentService->createPayment($order, $method);

                return [
                    'method' => $method,
                    'redirect_url' => $paymentUrl,
                    'message' => 'Redirecting to payment gateway...',
                ];

            default:
                return ['method' => $method, 'message' => 'Unknown payment method'];
        }
    }

    protected function getCart(Request $request): ?Cart
    {
        // Use sanctum guard to get authenticated user even without middleware
        $userId = auth('sanctum')->id();
        $sessionId = $request->header('X-Session-ID') ?? $request->session_id;

        if ($userId) {
            return Cart::with(['items.product', 'items.productVariant'])->where('user_id', $userId)->first();
        }

        if ($sessionId) {
            return Cart::with(['items.product', 'items.productVariant'])->where('session_id', $sessionId)->first();
        }

        return null;
    }
}
