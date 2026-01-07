<?php

namespace App\Services;

use App\Models\Order;
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
        $config = config('services.jazzcash');

        $txnDateTime = now()->format('YmdHis');
        $txnExpiryDateTime = now()->addHours(24)->format('YmdHis');

        $data = [
            'pp_Version' => '1.1',
            'pp_TxnType' => 'MWALLET',
            'pp_Language' => 'EN',
            'pp_MerchantID' => $config['merchant_id'],
            'pp_SubMerchantID' => '',
            'pp_Password' => $config['password'],
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
        $hashString = $config['integrity_salt'] . '&';
        $sortedData = collect($data)->filter()->sortKeys()->all();
        $hashString .= implode('&', $sortedData);
        $data['pp_SecureHash'] = hash_hmac('sha256', $hashString, $config['integrity_salt']);

        // In production, this would redirect to JazzCash
        if ($config['sandbox']) {
            return 'https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform?' . http_build_query($data);
        }

        return 'https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform?' . http_build_query($data);
    }

    protected function createEasypaisaPayment(Order $order): string
    {
        $config = config('services.easypaisa');

        $orderId = $order->order_number;
        $amount = number_format($order->total, 2, '.', '');
        $storeId = $config['store_id'];
        $postBackUrl = url("/api/payments/easypaisa/callback?order_id={$order->id}");

        // Generate hash
        $hashKey = $config['hash_key'];
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

        $endpoint = $config['sandbox']
            ? 'https://easypay.easypaisa.com.pk/easypay/Index.jsf'
            : 'https://easypay.easypaisa.com.pk/easypay/Index.jsf';

        return $endpoint . '?' . http_build_query($data);
    }

    protected function createCardPayment(Order $order): string
    {
        // This would integrate with a card payment gateway like Stripe or local gateway
        // For now, returning a placeholder
        return url("/checkout/card-payment?order_id={$order->id}");
    }

    public function handleCallback(string $method, array $data, Order $order): array
    {
        return match ($method) {
            'jazzcash' => $this->handleJazzCashCallback($data, $order),
            'easypaisa' => $this->handleEasypaisaCallback($data, $order),
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
