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
