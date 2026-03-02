<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmed #{{ $order->order_number }}</title>
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
          <td bgcolor="#1d7dd7" style="background:#1d7dd7;padding:44px 40px 36px;text-align:center;">
            <img src="https://fischer.codeformulator.com/images/logo-email.png"
                 alt="Fischer Pakistan" width="210" height="auto"
                 style="display:block;margin:0 auto 28px;width:210px;max-width:100%;" />

            <p style="margin:0 0 12px;font-size:11px;color:rgba(255,255,255,0.55);letter-spacing:3px;
                       text-transform:uppercase;font-weight:600;">Order Confirmed</p>

            <h1 style="margin:0 0 12px;font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;
                        line-height:1.2;">Thank You, {{ $order->shipping_first_name }}!</h1>

            <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.7);line-height:1.6;">
              Order <strong style="color:#ffffff;">#{{ $order->order_number }}</strong>
              &nbsp;&middot;&nbsp;
              {{ $order->created_at->format('M j, Y \a\t g:i A') }}
            </p>

            <!-- payment method badge -->
            <p style="margin:16px 0 0;">
              <span style="display:inline-block;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.25);
                           border-radius:50px;padding:5px 16px;font-size:12px;color:rgba(255,255,255,0.85);font-weight:600;">
                {{ strtoupper(str_replace('_', ' ', $order->payment_method)) }}
              </span>
            </p>
          </td>
        </tr>

        <!-- ══ INTRO ════════════════════════════════════════════════════ -->
        <tr>
          <td style="padding:32px 40px 0;">
            <p style="margin:0;font-size:15px;color:#444444;line-height:1.75;">
              We've received your order and it's now being processed.
              You'll receive email updates as your order moves forward.
              Need help? Just reply to this email.
            </p>
          </td>
        </tr>

        <!-- ══ ORDER PROGRESS TRACKER ═══════════════════════════════════ -->
        @php
            $statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
            $labels   = ['Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
            $currentIdx = array_search($order->status, $statuses);
            if ($currentIdx === false) $currentIdx = 0;
        @endphp
        <tr>
          <td style="padding:32px 40px 0;">
            <p style="margin:0 0 20px;font-size:11px;font-weight:700;color:#1d7dd7;
                       text-transform:uppercase;letter-spacing:1.5px;">Order Progress</p>

            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                @foreach($statuses as $i => $st)
                {{-- Step cell --}}
                <td width="15%" style="text-align:center;vertical-align:top;">
                  {{-- Circle --}}
                  <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 8px;">
                    <tr>
                      <td width="34" height="34" align="center" valign="middle"
                          style="width:34px;height:34px;min-width:34px;border-radius:17px;
                                 background:{{ $i <= $currentIdx ? '#1d7dd7' : '#e8e8e8' }};
                                 color:{{ $i <= $currentIdx ? '#ffffff' : '#aaaaaa' }};
                                 font-size:13px;font-weight:700;text-align:center;line-height:34px;">
                        @if($i < $currentIdx)&#10003;@elseif($i === $currentIdx)&#10003;@else{{ $i + 1 }}@endif
                      </td>
                    </tr>
                  </table>
                  <p style="margin:0;font-size:10px;line-height:1.4;white-space:nowrap;
                             font-weight:{{ $i === $currentIdx ? '700' : '500' }};
                             color:{{ $i <= $currentIdx ? '#1d7dd7' : '#bbbbbb' }};">
                    {{ $labels[$i] }}
                  </p>
                </td>
                @if($i < count($statuses) - 1)
                {{-- Connector --}}
                <td width="6%" style="vertical-align:top;padding-top:17px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td height="2" bgcolor="{{ $i < $currentIdx ? '#1d7dd7' : '#e8e8e8' }}"
                          style="background:{{ $i < $currentIdx ? '#1d7dd7' : '#e8e8e8' }};
                                 height:2px;font-size:0;line-height:0;">&nbsp;</td>
                    </tr>
                  </table>
                </td>
                @endif
                @endforeach
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── divider ────────────────────────────────────────────────── -->
        <tr>
          <td style="padding:28px 40px 0;">
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
                       text-transform:uppercase;letter-spacing:1.5px;">Order Summary</p>

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
                  @if($item->variant_name)
                  <br><span style="font-size:12px;color:#888888;">{{ $item->variant_name }}</span>
                  @endif
                </td>
                <td style="padding:14px 10px;font-size:14px;color:#555555;text-align:center;
                            border-bottom:1px solid #f5f5f5;">&times;{{ $item->quantity }}</td>
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
                <td style="padding:5px 0;font-size:14px;color:#666666;">Discount</td>
                <td style="text-align:right;padding:5px 0;font-size:14px;color:#2a7a32;font-weight:600;white-space:nowrap;">
                  &minus;Rs.&nbsp;{{ number_format($order->discount_amount) }}
                </td>
              </tr>
              @endif
              <tr>
                <td style="padding:5px 0;font-size:14px;color:#666666;">Shipping</td>
                <td style="text-align:right;padding:5px 0;font-size:14px;color:#333333;white-space:nowrap;">
                  {{ $order->shipping_amount > 0 ? 'Rs. ' . number_format($order->shipping_amount) : 'Free' }}
                </td>
              </tr>
              <!-- total row -->
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
                <td style="padding:10px 0 0;font-size:17px;color:#111111;font-weight:800;">Order Total</td>
                <td style="text-align:right;padding:10px 0 0;font-size:22px;color:#1d7dd7;
                            font-weight:800;white-space:nowrap;">
                  Rs.&nbsp;{{ number_format($order->total) }}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── divider ────────────────────────────────────────────────── -->
        <tr>
          <td style="padding:28px 40px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td height="1" bgcolor="#f0f0f0" style="height:1px;font-size:0;line-height:0;">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ══ DELIVERY ADDRESS ════════════════════════════════════════ -->
        <tr>
          <td style="padding:24px 40px 0;">
            <p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#1d7dd7;
                       text-transform:uppercase;letter-spacing:1.5px;">Delivery Address</p>

            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td bgcolor="#f8f8f8" style="background:#f8f8f8;border:1px solid #eeeeee;
                            border-radius:8px;padding:18px 20px;">
                  <p style="margin:0;font-size:14px;color:#333333;line-height:2.0;">
                    <strong style="font-size:15px;color:#111111;font-weight:700;">
                      {{ $order->shipping_first_name }} {{ $order->shipping_last_name }}
                    </strong><br>
                    {{ $order->shipping_address_line_1 }}<br>
                    @if($order->shipping_address_line_2){{ $order->shipping_address_line_2 }}<br>@endif
                    {{ $order->shipping_city }}{{ $order->shipping_state ? ', ' . $order->shipping_state : '' }}<br>
                    <span style="color:#888888;">{{ $order->shipping_phone }}</span>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ══ TRACK ORDER CTA ══════════════════════════════════════════ -->
        <tr>
          <td style="padding:32px 40px 0;text-align:center;">
            <a href="https://fischer.codeformulator.com/track-order"
               style="display:inline-block;background:#1d7dd7;color:#ffffff;padding:15px 52px;
                      border-radius:6px;text-decoration:none;font-size:14px;font-weight:700;
                      letter-spacing:0.5px;">
              Track Your Order &rarr;
            </a>
          </td>
        </tr>

        <!-- ══ SUPPORT ══════════════════════════════════════════════════ -->
        <tr>
          <td style="padding:24px 40px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td bgcolor="#f0f7ff" style="background:#f0f7ff;border:1px solid #c2ddf5;
                            border-radius:8px;padding:18px 20px;text-align:center;">
                  <p style="margin:0 0 4px;font-size:13px;color:#666666;">
                    Questions about your order? Simply reply to this email.
                  </p>
                  <a href="mailto:fischer.few@gmail.com"
                     style="font-size:14px;font-weight:700;color:#1d7dd7;text-decoration:none;">
                    fischer.few@gmail.com
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ══ FOOTER ════════════════════════════════════════════════════ -->
        <tr>
          <td style="padding:32px 40px 40px;text-align:center;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td height="1" bgcolor="#f0f0f0" style="height:1px;font-size:0;line-height:0;margin-bottom:24px;">&nbsp;</td>
              </tr>
            </table>
            <p style="margin:20px 0 6px;font-size:12px;color:#aaaaaa;">
              &copy; {{ date('Y') }} Fischer Pakistan. All rights reserved.
            </p>
            <p style="margin:0;font-size:11px;color:#cccccc;line-height:1.6;">
              You received this email because you placed an order at
              <a href="https://fischer.codeformulator.com" style="color:#cccccc;text-decoration:none;">fischer.codeformulator.com</a>
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
