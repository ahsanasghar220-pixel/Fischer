<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use App\Models\Product;
use App\Models\Setting;
use App\Models\ShippingMethod;
use App\Models\ShippingZone;
use App\Mail\OrderPlacedNotification;
use App\Mail\OrderConfirmation;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class OrderCreationService
{
    /**
     * Re-validate stock availability with row-level locks inside a DB transaction.
     * Throws \Exception if any item is out of stock or no longer available.
     *
     * Must be called INSIDE a DB::transaction() so that lockForUpdate() works.
     */
    public function validateStock(Cart $cart): void
    {
        foreach ($cart->items as $item) {
            if ($item->product_variant_id) {
                $variant = ProductVariant::lockForUpdate()->find($item->product_variant_id);

                if (!$variant) {
                    throw new \Exception("Product variant no longer exists");
                }

                if ($variant->product->track_inventory && !$variant->product->allow_backorders) {
                    if ($variant->stock_quantity < $item->quantity) {
                        throw new \Exception(
                            "'{$item->product->name}' only has {$variant->stock_quantity} items available, " .
                            "but you requested {$item->quantity}"
                        );
                    }
                }
            } else {
                $product = Product::lockForUpdate()->find($item->product_id);

                if (!$product || !$product->is_active) {
                    throw new \Exception("Product '{$item->product->name}' is no longer available");
                }

                if ($product->track_inventory && !$product->allow_backorders) {
                    if ($product->stock_quantity < $item->quantity) {
                        throw new \Exception(
                            "'{$product->name}' only has {$product->stock_quantity} items available, " .
                            "but you requested {$item->quantity}"
                        );
                    }
                }
            }
        }
    }

    /**
     * Calculate order totals.
     *
     * Returns an array with keys:
     *   subtotal, discount, shipping_amount, loyalty_points_used, loyalty_discount, total, loyalty_enabled
     *
     * @param  Cart   $cart
     * @param  array  $validated  Validated request data (shipping_method_id, shipping_city, loyalty_points, …)
     * @param  \App\Models\User|null  $user
     * @return array
     */
    public function calculateTotals(Cart $cart, array $validated, $user): array
    {
        $subtotal = $cart->subtotal;
        $discount = $cart->getDiscount();

        // Shipping
        $shippingMethod = ShippingMethod::find($validated['shipping_method_id']);
        $zone = ShippingZone::findByCity($validated['shipping_city']);
        $shippingAmount = $shippingMethod->calculateCost(
            $subtotal,
            $cart->total_weight,
            $cart->items_count,
            $zone
        );

        // Free shipping coupon
        if ($cart->coupon_code) {
            $coupon = Coupon::where('code', $cart->coupon_code)->first();
            if ($coupon && $coupon->type === 'free_shipping') {
                $shippingAmount = 0;
            }
        }

        // Loyalty points
        $loyaltyPointsUsed = 0;
        $loyaltyDiscount   = 0;
        $pointValue        = (int) Setting::get('loyalty.point_value', 1);
        $loyaltyEnabled    = Setting::get('loyalty.enabled', true);

        if ($loyaltyEnabled && $user && ($validated['loyalty_points'] ?? 0) > 0) {
            $loyaltyPointsUsed = min($validated['loyalty_points'], $user->loyalty_points);
            $loyaltyDiscount   = $loyaltyPointsUsed * $pointValue;
            $loyaltyDiscount   = min($loyaltyDiscount, $subtotal - $discount);
        }

        $total = $subtotal - $discount + $shippingAmount - $loyaltyDiscount;

        return [
            'subtotal'            => $subtotal,
            'discount'            => $discount,
            'shipping_amount'     => $shippingAmount,
            'shipping_method'     => $shippingMethod,
            'loyalty_points_used' => $loyaltyPointsUsed,
            'loyalty_discount'    => $loyaltyDiscount,
            'loyalty_enabled'     => $loyaltyEnabled,
            'total'               => $total,
        ];
    }

    /**
     * Create the Order record in the database.
     *
     * @param  \App\Models\User|null  $user
     * @param  Cart   $cart
     * @param  array  $totals    Output of calculateTotals()
     * @param  array  $validated Validated request data
     * @param  string $ipAddress Request IP address
     * @param  string $userAgent Request user-agent string
     * @return Order
     */
    public function createOrder(
        $user,
        Cart $cart,
        array $totals,
        array $validated,
        string $ipAddress,
        string $userAgent
    ): Order {
        return Order::create([
            'user_id'     => $user?->id,
            'guest_email' => $user ? null : ($validated['shipping_email'] ?? null),
            'guest_phone' => $user ? null : ($validated['shipping_phone'] ?? null),
            'status'          => 'pending',
            'payment_status'  => 'pending',
            'payment_method'  => $validated['payment_method'],
            'transaction_id'  => $validated['transaction_id'] ?? null,

            'subtotal'        => $totals['subtotal'],
            'discount_amount' => $totals['discount'],
            'shipping_amount' => $totals['shipping_amount'],
            'tax_amount'      => 0,
            'total'           => $totals['total'],

            'shipping_first_name'    => $validated['shipping_first_name'],
            'shipping_last_name'     => $validated['shipping_last_name'],
            'shipping_phone'         => $validated['shipping_phone'],
            'shipping_email'         => ($validated['shipping_email'] ?? null) ?? $user?->email,
            'shipping_address_line_1' => $validated['shipping_address_line_1'],
            'shipping_address_line_2' => $validated['shipping_address_line_2'] ?? null,
            'shipping_city'          => $validated['shipping_city'],
            'shipping_state'         => $validated['shipping_state'] ?? null,
            'shipping_postal_code'   => $validated['shipping_postal_code'] ?? null,
            'shipping_country'       => 'Pakistan',

            'same_billing_address'   => $validated['billing_same_as_shipping'] ?? true,
            'billing_first_name'     => $validated['billing_first_name'] ?? null,
            'billing_last_name'      => $validated['billing_last_name'] ?? null,
            'billing_phone'          => $validated['billing_phone'] ?? null,
            'billing_address_line_1' => $validated['billing_address_line_1'] ?? null,
            'billing_city'           => $validated['billing_city'] ?? null,

            'shipping_method' => $totals['shipping_method']->name,

            'coupon_code' => $cart->coupon_code,
            'coupon_id'   => $cart->coupon?->id,

            'loyalty_points_used' => $totals['loyalty_points_used'],
            'loyalty_discount'    => $totals['loyalty_discount'],

            'customer_notes' => $validated['customer_notes'] ?? null,
            'source'         => 'website',
            'ip_address'     => $ipAddress,
            'user_agent'     => $userAgent,
        ]);
    }

    /**
     * Create order items from cart, decrement stock, and update sales counts.
     */
    public function createOrderItems(Order $order, Cart $cart): void
    {
        foreach ($cart->items as $item) {
            OrderItem::create([
                'order_id'          => $order->id,
                'product_id'        => $item->product_id,
                'product_variant_id' => $item->product_variant_id,
                'product_name'      => $item->product->name,
                'product_sku'       => $item->productVariant?->sku ?? $item->product->sku,
                'product_image'     => $item->product->primary_image,
                'variant_attributes' => $item->productVariant?->attribute_values_formatted,
                'quantity'          => $item->quantity,
                'unit_price'        => $item->unit_price,
                'total_price'       => $item->total_price,
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
    }

    /**
     * Record coupon usage if a coupon was applied to the cart.
     *
     * @param  Cart   $cart
     * @param  Order  $order
     * @param  \App\Models\User|null  $user
     * @param  float  $discount
     */
    public function handleCouponUsage(Cart $cart, Order $order, $user, float $discount): void
    {
        if ($cart->coupon_code && $cart->coupon) {
            $cart->coupon->recordUsage($order, $user?->id, $discount);
        }
    }

    /**
     * Deduct redeemed loyalty points from the user and record points earned on the order.
     *
     * @param  Order  $order
     * @param  \App\Models\User|null  $user
     * @param  int    $pointsUsed
     * @param  float  $total
     * @param  bool   $loyaltyEnabled
     */
    public function handleLoyaltyPoints(Order $order, $user, int $pointsUsed, float $total, bool $loyaltyEnabled): void
    {
        // Deduct redeemed points
        if ($pointsUsed > 0 && $user) {
            $user->redeemLoyaltyPoints(
                $pointsUsed,
                "Redeemed for order #{$order->order_number}",
                Order::class,
                $order->id
            );
        }

        // Calculate and record points earned on this order
        $pointsPerAmount = (int) Setting::get('loyalty.points_per_amount', 100);
        $pointsEarned    = $pointsPerAmount > 0 ? floor($total / $pointsPerAmount) : 0;

        if (!$loyaltyEnabled) {
            $pointsEarned = 0;
        }

        $order->update(['loyalty_points_earned' => $pointsEarned]);
    }

    /**
     * Queue order confirmation emails to admin recipients and to the customer.
     * Failures are caught and logged so they do not abort the order transaction.
     *
     * @param  Order  $order
     * @param  \App\Models\User|null  $user
     */
    public function sendOrderNotifications(Order $order, $user): void
    {
        try {
            $notificationEnabled = Setting::get('notifications.order_notification_enabled', true);

            if ($notificationEnabled) {
                $recipientEmails = Setting::get(
                    'notifications.order_notification_emails',
                    'fischer.few@gmail.com'
                );
                $emails = array_filter(array_map('trim', explode(',', $recipientEmails)));

                foreach ($emails as $email) {
                    if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
                        Mail::to($email)->queue(new OrderPlacedNotification($order));
                    }
                }
            }

            $customerConfirmation = Setting::get('notifications.order_confirmation_to_customer', true);
            $customerEmail        = $order->shipping_email ?? $user?->email;

            if ($customerConfirmation && $customerEmail) {
                Mail::to($customerEmail)->queue(new OrderConfirmation($order));
            }
        } catch (\Exception $e) {
            Log::error('Failed to send order notification emails: ' . $e->getMessage());
        }
    }
}
