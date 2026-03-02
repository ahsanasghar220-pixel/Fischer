<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Setting;
use Illuminate\Support\Facades\Http;

class PaymentService
{
    public function createPayment(Order $order, string $method): string
    {
        return match ($method) {
            'jazzcash' => $this->createJazzCashPayment($order),
            'easypaisa' => $this->createEasypaisaPayment($order),
            'card' => $this->createCardPayment($order),
            default => throw new \InvalidArgumentException("Unsupported payment method: {$method}"),
        };
    }

    protected function createJazzCashPayment(Order $order): string
    {
        // Read from DB settings, fall back to env config
        $merchantId    = Setting::get('payment.jazzcash_merchant_id') ?: config('services.jazzcash.merchant_id');
        $password      = Setting::get('payment.jazzcash_password') ?: config('services.jazzcash.password');
        $integritySalt = Setting::get('payment.jazzcash_integrity_salt') ?: config('services.jazzcash.integrity_salt');
        $sandbox       = (bool) (Setting::get('payment.jazzcash_sandbox') ?? config('services.jazzcash.sandbox', true));

        $txnDateTime = now()->format('YmdHis');
        $txnExpiryDateTime = now()->addHours(24)->format('YmdHis');

        $data = [
            'pp_Version' => '1.1',
            'pp_TxnType' => 'MWALLET',
            'pp_Language' => 'EN',
            'pp_MerchantID' => $merchantId,
            'pp_SubMerchantID' => '',
            'pp_Password' => $password,
            'pp_BankID' => '',
            'pp_ProductID' => '',
            'pp_TxnRefNo' => 'T' . $txnDateTime . rand(1000, 9999),
            'pp_Amount' => intval($order->total * 100),
            'pp_TxnCurrency' => 'PKR',
            'pp_TxnDateTime' => $txnDateTime,
            'pp_BillReference' => $order->order_number,
            'pp_Description' => "Fischer Order #{$order->order_number}",
            'pp_TxnExpiryDateTime' => $txnExpiryDateTime,
            'pp_ReturnURL' => url("/api/payments/jazzcash/callback?order_id={$order->id}"),
            'ppmpf_1' => '',
            'ppmpf_2' => '',
            'ppmpf_3' => '',
            'ppmpf_4' => '',
            'ppmpf_5' => '',
        ];

        // Generate hash
        $hashString = $integritySalt . '&';
        $sortedData = collect($data)->filter()->sortKeys()->all();
        $hashString .= implode('&', $sortedData);
        $data['pp_SecureHash'] = hash_hmac('sha256', $hashString, $integritySalt);

        if ($sandbox) {
            return 'https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform?' . http_build_query($data);
        }

        return 'https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform?' . http_build_query($data);
    }

    protected function createEasypaisaPayment(Order $order): string
    {
        // Read from DB settings, fall back to env config
        $storeId = Setting::get('payment.easypaisa_store_id') ?: config('services.easypaisa.store_id');
        $hashKey = Setting::get('payment.easypaisa_hash_key') ?: config('services.easypaisa.hash_key');
        $sandbox = (bool) (Setting::get('payment.easypaisa_sandbox') ?? config('services.easypaisa.sandbox', true));

        $orderId = $order->order_number;
        $amount = number_format($order->total, 2, '.', '');
        $postBackUrl = url("/api/payments/easypaisa/callback?order_id={$order->id}");

        // Generate hash
        $hashString = "amount={$amount}&orderRefNum={$orderId}&postBackURL={$postBackUrl}&storeId={$storeId}";
        $hash = hash_hmac('sha256', $hashString, $hashKey);

        $data = [
            'storeId' => $storeId,
            'amount' => $amount,
            'postBackURL' => $postBackUrl,
            'orderRefNum' => $orderId,
            'autoRedirect' => '1',
            'paymentMethod' => 'OTC_PAYMENT_METHOD',
            'emailAddr' => $order->getCustomerEmail() ?? '',
            'mobileNum' => $order->getCustomerPhone() ?? '',
            'merchantHashedReq' => $hash,
        ];

        $endpoint = $sandbox
            ? 'https://easypay.easypaisa.com.pk/easypay/Index.jsf'
            : 'https://easypay.easypaisa.com.pk/easypay/Index.jsf';

        return $endpoint . '?' . http_build_query($data);
    }

    protected function createCardPayment(Order $order): string
    {
        // Read from DB settings, fall back to env config
        $secretKey = Setting::get('payment.checkout_secret_key') ?: config('services.checkout.secret_key');
        $sandbox   = (bool) (Setting::get('payment.checkout_sandbox') ?? config('services.checkout.sandbox', true));

        $baseUrl = $sandbox
            ? 'https://api.sandbox.checkout.com'
            : 'https://api.checkout.com';

        $response = Http::timeout(15)
            ->withToken($secretKey)
            ->post("{$baseUrl}/hosted-payments", [
                'amount'      => intval(round($order->total * 100)),
                'currency'    => 'PKR',
                'reference'   => $order->order_number,
                'description' => "Fischer Order #{$order->order_number}",
                'customer'    => [
                    'email' => $order->shipping_email ?? '',
                    'name'  => trim(($order->shipping_first_name ?? '') . ' ' . ($order->shipping_last_name ?? '')),
                ],
                'billing' => [
                    'address' => [
                        'address_line1' => $order->shipping_address_line_1 ?? '',
                        'city'          => $order->shipping_city ?? '',
                        'country'       => 'PK',
                    ],
                ],
                'success_url' => url("/api/payments/card/callback/{$order->id}?status=success"),
                'cancel_url'  => url("/api/payments/card/callback/{$order->id}?status=cancel"),
                'failure_url' => url("/api/payments/card/callback/{$order->id}?status=failure"),
            ]);

        $redirectUrl = $response->json('_links.redirect.href');

        if ($response->failed() || !$redirectUrl) {
            $errorBody = $response->body();
            \Log::error('Checkout.com payment initiation failed', [
                'status' => $response->status(),
                'body'   => substr($errorBody, 0, 500),
                'order'  => $order->order_number,
            ]);
            throw new \RuntimeException(
                'Checkout.com payment initiation failed (HTTP ' . $response->status() . '). Check that your secret key (sk_sbox_...) is correct in Payment Settings.'
            );
        }

        return $redirectUrl;
    }

    public function handleCallback(string $method, array $data, Order $order): array
    {
        return match ($method) {
            'jazzcash' => $this->handleJazzCashCallback($data, $order),
            'easypaisa' => $this->handleEasypaisaCallback($data, $order),
            'card'      => $this->handleCheckoutComCallback($data, $order),
            default => ['success' => false, 'message' => 'Unknown payment method'],
        };
    }

    protected function handleJazzCashCallback(array $data, Order $order): array
    {
        $responseCode = $data['pp_ResponseCode'] ?? '';

        if ($responseCode === '000') {
            $order->markAsPaid($data['pp_TxnRefNo'] ?? null);
            $order->updateStatus('confirmed', 'Payment received via JazzCash');

            // Award loyalty points
            if ($order->user_id && $order->loyalty_points_earned > 0) {
                $order->user->addLoyaltyPoints(
                    $order->loyalty_points_earned,
                    "Earned from order #{$order->order_number}",
                    Order::class,
                    $order->id
                );
            }

            return ['success' => true, 'message' => 'Payment successful'];
        }

        return [
            'success' => false,
            'message' => $data['pp_ResponseMessage'] ?? 'Payment failed',
        ];
    }

    protected function handleEasypaisaCallback(array $data, Order $order): array
    {
        $responseCode = $data['status'] ?? '';

        if (strtoupper($responseCode) === 'SUCCESS' || $responseCode === '0000') {
            $order->markAsPaid($data['transactionId'] ?? null);
            $order->updateStatus('confirmed', 'Payment received via Easypaisa');

            // Award loyalty points
            if ($order->user_id && $order->loyalty_points_earned > 0) {
                $order->user->addLoyaltyPoints(
                    $order->loyalty_points_earned,
                    "Earned from order #{$order->order_number}",
                    Order::class,
                    $order->id
                );
            }

            return ['success' => true, 'message' => 'Payment successful'];
        }

        return [
            'success' => false,
            'message' => $data['desc'] ?? 'Payment failed',
        ];
    }

    protected function handleCheckoutComCallback(array $data, Order $order): array
    {
        $status = $data['status'] ?? '';

        if ($status !== 'success') {
            return [
                'success' => false,
                'message' => $status === 'cancel' ? 'Payment was cancelled.' : 'Payment failed.',
            ];
        }

        // Server-side verification — use cko-session-id from redirect URL
        $sessionId = $data['cko-session-id'] ?? '';
        if (!$sessionId) {
            return ['success' => false, 'message' => 'Payment verification failed. Missing session.'];
        }

        // Read from DB settings, fall back to env config
        $secretKey = Setting::get('payment.checkout_secret_key') ?: config('services.checkout.secret_key');
        $sandbox   = (bool) (Setting::get('payment.checkout_sandbox') ?? config('services.checkout.sandbox', true));
        $baseUrl = $sandbox
            ? 'https://api.sandbox.checkout.com'
            : 'https://api.checkout.com';

        $response = Http::timeout(15)
            ->withToken($secretKey)
            ->get("{$baseUrl}/payments/{$sessionId}");

        $paymentStatus = $response->json('status');
        $reference     = $response->json('reference');

        // Verify the reference matches our order
        if ($reference !== $order->order_number) {
            return ['success' => false, 'message' => 'Payment verification failed. Order mismatch.'];
        }

        if (in_array($paymentStatus, ['Captured', 'Authorized', 'Paid'])) {
            $order->markAsPaid($response->json('id'));
            $order->updateStatus('confirmed', 'Payment received via Credit/Debit Card (Checkout.com)');

            if ($order->user_id && $order->loyalty_points_earned > 0) {
                $order->user->addLoyaltyPoints(
                    $order->loyalty_points_earned,
                    "Earned from order #{$order->order_number}",
                    Order::class,
                    $order->id
                );
            }

            return ['success' => true, 'message' => 'Card payment successful.'];
        }

        return [
            'success' => false,
            'message' => 'Payment verification failed. Please contact support.',
        ];
    }

    public function refund(Order $order, float $amount = null): array
    {
        $amount = $amount ?? $order->total;

        // Implementation depends on the payment gateway
        // For COD orders, just update the status

        if ($order->payment_method === 'cod') {
            $order->update([
                'payment_status' => 'refunded',
                'status' => 'refunded',
            ]);

            return ['success' => true, 'message' => 'Refund processed'];
        }

        // For online payments, call the respective gateway's refund API
        // This is a placeholder implementation

        return ['success' => false, 'message' => 'Refund not implemented for this payment method'];
    }
}
