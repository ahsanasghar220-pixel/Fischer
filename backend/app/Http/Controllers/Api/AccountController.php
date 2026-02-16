<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class AccountController extends Controller
{
    public function dashboard(Request $request)
    {
        $user = $request->user();

        $stats = [
            'total_orders' => $user->orders()->count(),
            'pending_orders' => $user->orders()->where('status', 'pending')->count(),
            'wishlist_count' => $user->wishlist()->count(),
            'loyalty_points' => $user->loyalty_points,
        ];

        $recentOrders = $user->orders()
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'status' => $order->status,
                    'total' => $order->total,
                    'created_at' => $order->created_at,
                ];
            });

        return $this->success([
            'stats' => $stats,
            'recent_orders' => $recentOrders,
        ]);
    }

    public function loyaltyPoints(Request $request)
    {
        $user = $request->user();

        $transactions = $user->loyaltyTransactions()
            ->orderByDesc('created_at')
            ->limit(20)
            ->get()
            ->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'points' => $transaction->points,
                    'type' => $transaction->type,
                    'description' => $transaction->description,
                    'created_at' => $transaction->created_at,
                ];
            });

        // Calculate totals
        $totalEarned = $user->loyaltyTransactions()
            ->where('points', '>', 0)
            ->sum('points');

        $totalRedeemed = abs($user->loyaltyTransactions()
            ->where('points', '<', 0)
            ->sum('points'));

        return $this->success([
            'balance' => $user->loyalty_points,
            'total_earned' => $totalEarned,
            'total_redeemed' => $totalRedeemed,
            'points_value' => (int) Setting::get('loyalty.point_value', 1),
            'points_per_amount' => (int) Setting::get('loyalty.points_per_amount', 100),
            'review_bonus' => (int) Setting::get('loyalty.review_bonus', 10),
            'referral_bonus' => (int) Setting::get('loyalty.referral_bonus', 50),
            'birthday_bonus' => (int) Setting::get('loyalty.birthday_bonus', 100),
            'enabled' => (bool) Setting::get('loyalty.enabled', true),
            'transactions' => $transactions,
        ]);
    }

    public function serviceRequests(Request $request)
    {
        $user = $request->user();

        $requests = $user->serviceRequests()
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($request) {
                return [
                    'id' => $request->id,
                    'ticket_number' => $request->ticket_number,
                    'product_name' => $request->product_name,
                    'product_model' => $request->model_number,
                    'serial_number' => $request->serial_number,
                    'issue_type' => $request->service_type,
                    'issue_description' => $request->problem_description,
                    'status' => $request->status,
                    'priority' => $request->priority,
                    'created_at' => $request->created_at,
                    'updated_at' => $request->updated_at,
                    'resolved_at' => $request->resolved_at,
                ];
            });

        return $this->success($requests);
    }
}
