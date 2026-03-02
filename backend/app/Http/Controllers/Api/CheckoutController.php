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
use Illuminate\Support\Facades\Storage;

class CheckoutController extends Controller
{
    public function __construct(
        private CartService $cartService,
        private OrderCreationService $orderService,
    ) {}

    public function uploadReceipt(Request $request)
    {
        $request->validate([
            'receipt' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        $path = $request->file('receipt')->store('payment-proofs', 'public');

        return $this->success([
            'path' => $path,
            'url'  => Storage::url($path),
        ]);
    }

    public function getShippingMethods(Request $request)
    {
        $request->validate([
            'city' => 'required|string',
        ]);

        // Step 1: query shipping data — only fall back here if tables are missing
        try {
            $zone    = ShippingZone::findByCity($request->city);
            $methods = ShippingMethod::active()->ordered()->get();
        } catch (\Throwable $e) {
            \Log::error('Shipping tables query error: ' . $e->getMessage() . ' at ' . $e->getFile() . ':' . $e->getLine());
            return $this->success($this->defaultShippingMethods($request->city));
        }

        if ($methods->isEmpty()) {
            return $this->success($this->defaultShippingMethods($request->city));
        }

        // Step 2: get cart totals for cost calculation — failure here must NOT
        // cause a 500; we just use 0 and still return real shipping method IDs.
        $subtotal  = 0;
        $weight    = 0;
        $itemCount = 0;
        try {
            $cart      = $this->cartService->getCartForCheckout($request);
            $subtotal  = $cart ? $cart->subtotal  : 0;
            $weight    = $cart ? $cart->total_weight : 0;
            $itemCount = $cart ? $cart->items_count  : 0;
        } catch (\Throwable $e) {
            \Log::warning('Cart lookup failed in getShippingMethods (using cost=0): ' . $e->getMessage());
        }

        $formattedMethods = $methods->map(function ($method) use ($subtotal, $weight, $itemCount, $zone) {
            return [
                'id'                 => $method->id,
                'code'               => $method->code,
                'name'               => $method->name,
                'description'        => $method->description,
                'cost'               => $method->calculateCost($subtotal, $weight, $itemCount, $zone),
                'estimated_delivery' => $method->getEstimatedDelivery($zone),
            ];
        });

        return $this->success($formattedMethods);
    }

    private function defaultShippingMethods(string $city): array
    {
        $isLahore = strtolower(trim($city)) === 'lahore';
        return [
            [
                'id'                 => null,
                'code'               => 'standard',
                'name'               => 'Standard Delivery',
                'description'        => 'Free delivery in Lahore. Rs. 200 for other cities.',
                'cost'               => $isLahore ? 0 : 200,
                'estimated_delivery' => '3-5 days',
            ],
            [
                'id'                 => null,
                'code'               => 'express',
                'name'               => 'Express Delivery',
                'description'        => 'Priority handling + express courier. Delivery in 1–2 business days.',
                'cost'               => $isLahore ? 300 : 500,
                'estimated_delivery' => '1-2 days',
            ],
        ];
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

        // Check if payment method is enabled
        $method = $validated['payment_method'];
        $enabledMethods = $this->getEnabledPaymentMethodIds();
        if (!in_array($method, $enabledMethods)) {
            return $this->error('This payment method is not currently available.', 422);
        }

        try {
            // Run all DB writes in a single atomic transaction.
            // sendOrderNotifications is intentionally called AFTER commit so that
            // queue jobs are never inserted inside an uncommitted transaction — a
            // race condition that causes "order not found" errors with database queue.
            [$order, $paymentResult, $user] = DB::transaction(
                function () use ($validated, $cart, $ipAddress, $userAgent) {
                    $user = auth('sanctum')->user();

                    $this->orderService->validateStock($cart);
                    $totals = $this->orderService->calculateTotals($cart, $validated, $user);

                    $order = $this->orderService->createOrder(
                        $user, $cart, $totals, $validated, $ipAddress, $userAgent
                    );

                    $this->orderService->createOrderItems($order, $cart);
                    $this->orderService->handleCouponUsage($cart, $order, $user, $totals['discount']);
                    $this->orderService->handleLoyaltyPoints(
                        $order,
                        $user,
                        $totals['loyalty_points_used'],
                        $totals['total'],
                        $totals['loyalty_enabled']
                    );

                    $cart->clear();

                    $paymentResult = $this->handlePayment(
                        $order, $validated['payment_method'], request()
                    );

                    return [$order->fresh()->load('items'), $paymentResult, $user];
                }
            );

            // Send notification emails synchronously.
            // defer() does not execute on Hostinger PHP-FPM (process terminates early).
            $this->orderService->sendOrderNotifications($order, $user);

            return $this->success([
                'order'   => $order,
                'payment' => $paymentResult,
            ], 'Order placed successfully', 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->error($e->getMessage(), 422, $e->errors());
        } catch (\RuntimeException $e) {
            \Log::error('Payment gateway error: ' . $e->getMessage());
            return $this->error(
                'Payment gateway error. Please try a different payment method or contact support.',
                422
            );
        } catch (\Exception $e) {
            \Log::error('Order placement failed: ' . $e->getMessage(), [
                'file'  => $e->getFile(),
                'line'  => $e->getLine(),
            ]);
            return $this->error('Order could not be placed: ' . $e->getMessage(), 500);
        }
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
                        'bank_name'      => Setting::get('payment.bank_name', 'HBL - Habib Bank Limited'),
                        'bank_branch'    => Setting::get('payment.bank_branch', ''),
                        'account_title'  => Setting::get('payment.bank_account_title', 'Fischer Pakistan'),
                        'account_number' => Setting::get('payment.bank_account_number', 'Contact us for details'),
                        'iban'           => Setting::get('payment.bank_iban', ''),
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

    private function getEnabledPaymentMethodIds(): array
    {
        $enabled = [];
        if ((bool) Setting::get('payment.cod_enabled', true)) $enabled[] = 'cod';
        if ((bool) Setting::get('payment.bank_transfer_enabled', true)) $enabled[] = 'bank_transfer';
        if ((bool) Setting::get('payment.jazzcash_enabled', false)) $enabled[] = 'jazzcash';
        if ((bool) Setting::get('payment.easypaisa_enabled', false)) $enabled[] = 'easypaisa';
        if ((bool) Setting::get('payment.card_enabled', false)) $enabled[] = 'card';
        return $enabled;
    }

}
