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
        $apiKey  = Setting::get('payment.safepay_api_key') ?: config('services.safepay.api_key');
        $sandbox = (bool) (Setting::get('payment.safepay_sandbox') ?? config('services.safepay.sandbox', true));

        $baseUrl      = $sandbox ? 'https://sandbox.api.getsafepay.com' : 'https://api.getsafepay.com';
        $checkoutBase = $sandbox ? 'https://sandbox.api.getsafepay.com' : 'https://getsafepay.com';
        $amountPaisa  = intval(round($order->total * 100));

        // ── Step 1: Init order and get tracker token ─────────────────────────
        $res = Http::timeout(15)->post("{$baseUrl}/order/v1/init", [
            'client'      => $apiKey,
            'amount'      => $amountPaisa,
            'currency'    => 'PKR',
            'environment' => $sandbox ? 'sandbox' : 'production',
        ]);

        if ($res->failed() || !$res->json('data.token')) {
            \Log::error('Safepay init failed', [
                'status' => $res->status(),
                'body'   => substr($res->body(), 0, 500),
                'order'  => $order->order_number,
            ]);
            throw new \RuntimeException('Safepay payment initialization failed. Check your API Key in Payment Settings.');
        }

        $tracker = $res->json('data.token');

        // ── Step 2: Build checkout redirect URL ──────────────────────────────
        return $checkoutBase . '/checkout/pay?' . http_build_query([
            'env'          => $sandbox ? 'sandbox' : 'production',
            'beacon'       => $tracker,
            'source'       => 'custom',
            'order_id'     => $order->order_number,
            'redirect_url' => url('/api/payments/card/callback'),
            'cancel_url'   => config('app.frontend_url', config('app.url')) . '/checkout',
            'webhooks'     => 'true',
        ]);
    }

    public function handleCallback(string $method, array $data, Order $order): array
    {
        return match ($method) {
            'jazzcash'  => $this->handleJazzCashCallback($data, $order),
            'easypaisa' => $this->handleEasypaisaCallback($data, $order),
            'card'      => $this->handleSafepayCallback($data, $order),
            default     => ['success' => false, 'message' => 'Unknown payment method'],
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

    protected function handleSafepayCallback(array $data, Order $order): array
    {
        $v1Secret    = Setting::get('payment.safepay_v1_secret') ?: config('services.safepay.v1_secret');
        $tracker     = $data['tracker'] ?? '';
        $receivedSig = $data['sig'] ?? '';

        if (empty($tracker) || empty($receivedSig)) {
            \Log::warning('Safepay callback missing tracker or sig', ['order' => $order->order_number]);
            return ['success' => false, 'message' => 'Invalid payment callback. Missing verification fields.'];
        }

        // ── HMAC-SHA256 verification (sign = hmac_sha256(tracker, v1_secret)) ─
        $expectedSig = hash_hmac('sha256', $tracker, $v1Secret);

        if (!hash_equals($expectedSig, $receivedSig)) {
            \Log::warning('Safepay signature verification failed', [
                'order'    => $order->order_number,
                'expected' => $expectedSig,
                'received' => $receivedSig,
            ]);
            return ['success' => false, 'message' => 'Payment verification failed. Invalid signature.'];
        }

        $reference = $data['reference'] ?? $tracker;

        $order->markAsPaid($reference);
        $order->updateStatus('confirmed', 'Payment received via Credit/Debit Card (Safepay)');

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

    public function handleSafepayWebhook(string $rawBody, string $signature): array
    {
        $webhookSecret = Setting::get('payment.safepay_webhook_secret') ?: config('services.safepay.webhook_secret');
        $expectedSig   = hash_hmac('sha512', $rawBody, $webhookSecret);

        if (!hash_equals($expectedSig, $signature)) {
            \Log::warning('Safepay webhook signature mismatch');
            return ['success' => false, 'message' => 'Invalid webhook signature'];
        }

        $payload     = json_decode($rawBody, true) ?? [];
        $state       = $payload['data']['state'] ?? '';
        $orderNumber = $payload['data']['order_id'] ?? '';

        if (!$orderNumber) {
            return ['success' => false, 'message' => 'Missing order_id in webhook payload'];
        }

        $order = Order::where('order_number', $orderNumber)->first();
        if (!$order) {
            return ['success' => false, 'message' => 'Order not found'];
        }

        if ($state === 'paid' && $order->payment_status !== 'paid') {
            $reference = $payload['data']['reference'] ?? '';
            $order->markAsPaid($reference ?: $orderNumber);
            $order->updateStatus('confirmed', 'Payment confirmed via Safepay webhook');

            if ($order->user_id && $order->loyalty_points_earned > 0) {
                $order->user->addLoyaltyPoints(
                    $order->loyalty_points_earned,
                    "Earned from order #{$order->order_number}",
                    Order::class,
                    $order->id
                );
            }
        }

        return ['success' => true, 'message' => 'Webhook processed'];
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
