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
        $apiKey        = Setting::get('payment.paymob_api_key') ?: config('services.paymob.api_key');
        $integrationId = (int) (Setting::get('payment.paymob_integration_id') ?: config('services.paymob.integration_id'));
        $iframeId      = Setting::get('payment.paymob_iframe_id') ?: config('services.paymob.iframe_id');

        $baseUrl     = 'https://pakistan.paymob.com/api';
        $amountCents = intval(round($order->total * 100));

        // ── Step 1: Authenticate ─────────────────────────────────────────────
        $authRes = Http::timeout(15)->post("{$baseUrl}/auth/tokens", ['api_key' => $apiKey]);

        if ($authRes->failed() || !$authRes->json('token')) {
            \Log::error('Paymob auth failed', [
                'status' => $authRes->status(),
                'body'   => substr($authRes->body(), 0, 500),
                'order'  => $order->order_number,
            ]);
            throw new \RuntimeException('Paymob authentication failed. Check your API Key in Payment Settings.');
        }

        $token = $authRes->json('token');

        // ── Step 2: Create Paymob Order ─────────────────────────────────────
        $orderRes = Http::timeout(15)->post("{$baseUrl}/ecommerce/orders", [
            'auth_token'        => $token,
            'delivery_needed'   => false,
            'amount_cents'      => $amountCents,
            'currency'          => 'PKR',
            'merchant_order_id' => $order->order_number,
            'items'             => [],
        ]);

        if ($orderRes->failed() || !$orderRes->json('id')) {
            \Log::error('Paymob order creation failed', [
                'status' => $orderRes->status(),
                'body'   => substr($orderRes->body(), 0, 500),
                'order'  => $order->order_number,
            ]);
            throw new \RuntimeException('Paymob order creation failed. Please try again.');
        }

        $paymobOrderId = $orderRes->json('id');

        // ── Step 3: Generate Payment Key ─────────────────────────────────────
        $keyRes = Http::timeout(15)->post("{$baseUrl}/acceptance/payment_keys", [
            'auth_token'     => $token,
            'amount_cents'   => $amountCents,
            'expiration'     => 3600,
            'order_id'       => $paymobOrderId,
            'billing_data'   => [
                'apartment'       => 'NA',
                'email'           => $order->shipping_email ?? 'customer@na.com',
                'floor'           => 'NA',
                'first_name'      => $order->shipping_first_name ?? 'Customer',
                'street'          => $order->shipping_address_line_1 ?? 'NA',
                'building'        => 'NA',
                'phone_number'    => $order->shipping_phone ?? '+92 300 0000000',
                'shipping_method' => 'NA',
                'postal_code'     => 'NA',
                'city'            => $order->shipping_city ?? 'Lahore',
                'country'         => 'PK',
                'last_name'       => $order->shipping_last_name ?? 'NA',
                'state'           => 'NA',
            ],
            'currency'       => 'PKR',
            'integration_id' => $integrationId,
        ]);

        if ($keyRes->failed() || !$keyRes->json('token')) {
            \Log::error('Paymob payment key failed', [
                'status' => $keyRes->status(),
                'body'   => substr($keyRes->body(), 0, 500),
                'order'  => $order->order_number,
            ]);
            throw new \RuntimeException('Paymob payment key generation failed. Please try again.');
        }

        $paymentKey = $keyRes->json('token');

        return "https://pakistan.paymob.com/api/acceptance/iframes/{$iframeId}?payment_token={$paymentKey}";
    }

    public function handleCallback(string $method, array $data, Order $order): array
    {
        return match ($method) {
            'jazzcash' => $this->handleJazzCashCallback($data, $order),
            'easypaisa' => $this->handleEasypaisaCallback($data, $order),
            'card'      => $this->handlePaymobCallback($data, $order),
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

    protected function handlePaymobCallback(array $data, Order $order): array
    {
        $hmacSecret   = Setting::get('payment.paymob_hmac_secret') ?: config('services.paymob.hmac_secret');
        $receivedHmac = $data['hmac'] ?? '';

        // ── HMAC-SHA512 Verification ─────────────────────────────────────────
        // Concatenate the values of specific fields in Paymob's documented order.
        // PHP converts dots to underscores in $_GET keys (source_data.pan → source_data_pan).
        $concatenated =
            ($data['amount_cents']            ?? '') .
            ($data['created_at']              ?? '') .
            ($data['currency']                ?? '') .
            ($data['error_occured']           ?? '') .
            ($data['has_parent_transaction']  ?? '') .
            ($data['id']                      ?? '') .
            ($data['integration_id']          ?? '') .
            ($data['is_3d_secure']            ?? '') .
            ($data['is_auth']                 ?? '') .
            ($data['is_capture']              ?? '') .
            ($data['is_refunded']             ?? '') .
            ($data['is_standalone_payment']   ?? '') .
            ($data['is_voided']               ?? '') .
            ($data['order']                   ?? '') .
            ($data['owner']                   ?? '') .
            ($data['pending']                 ?? '') .
            ($data['source_data_pan']         ?? '') .
            ($data['source_data_sub_type']    ?? '') .
            ($data['source_data_type']        ?? '') .
            ($data['success']                 ?? '');

        $expectedHmac = hash_hmac('sha512', $concatenated, $hmacSecret);

        if (!hash_equals($expectedHmac, strtolower($receivedHmac))) {
            \Log::warning('Paymob HMAC verification failed', [
                'order'    => $order->order_number,
                'expected' => $expectedHmac,
                'received' => $receivedHmac,
            ]);
            return ['success' => false, 'message' => 'Payment verification failed. Invalid signature.'];
        }

        // ── Check payment outcome ────────────────────────────────────────────
        $success = filter_var($data['success'] ?? 'false', FILTER_VALIDATE_BOOLEAN);

        if (!$success) {
            return ['success' => false, 'message' => 'Payment was not successful. Please try again.'];
        }

        $transactionId = (string) ($data['id'] ?? '');

        $order->markAsPaid($transactionId);
        $order->updateStatus('confirmed', 'Payment received via Credit/Debit Card (Paymob)');

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
