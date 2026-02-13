<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Invoice {{ $order->order_number }}</title>
<style>
    @page { margin: 15mm 18mm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
        font-family: DejaVu Sans, sans-serif;
        font-size: 11px;
        color: #1a1a1a;
        line-height: 1.5;
    }

    /* Header */
    .header { width: 100%; margin-bottom: 20px; }
    .header td { vertical-align: top; }
    .brand-name { font-size: 22px; font-weight: bold; color: #951212; }
    .brand-sub { font-size: 9px; color: #777; text-transform: uppercase; letter-spacing: 1px; }
    .invoice-title { font-size: 24px; font-weight: bold; color: #951212; text-align: right; }
    .invoice-meta { text-align: right; font-size: 10.5px; color: #555; margin-top: 4px; }
    .invoice-meta strong { color: #1a1a1a; }

    /* Divider */
    .divider { border: none; border-top: 2px solid #951212; margin: 14px 0; }

    /* Address boxes */
    .addresses { width: 100%; margin-bottom: 16px; }
    .addresses td { width: 50%; vertical-align: top; padding: 0; }
    .addr-box { border: 1px solid #ddd; border-radius: 4px; padding: 12px 14px; }
    .addr-label { font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.8px; color: #951212; margin-bottom: 6px; }
    .addr-name { font-size: 12px; font-weight: bold; margin-bottom: 2px; }
    .addr-line { font-size: 10.5px; color: #555; }

    /* Items table */
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    .items-table th {
        background: #951212; color: #fff; padding: 8px 10px;
        font-size: 10px; text-transform: uppercase; letter-spacing: 0.3px;
        text-align: left; font-weight: 600;
    }
    .items-table th.right { text-align: right; }
    .items-table th.center { text-align: center; }
    .items-table td { padding: 7px 10px; border-bottom: 1px solid #eee; font-size: 10.5px; }
    .items-table td.right { text-align: right; font-variant-numeric: tabular-nums; }
    .items-table td.center { text-align: center; }
    .items-table tr:nth-child(even) { background: #fafafa; }
    .item-variant { font-size: 9px; color: #888; }
    .item-sku { font-size: 9px; color: #aaa; }

    /* Totals */
    .totals-wrap { width: 100%; margin-bottom: 16px; }
    .totals-wrap td.spacer { width: 55%; }
    .totals { width: 45%; border-collapse: collapse; }
    .totals td { padding: 4px 10px; font-size: 11px; }
    .totals td.right { text-align: right; font-variant-numeric: tabular-nums; }
    .totals .total-row td { font-size: 14px; font-weight: bold; color: #951212; border-top: 2px solid #951212; padding-top: 8px; }

    /* Payment info */
    .payment-box { background: #fdf5f5; border: 1px solid #e8c4c4; border-radius: 4px; padding: 12px 14px; margin-bottom: 16px; }
    .payment-box .label { font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.8px; color: #951212; margin-bottom: 6px; }

    /* Notes */
    .notes-box { background: #f9f9f9; border: 1px solid #eee; border-radius: 4px; padding: 12px 14px; margin-bottom: 16px; }
    .notes-label { font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.8px; color: #951212; margin-bottom: 4px; }

    /* Footer */
    .footer { text-align: center; font-size: 9px; color: #999; border-top: 1px solid #eee; padding-top: 10px; margin-top: 20px; }
</style>
</head>
<body>

    <!-- Header -->
    <table class="header">
        <tr>
            <td style="width: 50%;">
                <div class="brand-name">FISCHER</div>
                <div class="brand-sub">Pakistan &bull; Home Appliances</div>
            </td>
            <td style="width: 50%;">
                <div class="invoice-title">INVOICE</div>
                <div class="invoice-meta">
                    <strong>Invoice #:</strong> {{ $order->order_number }}<br>
                    <strong>Date:</strong> {{ $order->created_at->format('F d, Y') }}<br>
                    @if($order->paid_at)
                        <strong>Paid:</strong> {{ $order->paid_at->format('F d, Y') }}
                    @endif
                </div>
            </td>
        </tr>
    </table>

    <hr class="divider">

    <!-- Addresses -->
    <table class="addresses">
        <tr>
            <td style="padding-right: 8px;">
                <div class="addr-box">
                    <div class="addr-label">Shipping Address</div>
                    <div class="addr-name">{{ $order->shipping_first_name }} {{ $order->shipping_last_name }}</div>
                    <div class="addr-line">{{ $order->shipping_address_line_1 }}</div>
                    @if($order->shipping_address_line_2)
                        <div class="addr-line">{{ $order->shipping_address_line_2 }}</div>
                    @endif
                    <div class="addr-line">{{ $order->shipping_city }}, {{ $order->shipping_state }} {{ $order->shipping_postal_code }}</div>
                    @if($order->shipping_phone)
                        <div class="addr-line">Phone: {{ $order->shipping_phone }}</div>
                    @endif
                    @if($order->shipping_email)
                        <div class="addr-line">{{ $order->shipping_email }}</div>
                    @endif
                </div>
            </td>
            <td style="padding-left: 8px;">
                <div class="addr-box">
                    <div class="addr-label">Billing Address</div>
                    @if($order->same_billing_address)
                        <div class="addr-line" style="color: #888;">Same as shipping address</div>
                    @else
                        <div class="addr-name">{{ $order->billing_first_name }} {{ $order->billing_last_name }}</div>
                        <div class="addr-line">{{ $order->billing_address_line_1 }}</div>
                        @if($order->billing_address_line_2)
                            <div class="addr-line">{{ $order->billing_address_line_2 }}</div>
                        @endif
                        <div class="addr-line">{{ $order->billing_city }}, {{ $order->billing_state }} {{ $order->billing_postal_code }}</div>
                        @if($order->billing_phone)
                            <div class="addr-line">Phone: {{ $order->billing_phone }}</div>
                        @endif
                    @endif
                </div>
            </td>
        </tr>
    </table>

    <!-- Order Items -->
    <table class="items-table">
        <thead>
            <tr>
                <th style="width: 30px;">#</th>
                <th>Product</th>
                <th class="center" style="width: 55px;">Qty</th>
                <th class="right" style="width: 100px;">Unit Price</th>
                <th class="right" style="width: 100px;">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($order->items as $i => $item)
                <tr>
                    <td>{{ $i + 1 }}</td>
                    <td>
                        {{ $item->product_name }}
                        @if($item->variant_name)
                            <br><span class="item-variant">{{ $item->variant_name }}</span>
                        @endif
                        @if($item->product_sku)
                            <br><span class="item-sku">SKU: {{ $item->product_sku }}</span>
                        @endif
                    </td>
                    <td class="center">{{ $item->quantity }}</td>
                    <td class="right">PKR {{ number_format($item->unit_price, 0) }}</td>
                    <td class="right">PKR {{ number_format($item->total_price, 0) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <!-- Totals -->
    <table class="totals-wrap">
        <tr>
            <td class="spacer"></td>
            <td>
                <table class="totals">
                    <tr>
                        <td>Subtotal</td>
                        <td class="right">PKR {{ number_format($order->subtotal, 0) }}</td>
                    </tr>
                    @if($order->discount_amount > 0)
                        <tr>
                            <td>Discount{{ $order->coupon_code ? " ({$order->coupon_code})" : '' }}</td>
                            <td class="right" style="color: #27ae60;">- PKR {{ number_format($order->discount_amount, 0) }}</td>
                        </tr>
                    @endif
                    @if($order->loyalty_discount > 0)
                        <tr>
                            <td>Loyalty Discount</td>
                            <td class="right" style="color: #27ae60;">- PKR {{ number_format($order->loyalty_discount, 0) }}</td>
                        </tr>
                    @endif
                    @if($order->shipping_amount > 0)
                        <tr>
                            <td>Shipping{{ $order->shipping_method ? " ({$order->shipping_method})" : '' }}</td>
                            <td class="right">PKR {{ number_format($order->shipping_amount, 0) }}</td>
                        </tr>
                    @else
                        <tr>
                            <td>Shipping</td>
                            <td class="right" style="color: #27ae60;">FREE</td>
                        </tr>
                    @endif
                    @if($order->tax_amount > 0)
                        <tr>
                            <td>Tax</td>
                            <td class="right">PKR {{ number_format($order->tax_amount, 0) }}</td>
                        </tr>
                    @endif
                    <tr class="total-row">
                        <td>Grand Total</td>
                        <td class="right">PKR {{ number_format($order->total, 0) }}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <!-- Payment Info -->
    <div class="payment-box">
        <div class="label">Payment Information</div>
        <table style="border-collapse: collapse; font-size: 10.5px;">
            <tr>
                <td style="padding: 2px 14px 2px 0; font-weight: bold;">Method:</td>
                <td>{{ ucwords(str_replace('_', ' ', $order->payment_method ?? 'N/A')) }}</td>
            </tr>
            <tr>
                <td style="padding: 2px 14px 2px 0; font-weight: bold;">Status:</td>
                <td>{{ ucfirst($order->payment_status ?? 'pending') }}</td>
            </tr>
            @if($order->transaction_id)
                <tr>
                    <td style="padding: 2px 14px 2px 0; font-weight: bold;">Transaction ID:</td>
                    <td>{{ $order->transaction_id }}</td>
                </tr>
            @endif
        </table>
    </div>

    <!-- Customer Notes -->
    @if($order->customer_notes)
        <div class="notes-box">
            <div class="notes-label">Customer Notes</div>
            <p style="font-size: 10.5px; color: #555;">{{ $order->customer_notes }}</p>
        </div>
    @endif

    <!-- Tracking -->
    @if($order->tracking_number)
        <div class="notes-box">
            <div class="notes-label">Shipping &amp; Tracking</div>
            <table style="border-collapse: collapse; font-size: 10.5px;">
                @if($order->courier_name)
                    <tr>
                        <td style="padding: 2px 14px 2px 0; font-weight: bold;">Courier:</td>
                        <td>{{ $order->courier_name }}</td>
                    </tr>
                @endif
                <tr>
                    <td style="padding: 2px 14px 2px 0; font-weight: bold;">Tracking #:</td>
                    <td>{{ $order->tracking_number }}</td>
                </tr>
            </table>
        </div>
    @endif

    <!-- Footer -->
    <div class="footer">
        Fischer Pakistan &bull; Fatima Engineering Works &bull; Peco Road, Lahore, Pakistan<br>
        Thank you for your order!
    </div>

</body>
</html>
