<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Order #{{ $order->order_number }}</title>
    <style>
        body { margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: #951212; padding: 24px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 22px; }
        .content { padding: 24px; }
        .order-info { background: #f9f9f9; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
        .order-info h2 { margin: 0 0 12px; font-size: 18px; color: #333; }
        .info-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #eee; }
        .info-label { color: #666; font-size: 14px; }
        .info-value { color: #333; font-size: 14px; font-weight: 600; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        th { background: #f5f5f5; text-align: left; padding: 10px 12px; font-size: 13px; color: #666; text-transform: uppercase; }
        td { padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 14px; color: #333; }
        .totals { margin-top: 12px; }
        .totals .row { display: flex; justify-content: space-between; padding: 6px 0; }
        .totals .total { font-size: 18px; font-weight: bold; color: #951212; border-top: 2px solid #951212; padding-top: 8px; }
        .footer { padding: 20px 24px; background: #f9f9f9; text-align: center; font-size: 12px; color: #999; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
        .badge-pending { background: #fff3cd; color: #856404; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Order Received</h1>
        </div>
        <div class="content">
            <div class="order-info">
                <h2>Order #{{ $order->order_number }}</h2>
                <div style="margin-bottom: 8px;">
                    <span class="info-label">Date:</span>
                    <span class="info-value">{{ $order->created_at->format('M d, Y h:i A') }}</span>
                </div>
                <div style="margin-bottom: 8px;">
                    <span class="info-label">Payment:</span>
                    <span class="info-value">{{ strtoupper(str_replace('_', ' ', $order->payment_method)) }}</span>
                    <span class="badge badge-pending">{{ $order->payment_status }}</span>
                </div>
            </div>

            <h3 style="color: #333; font-size: 16px;">Customer Details</h3>
            <div class="order-info">
                <div style="margin-bottom: 6px;">
                    <span class="info-label">Name:</span>
                    <strong>{{ $order->shipping_first_name }} {{ $order->shipping_last_name }}</strong>
                </div>
                <div style="margin-bottom: 6px;">
                    <span class="info-label">Phone:</span>
                    <strong>{{ $order->shipping_phone }}</strong>
                </div>
                @if($order->shipping_email)
                <div style="margin-bottom: 6px;">
                    <span class="info-label">Email:</span>
                    <strong>{{ $order->shipping_email }}</strong>
                </div>
                @endif
                <div style="margin-bottom: 6px;">
                    <span class="info-label">Address:</span>
                    <strong>{{ $order->shipping_address_line_1 }}{{ $order->shipping_address_line_2 ? ', ' . $order->shipping_address_line_2 : '' }}</strong>
                </div>
                <div>
                    <span class="info-label">City:</span>
                    <strong>{{ $order->shipping_city }}{{ $order->shipping_state ? ', ' . $order->shipping_state : '' }}</strong>
                </div>
            </div>

            <h3 style="color: #333; font-size: 16px;">Order Items</h3>
            <table>
                <thead>
                    <tr>
                        <th>Product</th>
                        <th style="text-align: center;">Qty</th>
                        <th style="text-align: right;">Price</th>
                        <th style="text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($order->items as $item)
                    <tr>
                        <td>
                            {{ $item->product_name }}
                            @if($item->variant_attributes)
                                <br><small style="color: #999;">{{ $item->variant_attributes }}</small>
                            @endif
                        </td>
                        <td style="text-align: center;">{{ $item->quantity }}</td>
                        <td style="text-align: right;">Rs. {{ number_format($item->unit_price) }}</td>
                        <td style="text-align: right;">Rs. {{ number_format($item->total_price) }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>

            <div class="totals">
                <div class="row">
                    <span class="info-label">Subtotal</span>
                    <span class="info-value">Rs. {{ number_format($order->subtotal) }}</span>
                </div>
                @if($order->discount_amount > 0)
                <div class="row">
                    <span class="info-label">Discount{{ $order->coupon_code ? ' (' . $order->coupon_code . ')' : '' }}</span>
                    <span class="info-value" style="color: #28a745;">-Rs. {{ number_format($order->discount_amount) }}</span>
                </div>
                @endif
                <div class="row">
                    <span class="info-label">Shipping ({{ $order->shipping_method }})</span>
                    <span class="info-value">{{ $order->shipping_amount > 0 ? 'Rs. ' . number_format($order->shipping_amount) : 'Free' }}</span>
                </div>
                @if($order->loyalty_discount > 0)
                <div class="row">
                    <span class="info-label">Loyalty Points</span>
                    <span class="info-value" style="color: #28a745;">-Rs. {{ number_format($order->loyalty_discount) }}</span>
                </div>
                @endif
                <div class="row total">
                    <span>Total</span>
                    <span>Rs. {{ number_format($order->total) }}</span>
                </div>
            </div>

            @if($order->customer_notes)
            <div class="order-info" style="margin-top: 20px;">
                <span class="info-label">Customer Notes:</span>
                <p style="margin: 8px 0 0; color: #333;">{{ $order->customer_notes }}</p>
            </div>
            @endif
        </div>
        <div class="footer">
            <p>This is an automated notification from Fischer Pakistan.</p>
            <p>&copy; {{ date('Y') }} Fischer Pakistan. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
