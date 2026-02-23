<?php
namespace App\Http\Controllers\Api\Admin;
use App\Http\Controllers\Controller;
use App\Models\AbandonedCart;
use App\Models\Order;
use App\Services\MarketingIntegrationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MarketingController extends Controller {
    public function __construct(private MarketingIntegrationService $integrationService) {}

    public function integrations(): JsonResponse {
        return response()->json(["data" => $this->integrationService->getAll()]);
    }

    public function saveIntegration(Request $request): JsonResponse {
        $data = $request->validate([
            "platform" => "required|string|in:meta,google_analytics,google_ads,tiktok,snapchat,pinterest",
            "is_enabled" => "boolean",
            "config" => "array",
        ]);
        $integration = $this->integrationService->upsert($data["platform"], $data);
        return response()->json(["data" => $integration]);
    }

    public function dashboard(Request $request): JsonResponse {
        $from = $request->get("from", now()->subDays(30)->toDateString());
        $to = $request->get("to", now()->toDateString());
        $orders = Order::whereBetween("created_at", [$from . " 00:00:00", $to . " 23:59:59"])->where("status", "!=", "cancelled")->get();
        $revenue = $orders->sum("total");
        $orderCount = $orders->count();
        $aov = $orderCount > 0 ? $revenue / $orderCount : 0;
        $bySource = $orders->groupBy("utm_source")->map(fn($g) => ["source" => $g->first()->utm_source ?? "direct", "orders" => $g->count(), "revenue" => $g->sum("total")])->values();
        $totalAbandoned = AbandonedCart::whereBetween("created_at", [$from, $to])->count();
        $recovered = AbandonedCart::whereBetween("created_at", [$from, $to])->where("is_recovered", true)->count();
        return response()->json([
            "revenue" => $revenue,
            "orders" => $orderCount,
            "aov" => round($aov, 2),
            "abandoned_carts" => $totalAbandoned,
            "recovered_carts" => $recovered,
            "recovery_rate" => $totalAbandoned > 0 ? round(($recovered / $totalAbandoned) * 100, 1) : 0,
            "by_source" => $bySource,
        ]);
    }

    public function abandonedCarts(Request $request): JsonResponse {
        $carts = AbandonedCart::orderBy("last_activity_at", "desc")->paginate(20);
        return response()->json($carts);
    }

    public function resendReminder(AbandonedCart $cart): JsonResponse {
        $cart->update(["reminder_sent" => true, "reminder_sent_at" => now()]);
        return response()->json(["message" => "Reminder queued"]);
    }
}
