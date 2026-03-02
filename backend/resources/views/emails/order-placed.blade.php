<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Order #{{ $order->order_number }}</title>
</head>
<body style="margin:0;padding:0;background:#efefef;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#efefef">
  <tr>
    <td align="center" style="padding:40px 16px;">

      <!-- ░░ CARD ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ -->
      <table width="600" cellpadding="0" cellspacing="0" border="0"
             style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;
                    box-shadow:0 4px 24px rgba(0,0,0,0.07);">

        <!-- ══ HEADER ══════════════════════════════════════════════════ -->
        <tr>
          <td bgcolor="#111111" style="background:#111111;padding:36px 40px 30px;text-align:center;">
            <img src="https://fischer.codeformulator.com/images/logo-light.png"
                 alt="Fischer Pakistan" width="180" height="auto"
                 style="display:block;margin:0 auto 24px;width:180px;max-width:100%;" />

            <!-- alert badge -->
            <table cellpadding="0" cellspacing="0" border="0" align="center">
              <tr>
                <td bgcolor="#1d7dd7" style="background:#1d7dd7;border-radius:50px;
                            padding:8px 22px;text-align:center;">
                  <span style="font-size:12px;color:#ffffff;font-weight:700;
                               text-transform:uppercase;letter-spacing:2px;">
                    &#9679; New Order Received
                  </span>
                </td>
              </tr>
            </table>

            <h1 style="margin:16px 0 6px;font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.3px;">
              #{{ $order->order_number }}
            </h1>
            <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.5);">
              {{ $order->created_at->format('l, M j, Y \a\t g:i A') }}
            </p>
          </td>
        </tr>

        <!-- ══ QUICK STATS ROW ════════════════════════════════════════ -->
        <tr>
          <td bgcolor="#1d7dd7" style="background:#1d7dd7;padding:0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="33%" style="padding:18px 0;text-align:center;
                            border-right:1px solid rgba(255,255,255,0.15);">
                  <p style="margin:0 0 3px;font-size:11px;color:rgba(255,255,255,0.6);
                             text-transform:uppercase;letter-spacing:1px;font-weight:600;">Order Total</p>
                  <p style="margin:0;font-size:20px;font-weight:800;color:#ffffff;">
                    Rs.&nbsp;{{ number_format($order->total) }}
                  </p>
                </td>
                <td width="33%" style="padding:18px 0;text-align:center;
                            border-right:1px solid rgba(255,255,255,0.15);">
                  <p style="margin:0 0 3px;font-size:11px;color:rgba(255,255,255,0.6);
                             text-transform:uppercase;letter-spacing:1px;font-weight:600;">Payment</p>
                  <p style="margin:0;font-size:14px;font-weight:700;color:#ffffff;">
                    {{ strtoupper(str_replace('_', ' ', $order->payment_method)) }}
                  </p>
                  <p style="margin:2px 0 0;font-size:11px;color:{{ $order->payment_status === 'paid' ? '#90ee90' : '#ffd580' }};">
                    {{ ucfirst($order->payment_status) }}
                  </p>
                </td>
                <td width="33%" style="padding:18px 0;text-align:center;">
                  <p style="margin:0 0 3px;font-size:11px;color:rgba(255,255,255,0.6);
                             text-transform:uppercase;letter-spacing:1px;font-weight:600;">Items</p>
                  <p style="margin:0;font-size:20px;font-weight:800;color:#ffffff;">
                    {{ $order->items->sum('quantity') }}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ══ CUSTOMER DETAILS ════════════════════════════════════════ -->
        <tr>
          <td style="padding:32px 40px 0;">
            <p style="margin:0 0 16px;font-size:11px;font-weight:700;color:#1d7dd7;
                       text-transform:uppercase;letter-spacing:1.5px;">Customer Details</p>

            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="border:1px solid #eeeeee;border-radius:8px;overflow:hidden;">
              <tr>
                <td width="50%" style="padding:14px 18px;border-bottom:1px solid #f5f5f5;
                            border-right:1px solid #f5f5f5;">
                  <p style="margin:0 0 3px;font-size:11px;color:#999999;text-transform:uppercase;
                             letter-spacing:0.5px;font-weight:600;">Name</p>
                  <p style="margin:0;font-size:14px;color:#111111;font-weight:700;">
                    {{ $order->shipping_first_name }} {{ $order->shipping_last_name }}
                  </p>
                </td>
                <td width="50%" style="padding:14px 18px;border-bottom:1px solid #f5f5f5;">
                  <p style="margin:0 0 3px;font-size:11px;color:#999999;text-transform:uppercase;
                             letter-spacing:0.5px;font-weight:600;">Phone</p>
                  <p style="margin:0;font-size:14px;color:#111111;font-weight:700;">
                    {{ $order->shipping_phone }}
                  </p>
                </td>
              </tr>
              @if($order->shipping_email)
              <tr>
                <td colspan="2" style="padding:14px 18px;border-bottom:1px solid #f5f5f5;">
                  <p style="margin:0 0 3px;font-size:11px;color:#999999;text-transform:uppercase;
                             letter-spacing:0.5px;font-weight:600;">Email</p>
                  <p style="margin:0;font-size:14px;color:#111111;font-weight:600;">
                    {{ $order->shipping_email }}
                  </p>
                </td>
              </tr>
              @endif
              <tr>
                <td colspan="2" style="padding:14px 18px;">
                  <p style="margin:0 0 3px;font-size:11px;color:#999999;text-transform:uppercase;
                             letter-spacing:0.5px;font-weight:600;">Delivery Address</p>
                  <p style="margin:0;font-size:14px;color:#333333;line-height:1.7;">
                    {{ $order->shipping_address_line_1 }}
                    @if($order->shipping_address_line_2), {{ $order->shipping_address_line_2 }}@endif,
                    {{ $order->shipping_city }}{{ $order->shipping_state ? ', ' . $order->shipping_state : '' }}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── divider ────────────────────────────────────────────────── -->
        <tr>
          <td style="padding:24px 40px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td height="1" bgcolor="#f0f0f0" style="height:1px;font-size:0;line-height:0;">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ══ ORDER ITEMS ══════════════════════════════════════════════ -->
        <tr>
          <td style="padding:24px 40px 0;">
            <p style="margin:0 0 16px;font-size:11px;font-weight:700;color:#1d7dd7;
                       text-transform:uppercase;letter-spacing:1.5px;">Order Items</p>

            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="border:1px solid #eeeeee;border-radius:8px;overflow:hidden;">
              <!-- header -->
              <tr bgcolor="#f8f8f8" style="background:#f8f8f8;">
                <td style="padding:11px 16px;font-size:11px;font-weight:700;color:#888888;
                            text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #eeeeee;">
                  Product
                </td>
                <td style="padding:11px 10px;font-size:11px;font-weight:700;color:#888888;
                            text-transform:uppercase;letter-spacing:0.5px;text-align:center;
                            border-bottom:1px solid #eeeeee;white-space:nowrap;">
                  Qty
                </td>
                <td style="padding:11px 12px;font-size:11px;font-weight:700;color:#888888;
                            text-transform:uppercase;letter-spacing:0.5px;text-align:right;
                            border-bottom:1px solid #eeeeee;white-space:nowrap;">
                  Unit Price
                </td>
                <td style="padding:11px 16px;font-size:11px;font-weight:700;color:#888888;
                            text-transform:uppercase;letter-spacing:0.5px;text-align:right;
                            border-bottom:1px solid #eeeeee;white-space:nowrap;">
                  Total
                </td>
              </tr>
              @foreach($order->items as $item)
              <tr>
                <td style="padding:14px 16px;font-size:14px;color:#222222;border-bottom:1px solid #f5f5f5;">
                  <strong style="font-weight:600;color:#111111;">{{ $item->product_name }}</strong>
                  @if($item->product_sku)
                  <br><span style="font-size:11px;color:#aaaaaa;font-weight:400;">SKU: {{ $item->product_sku }}</span>
                  @endif
                  @if($item->variant_name)
                  <br><span style="font-size:12px;color:#888888;">{{ $item->variant_name }}</span>
                  @endif
                </td>
                <td style="padding:14px 10px;font-size:14px;color:#555555;text-align:center;
                            border-bottom:1px solid #f5f5f5;">&times;{{ $item->quantity }}</td>
                <td style="padding:14px 12px;font-size:13px;color:#666666;text-align:right;
                            border-bottom:1px solid #f5f5f5;white-space:nowrap;">
                  Rs.&nbsp;{{ number_format($item->unit_price) }}
                </td>
                <td style="padding:14px 16px;font-size:14px;color:#111111;font-weight:600;
                            text-align:right;border-bottom:1px solid #f5f5f5;white-space:nowrap;">
                  Rs.&nbsp;{{ number_format($item->total_price) }}
                </td>
              </tr>
              @endforeach
            </table>
          </td>
        </tr>

        <!-- ══ TOTALS ════════════════════════════════════════════════════ -->
        <tr>
          <td style="padding:16px 40px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding:5px 0;font-size:14px;color:#666666;">Subtotal</td>
                <td style="text-align:right;padding:5px 0;font-size:14px;color:#333333;white-space:nowrap;">
                  Rs.&nbsp;{{ number_format($order->subtotal) }}
                </td>
              </tr>
              @if($order->discount_amount > 0)
              <tr>
                <td style="padding:5px 0;font-size:14px;color:#666666;">
                  Discount{{ $order->coupon_code ? ' (' . $order->coupon_code . ')' : '' }}
                </td>
                <td style="text-align:right;padding:5px 0;font-size:14px;color:#2a7a32;font-weight:600;white-space:nowrap;">
                  &minus;Rs.&nbsp;{{ number_format($order->discount_amount) }}
                </td>
              </tr>
              @endif
              <tr>
                <td style="padding:5px 0;font-size:14px;color:#666666;">
                  Shipping — {{ $order->shipping_method }}
                </td>
                <td style="text-align:right;padding:5px 0;font-size:14px;color:#333333;white-space:nowrap;">
                  {{ $order->shipping_amount > 0 ? 'Rs. ' . number_format($order->shipping_amount) : 'Free' }}
                </td>
              </tr>
              @if($order->loyalty_discount > 0)
              <tr>
                <td style="padding:5px 0;font-size:14px;color:#666666;">Loyalty Points</td>
                <td style="text-align:right;padding:5px 0;font-size:14px;color:#2a7a32;font-weight:600;white-space:nowrap;">
                  &minus;Rs.&nbsp;{{ number_format($order->loyalty_discount) }}
                </td>
              </tr>
              @endif
              <tr>
                <td colspan="2" style="padding:4px 0;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td height="2" bgcolor="#1d7dd7"
                          style="height:2px;font-size:0;line-height:0;background:#1d7dd7;">&nbsp;</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0 0;font-size:17px;color:#111111;font-weight:800;">Grand Total</td>
                <td style="text-align:right;padding:10px 0 0;font-size:22px;color:#1d7dd7;
                            font-weight:800;white-space:nowrap;">
                  Rs.&nbsp;{{ number_format($order->total) }}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        @if($order->customer_notes)
        <!-- ══ NOTES ════════════════════════════════════════════════════ -->
        <tr>
          <td style="padding:24px 40px 0;">
            <p style="margin:0 0 10px;font-size:11px;font-weight:700;color:#1d7dd7;
                       text-transform:uppercase;letter-spacing:1.5px;">Customer Notes</p>
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td bgcolor="#fffdf0" style="background:#fffdf0;border:1px solid #ede8c0;
                            border-radius:8px;padding:14px 18px;">
                  <p style="margin:0;font-size:14px;color:#555555;line-height:1.7;font-style:italic;">
                    &ldquo;{{ $order->customer_notes }}&rdquo;
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        @endif

        <!-- ══ VIEW IN ADMIN CTA ════════════════════════════════════════ -->
        <tr>
          <td style="padding:32px 40px 0;text-align:center;">
            <a href="https://fischer.codeformulator.com/admin/orders"
               style="display:inline-block;background:#111111;color:#ffffff;padding:14px 44px;
                      border-radius:6px;text-decoration:none;font-size:14px;font-weight:700;
                      letter-spacing:0.5px;">
              View in Admin Panel &rarr;
            </a>
          </td>
        </tr>

        <!-- ══ FOOTER ════════════════════════════════════════════════════ -->
        <tr>
          <td style="padding:28px 40px 36px;text-align:center;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td height="1" bgcolor="#f0f0f0" style="height:1px;font-size:0;line-height:0;">&nbsp;</td>
              </tr>
            </table>
            <p style="margin:20px 0 4px;font-size:12px;color:#aaaaaa;">
              This is an automated notification from Fischer Pakistan.
            </p>
            <p style="margin:0;font-size:11px;color:#cccccc;">
              &copy; {{ date('Y') }} Fischer Pakistan. All rights reserved.
            </p>
          </td>
        </tr>

      </table>
      <!-- /card -->

    </td>
  </tr>
</table>

</body>
</html>
