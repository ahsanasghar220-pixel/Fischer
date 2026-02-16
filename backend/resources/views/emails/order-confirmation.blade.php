<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmed #{{ $order->order_number }}</title>
    <style>
        body { margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: #951212; padding: 24px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 22px; }
        .header p { color: #f0b4b4; margin: 8px 0 0; font-size: 14px; }
        .content { padding: 24px; }
        .greeting { font-size: 16px; color: #333; margin-bottom: 16px; }
        .order-summary { background: #f9f9f9; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        th { background: #f5f5f5; text-align: left; padding: 10px 12px; font-size: 13px; color: #666; text-transform: uppercase; }
        td { padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 14px; color: #333; }
        .totals .row { display: flex; justify-content: space-between; padding: 6px 0; }
        .totals .total { font-size: 18px; font-weight: bold; color: #951212; border-top: 2px solid #951212; padding-top: 8px; }
        .info-label { color: #666; font-size: 14px; }
        .info-value { color: #333; font-size: 14px; font-weight: 600; }
        .cta { display: inline-block; background: #951212; color: #ffffff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0; }
        .footer { padding: 20px 24px; background: #f9f9f9; text-align: center; font-size: 12px; color: #999; }
        .support { background: #fff3cd; border-radius: 8px; padding: 12px 16px; margin: 20px 0; font-size: 13px; color: #856404; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Thank You for Your Order!</h1>
            <p>Order #{{ $order->order_number }} has been received</p>
        </div>
        <div class="content">
            <p class="greeting">
                Dear {{ $order->shipping_first_name }},
            </p>
            <p style="color: #555; font-size: 14px; line-height: 1.6;">
                Thank you for shopping with Fischer Pakistan! We've received your order and it's being processed.
                You'll receive updates as your order progresses.
            </p>

            <h3 style="color: #333; font-size: 16px;">Order Summary</h3>
            <table>
                <thead>
                    <tr>
                        <th>Product</th>
                        <th style="text-align: center;">Qty</th>
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
                    <span class="info-label">Discount</span>
                    <span class="info-value" style="color: #28a745;">-Rs. {{ number_format($order->discount_amount) }}</span>
                </div>
                @endif
                <div class="row">
                    <span class="info-label">Shipping</span>
                    <span class="info-value">{{ $order->shipping_amount > 0 ? 'Rs. ' . number_format($order->shipping_amount) : 'Free' }}</span>
                </div>
                <div class="row total">
                    <span>Total</span>
                    <span>Rs. {{ number_format($order->total) }}</span>
                </div>
            </div>

            <h3 style="color: #333; font-size: 16px;">Delivery Address</h3>
            <div class="order-summary">
                <p style="margin: 0; color: #333;">
                    {{ $order->shipping_first_name }} {{ $order->shipping_last_name }}<br>
                    {{ $order->shipping_address_line_1 }}<br>
                    @if($order->shipping_address_line_2){{ $order->shipping_address_line_2 }}<br>@endif
                    {{ $order->shipping_city }}{{ $order->shipping_state ? ', ' . $order->shipping_state : '' }}<br>
                    {{ $order->shipping_phone }}
                </p>
            </div>

            <div class="support">
                <strong>Need help?</strong> Contact us at fischer.few@gmail.com or call our support team.
                We're here to help!
            </div>
        </div>
        <div class="footer">
            <p>Thank you for choosing Fischer Pakistan!</p>
            <p>&copy; {{ date('Y') }} Fischer Pakistan. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
