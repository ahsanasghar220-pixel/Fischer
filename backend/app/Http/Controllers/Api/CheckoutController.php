<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Order;
use App\Models\ShippingZone;
use App\Models\ShippingMethod;
use App\Models\Setting;
use App\Services\CartService;
use App\Services\OrderCreationService;
use App\Services\PaymentService;
use App\Http\Requests\PlaceOrderRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CheckoutController extends Controller
{
    public function __construct(
        private CartService $cartService,
        private OrderCreationService $orderService,
    ) {}

    public function getShippingMethods(Request $request)
    {
        $request->validate([
            'city' => 'required|string',
        ]);

        $zone = ShippingZone::findByCity($request->city);
        $methods = ShippingMethod::active()->ordered()->get();

        $cart = $this->cartService->getCartForCheckout($request);
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

        $cart = $this->cartService->getCartForCheckout($request);

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
        $pointValue = (int) Setting::get('loyalty.point_value', 1);
        if ($loyaltyPoints > 0 && $user) {
            $maxPoints = min($loyaltyPoints, $user->loyalty_points);
            $loyaltyDiscount = $maxPoints * $pointValue;
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

    public function placeOrder(PlaceOrderRequest $request)
    {
        $validated = $request->validated();

        // Parse shipping name into first/last if not provided separately
        if (!empty($validated['shipping_name']) && empty($validated['shipping_first_name'])) {
            $nameParts = explode(' ', $validated['shipping_name'], 2);
            $validated['shipping_first_name'] = $nameParts[0];
            $validated['shipping_last_name']  = $nameParts[1] ?? '';
        }

        // Parse billing name if provided
        if (!empty($validated['billing_name']) && empty($validated['billing_first_name'])) {
            $nameParts = explode(' ', $validated['billing_name'], 2);
            $validated['billing_first_name'] = $nameParts[0];
            $validated['billing_last_name']  = $nameParts[1] ?? '';
        }

        // Map notes field
        $validated['customer_notes'] = $validated['notes'] ?? null;

        $cart = $this->cartService->getCartForCheckout($request);

        if (!$cart || $cart->items->isEmpty()) {
            return $this->error('Your cart is empty', 400);
        }

        $ipAddress = $request->ip();
        $userAgent = $request->userAgent();

        return DB::transaction(function () use ($validated, $cart, $ipAddress, $userAgent) {
            // Try to get authenticated user (works even without auth:sanctum middleware)
            $user = auth('sanctum')->user();

            // Re-validate stock inside transaction with row-level locks
            $this->orderService->validateStock($cart);

            // Calculate subtotal, shipping, loyalty discounts, and total
            $totals = $this->orderService->calculateTotals($cart, $validated, $user);

            // Persist the order
            $order = $this->orderService->createOrder(
                $user, $cart, $totals, $validated, $ipAddress, $userAgent
            );

            // Create order items, decrement stock, update sales counts
            $this->orderService->createOrderItems($order, $cart);

            // Record coupon usage
            $this->orderService->handleCouponUsage($cart, $order, $user, $totals['discount']);

            // Deduct redeemed loyalty points and record points earned
            $this->orderService->handleLoyaltyPoints(
                $order,
                $user,
                $totals['loyalty_points_used'],
                $totals['total'],
                $totals['loyalty_enabled']
            );

            // Clear cart
            $cart->clear();

            // Queue order notification emails
            $this->orderService->sendOrderNotifications($order, $user);

            // Handle payment
            $paymentResult = $this->handlePayment($order, $validated['payment_method'], request());

            return $this->success([
                'order'   => $order->fresh()->load('items'),
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
                // Mark order as pending payment verification
                $order->update([
                    'status' => 'pending_payment',
                    'payment_status' => 'pending',
                ]);

                return [
                    'method' => 'bank_transfer',
                    'message' => 'Order received. Payment verification pending.',
                    'instructions' => 'Your transaction ID has been recorded. Admin will verify your payment and confirm your order.',
                    'bank_details' => [
                        'bank_name' => Setting::get('bank.bank_name', 'HBL - Habib Bank Limited'),
                        'account_title' => Setting::get('bank.account_title', 'Fischer Pakistan'),
                        'account_number' => Setting::get('bank.account_number', 'Contact us for details'),
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

}
