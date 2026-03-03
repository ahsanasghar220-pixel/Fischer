<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\PaymentService;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    protected PaymentService $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    public function jazzcashCallback(Request $request)
    {
        $orderId = $request->query('order_id');
        $order = Order::findOrFail($orderId);

        $result = $this->paymentService->handleCallback('jazzcash', $request->all(), $order);

        // Redirect to frontend with result
        $frontendUrl = config('app.frontend_url', config('app.url'));

        if ($result['success']) {
            return redirect("{$frontendUrl}/order-success/{$order->order_number}");
        }

        return redirect("{$frontendUrl}/order-failed/{$order->order_number}?error=" . urlencode($result['message']));
    }

    public function easypaisaCallback(Request $request)
    {
        $orderId = $request->query('order_id');
        $order = Order::findOrFail($orderId);

        $result = $this->paymentService->handleCallback('easypaisa', $request->all(), $order);

        $frontendUrl = config('app.frontend_url', config('app.url'));

        if ($result['success']) {
            return redirect("{$frontendUrl}/order-success/{$order->order_number}");
        }

        return redirect("{$frontendUrl}/order-failed/{$order->order_number}?error=" . urlencode($result['message']));
    }

    public function cardCallback(Request $request)
    {
        $frontendUrl = config('app.frontend_url', config('app.url'));

        // Safepay POSTs with order_id (= our order_number)
        $orderNumber = $request->input('order_id');
        if (!$orderNumber) {
            return redirect("{$frontendUrl}/order-failed?error=" . urlencode('Invalid payment callback. Order reference missing.'));
        }

        $order = Order::where('order_number', $orderNumber)->first();
        if (!$order) {
            return redirect("{$frontendUrl}/order-failed?error=" . urlencode('Order not found.'));
        }

        $result = $this->paymentService->handleCallback('card', $request->all(), $order);

        if ($result['success']) {
            return redirect("{$frontendUrl}/order-success/{$order->order_number}");
        }

        return redirect("{$frontendUrl}/order-failed/{$order->order_number}?error=" . urlencode($result['message']));
    }

    public function safepayWebhook(Request $request)
    {
        $signature = $request->header('X-SFPY-SIGNATURE', '');
        $rawBody   = $request->getContent();

        $result = $this->paymentService->handleSafepayWebhook($rawBody, $signature);

        return response()->json($result, $result['success'] ? 200 : 400);
    }

    public function verifyBankTransfer(Request $request, Order $order)
    {
        $this->authorize('update', $order);

        $validated = $request->validate([
            'transaction_id' => 'required|string',
            'receipt_image' => 'nullable|image|max:5120',
        ]);

        $order->update([
            'transaction_id' => $validated['transaction_id'],
            'admin_notes' => 'Bank transfer verification pending',
        ]);

        if ($request->hasFile('receipt_image')) {
            $path = $request->file('receipt_image')->store('payment-receipts', 'public');
            $order->update(['admin_notes' => "Bank transfer receipt: {$path}"]);
        }

        return $this->success(null, 'Bank transfer details submitted. Awaiting verification.');
    }
}
