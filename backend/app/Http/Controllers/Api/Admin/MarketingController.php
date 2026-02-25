<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AbandonedCart;
use App\Models\MarketingConversionLog;
use App\Models\Order;
use App\Models\VisitorEvent;
use App\Models\VisitorSession;
use App\Services\MarketingIntegrationService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MarketingController extends Controller
{
    public function __construct(private MarketingIntegrationService $integrationService) {}

    // ──────────────────────────────────────────────────────────────
    //  Integration endpoints (unchanged)
    // ──────────────────────────────────────────────────────────────

    public function integrations(): JsonResponse
    {
        try {
            return response()->json(['data' => $this->integrationService->getAll()]);
        } catch (\Throwable $e) {
            return response()->json(['data' => []]);
        }
    }

    public function saveIntegration(Request $request): JsonResponse
    {
        $data = $request->validate([
            'platform'   => 'required|string|in:meta,google_analytics,google_ads,tiktok,snapchat,pinterest',
            'is_enabled' => 'boolean',
            'config'     => 'array',
        ]);

        $integration = $this->integrationService->upsert($data['platform'], $data);

        return response()->json(['data' => $integration]);
    }

    // ──────────────────────────────────────────────────────────────
    //  Dashboard  —  comprehensive marketing analytics
    // ──────────────────────────────────────────────────────────────

    public function dashboard(Request $request): JsonResponse
    {
        try {
        // --- Resolve date ranges -------------------------------------------
        $from = Carbon::parse($request->get('from', now()->subDays(30)->toDateString()))->startOfDay();
        $to   = Carbon::parse($request->get('to', now()->toDateString()))->endOfDay();

        $periodDays   = $from->diffInDays($to) + 1;
        $prevFrom     = (clone $from)->subDays($periodDays)->startOfDay();
        $prevTo       = (clone $from)->subSecond()->endOfDay(); // 1 second before current period

        $currentRange = [$from, $to];
        $prevRange    = [$prevFrom, $prevTo];

        // --- KPIs -----------------------------------------------------------
        $kpis = $this->buildKpis($currentRange, $prevRange);

        // --- Daily chart data -----------------------------------------------
        $chartData = $this->buildChartData($currentRange);

        // --- Traffic by source (utm_source from visitor_sessions) -----------
        $bySource = $this->buildBySource($currentRange);

        // --- Conversion funnel (from visitor_events) ------------------------
        $funnel = $this->buildFunnel($currentRange);

        // --- Top campaigns --------------------------------------------------
        $topCampaigns = $this->buildTopCampaigns($currentRange);

        // --- Abandoned carts summary ----------------------------------------
        $abandonedSummary = $this->buildAbandonedCartsSummary($currentRange);

        // --- Device breakdown -----------------------------------------------
        $deviceBreakdown = $this->buildDeviceBreakdown($currentRange);

        return response()->json([
            'kpis'            => $kpis,
            'chart_data'      => $chartData,
            'by_source'       => $bySource,
            'funnel'          => $funnel,
            'top_campaigns'   => $topCampaigns,
            'abandoned_carts' => $abandonedSummary,
            'device_breakdown' => $deviceBreakdown,
        ]);
        } catch (\Throwable $e) {
            return response()->json([
                'kpis'             => [],
                'chart_data'       => [],
                'by_source'        => [],
                'funnel'           => ['visitors' => 0, 'product_views' => 0, 'add_to_cart' => 0, 'checkout' => 0, 'purchase' => 0],
                'top_campaigns'    => [],
                'abandoned_carts'  => ['total' => 0, 'recovered' => 0, 'recovery_rate' => 0, 'lost_revenue' => 0, 'recovered_revenue' => 0],
                'device_breakdown' => [],
            ]);
        }
    }

    // ──────────────────────────────────────────────────────────────
    //  Conversions  —  paginated marketing_conversion_logs
    // ──────────────────────────────────────────────────────────────

    public function conversions(Request $request): JsonResponse
    {
        try {
        $query = MarketingConversionLog::query()->orderByDesc('created_at');

        if ($platform = $request->get('platform')) {
            $query->where('platform', $platform);
        }

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        if ($eventType = $request->get('event_type')) {
            $query->where('event_type', $eventType);
        }

        if ($from = $request->get('from')) {
            $query->where('created_at', '>=', Carbon::parse($from)->startOfDay());
        }

        if ($to = $request->get('to')) {
            $query->where('created_at', '<=', Carbon::parse($to)->endOfDay());
        }

        $perPage = min((int) $request->get('per_page', 20), 100);
        $logs    = $query->paginate($perPage);

        // Summary stats for the filtered set
        $summaryQuery = MarketingConversionLog::query();

        if ($platform) $summaryQuery->where('platform', $platform);
        if ($status) $summaryQuery->where('status', $status);
        if ($eventType) $summaryQuery->where('event_type', $eventType);
        if ($from) $summaryQuery->where('created_at', '>=', Carbon::parse($from)->startOfDay());
        if ($to) $summaryQuery->where('created_at', '<=', Carbon::parse($to)->endOfDay());

        $summary = [
            'total'      => (clone $summaryQuery)->count(),
            'successful' => (clone $summaryQuery)->where('status', 'success')->count(),
            'failed'     => (clone $summaryQuery)->where('status', 'failed')->count(),
            'pending'    => (clone $summaryQuery)->where('status', 'pending')->count(),
            'by_platform' => DB::table('marketing_conversion_logs')
                ->when($from, fn ($q) => $q->where('created_at', '>=', Carbon::parse($from)->startOfDay()))
                ->when($to, fn ($q) => $q->where('created_at', '<=', Carbon::parse($to)->endOfDay()))
                ->select('platform', DB::raw('COUNT(*) as total'), DB::raw("SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful"))
                ->groupBy('platform')
                ->orderByDesc('total')
                ->get(),
        ];

        return response()->json([
            'summary' => $summary,
            'data'    => $logs,
        ]);
        } catch (\Throwable $e) {
            return response()->json([
                'summary' => ['total' => 0, 'successful' => 0, 'failed' => 0, 'pending' => 0, 'by_platform' => []],
                'data'    => ['data' => [], 'total' => 0, 'per_page' => 20, 'current_page' => 1, 'last_page' => 1],
            ]);
        }
    }

    // ──────────────────────────────────────────────────────────────
    //  Abandoned carts  —  improved with filters + summary
    // ──────────────────────────────────────────────────────────────

    public function abandonedCarts(Request $request): JsonResponse
    {
        try {
        $query = AbandonedCart::query()->orderByDesc('last_activity_at');

        // Filters
        if ($request->has('is_recovered')) {
            $query->where('is_recovered', filter_var($request->get('is_recovered'), FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->has('reminder_sent')) {
            $query->where('reminder_sent', filter_var($request->get('reminder_sent'), FILTER_VALIDATE_BOOLEAN));
        }

        if ($from = $request->get('from')) {
            $query->where('created_at', '>=', Carbon::parse($from)->startOfDay());
        }

        if ($to = $request->get('to')) {
            $query->where('created_at', '<=', Carbon::parse($to)->endOfDay());
        }

        if ($minTotal = $request->get('min_total')) {
            $query->where('cart_total', '>=', (float) $minTotal);
        }

        $perPage = min((int) $request->get('per_page', 20), 100);
        $carts   = $query->paginate($perPage);

        // Summary stats (always across full dataset, not just the current page)
        $summary = DB::table('abandoned_carts')
            ->select([
                DB::raw('COUNT(*) as total'),
                DB::raw('SUM(CASE WHEN is_recovered = 1 THEN 1 ELSE 0 END) as recovered'),
                DB::raw('SUM(CASE WHEN reminder_sent = 1 THEN 1 ELSE 0 END) as reminders_sent'),
                DB::raw('SUM(cart_total) as total_value'),
                DB::raw('SUM(CASE WHEN is_recovered = 1 THEN cart_total ELSE 0 END) as recovered_value'),
                DB::raw('SUM(CASE WHEN is_recovered = 0 THEN cart_total ELSE 0 END) as lost_value'),
                DB::raw('ROUND(AVG(cart_total), 2) as avg_cart_value'),
            ])
            ->first();

        if ($summary) {
            $summary->recovery_rate = $summary->total > 0
                ? round(($summary->recovered / $summary->total) * 100, 1)
                : 0;
        }

        return response()->json([
            'summary' => $summary,
            'data'    => $carts,
        ]);
        } catch (\Throwable $e) {
            return response()->json([
                'summary' => ['total' => 0, 'recovered' => 0, 'reminders_sent' => 0, 'total_value' => 0, 'recovered_value' => 0, 'lost_value' => 0, 'avg_cart_value' => 0, 'recovery_rate' => 0],
                'data'    => ['data' => [], 'total' => 0, 'per_page' => 20, 'current_page' => 1, 'last_page' => 1],
            ]);
        }
    }

    public function resendReminder(AbandonedCart $cart): JsonResponse
    {
        $cart->update(['reminder_sent' => true, 'reminder_sent_at' => now()]);

        return response()->json(['message' => 'Reminder queued']);
    }

    // ══════════════════════════════════════════════════════════════
    //  Private helpers
    // ══════════════════════════════════════════════════════════════

    /**
     * Build KPI metrics with current vs previous period comparison.
     */
    private function buildKpis(array $currentRange, array $prevRange): array
    {
        // Current period order stats
        $currentOrders = DB::table('orders')
            ->whereBetween('created_at', $currentRange)
            ->where('status', '!=', 'cancelled')
            ->select([
                DB::raw('COALESCE(SUM(total), 0) as revenue'),
                DB::raw('COUNT(*) as order_count'),
            ])
            ->first();

        // Previous period order stats
        $prevOrders = DB::table('orders')
            ->whereBetween('created_at', $prevRange)
            ->where('status', '!=', 'cancelled')
            ->select([
                DB::raw('COALESCE(SUM(total), 0) as revenue'),
                DB::raw('COUNT(*) as order_count'),
            ])
            ->first();

        // Visitor counts (non-bot sessions)
        $currentVisitors = DB::table('visitor_sessions')
            ->whereBetween('started_at', $currentRange)
            ->where('is_bot', false)
            ->count();

        $prevVisitors = DB::table('visitor_sessions')
            ->whereBetween('started_at', $prevRange)
            ->where('is_bot', false)
            ->count();

        // Derive values
        $curRevenue    = (float) $currentOrders->revenue;
        $prevRevenue   = (float) $prevOrders->revenue;
        $curOrderCount = (int) $currentOrders->order_count;
        $prevOrderCount = (int) $prevOrders->order_count;
        $curAov        = $curOrderCount > 0 ? round($curRevenue / $curOrderCount, 2) : 0;
        $prevAov       = $prevOrderCount > 0 ? round($prevRevenue / $prevOrderCount, 2) : 0;
        $curConversion = $currentVisitors > 0 ? round(($curOrderCount / $currentVisitors) * 100, 2) : 0;
        $prevConversion = $prevVisitors > 0 ? round(($prevOrderCount / $prevVisitors) * 100, 2) : 0;

        return [
            'revenue' => [
                'value'    => $curRevenue,
                'previous' => $prevRevenue,
                'change'   => $this->percentChange($prevRevenue, $curRevenue),
            ],
            'orders' => [
                'value'    => $curOrderCount,
                'previous' => $prevOrderCount,
                'change'   => $this->percentChange($prevOrderCount, $curOrderCount),
            ],
            'aov' => [
                'value'    => $curAov,
                'previous' => $prevAov,
                'change'   => $this->percentChange($prevAov, $curAov),
            ],
            'conversion_rate' => [
                'value'    => $curConversion,
                'previous' => $prevConversion,
                'change'   => $this->percentChange($prevConversion, $curConversion),
            ],
            'visitors' => [
                'value'    => $currentVisitors,
                'previous' => $prevVisitors,
                'change'   => $this->percentChange($prevVisitors, $currentVisitors),
            ],
        ];
    }

    /**
     * Build daily time-series data for the chart (revenue, orders, visitors per day).
     */
    private function buildChartData(array $range): array
    {
        // Daily orders & revenue
        $dailyOrders = DB::table('orders')
            ->whereBetween('created_at', $range)
            ->where('status', '!=', 'cancelled')
            ->select([
                DB::raw('DATE(created_at) as date'),
                DB::raw('COALESCE(SUM(total), 0) as revenue'),
                DB::raw('COUNT(*) as orders'),
            ])
            ->groupBy(DB::raw('DATE(created_at)'))
            ->get()
            ->keyBy('date');

        // Daily visitors
        $dailyVisitors = DB::table('visitor_sessions')
            ->whereBetween('started_at', $range)
            ->where('is_bot', false)
            ->select([
                DB::raw('DATE(started_at) as date'),
                DB::raw('COUNT(*) as visitors'),
            ])
            ->groupBy(DB::raw('DATE(started_at)'))
            ->get()
            ->keyBy('date');

        // Merge into a continuous date series
        $chart = [];
        $cursor = Carbon::parse($range[0])->startOfDay();
        $end    = Carbon::parse($range[1])->startOfDay();

        while ($cursor->lte($end)) {
            $dateKey = $cursor->toDateString();
            $chart[] = [
                'date'     => $cursor->format('M d'),
                'revenue'  => (float) ($dailyOrders[$dateKey]->revenue ?? 0),
                'orders'   => (int) ($dailyOrders[$dateKey]->orders ?? 0),
                'visitors' => (int) ($dailyVisitors[$dateKey]->visitors ?? 0),
            ];
            $cursor->addDay();
        }

        return $chart;
    }

    /**
     * Traffic breakdown by utm_source using visitor_sessions + orders.
     */
    private function buildBySource(array $range): array
    {
        // Visitors by source
        $visitorsBySource = DB::table('visitor_sessions')
            ->whereBetween('started_at', $range)
            ->where('is_bot', false)
            ->select([
                DB::raw("COALESCE(NULLIF(utm_source, ''), 'direct') as source"),
                DB::raw('COUNT(*) as visitors'),
            ])
            ->groupBy(DB::raw("COALESCE(NULLIF(utm_source, ''), 'direct')"))
            ->get()
            ->keyBy('source');

        // Orders & revenue by source
        $ordersBySource = DB::table('orders')
            ->whereBetween('created_at', $range)
            ->where('status', '!=', 'cancelled')
            ->select([
                DB::raw("COALESCE(NULLIF(utm_source, ''), 'direct') as source"),
                DB::raw('COUNT(*) as orders'),
                DB::raw('COALESCE(SUM(total), 0) as revenue'),
            ])
            ->groupBy(DB::raw("COALESCE(NULLIF(utm_source, ''), 'direct')"))
            ->get()
            ->keyBy('source');

        // Combine all unique sources
        $allSources = $visitorsBySource->keys()->merge($ordersBySource->keys())->unique();

        return $allSources->map(function ($source) use ($visitorsBySource, $ordersBySource) {
            $visitors = (int) ($visitorsBySource[$source]->visitors ?? 0);
            $orders   = (int) ($ordersBySource[$source]->orders ?? 0);
            $revenue  = (float) ($ordersBySource[$source]->revenue ?? 0);

            return [
                'source'          => $source,
                'visitors'        => $visitors,
                'orders'          => $orders,
                'revenue'         => $revenue,
                'conversion_rate' => $visitors > 0 ? round(($orders / $visitors) * 100, 2) : 0,
            ];
        })
        ->sortByDesc('revenue')
        ->values()
        ->toArray();
    }

    /**
     * Build the marketing funnel from visitor_events distinct sessions.
     */
    private function buildFunnel(array $range): array
    {
        $visitors = DB::table('visitor_sessions')
            ->whereBetween('started_at', $range)
            ->where('is_bot', false)
            ->count();

        $funnelSteps = DB::table('visitor_events')
            ->whereBetween('visitor_events.created_at', $range)
            ->join('visitor_sessions', 'visitor_events.visitor_session_id', '=', 'visitor_sessions.id')
            ->where('visitor_sessions.is_bot', false)
            ->select([
                DB::raw("SUM(CASE WHEN visitor_events.event_type = 'product_view' THEN 1 ELSE 0 END) as product_views"),
                DB::raw("COUNT(DISTINCT CASE WHEN visitor_events.event_type = 'add_to_cart' THEN visitor_events.visitor_session_id END) as add_to_cart"),
                DB::raw("COUNT(DISTINCT CASE WHEN visitor_events.event_type = 'checkout_start' THEN visitor_events.visitor_session_id END) as checkout"),
                DB::raw("COUNT(DISTINCT CASE WHEN visitor_events.event_type = 'purchase' THEN visitor_events.visitor_session_id END) as purchase"),
            ])
            ->first();

        return [
            'visitors'      => $visitors,
            'product_views' => (int) ($funnelSteps->product_views ?? 0),
            'add_to_cart'   => (int) ($funnelSteps->add_to_cart ?? 0),
            'checkout'      => (int) ($funnelSteps->checkout ?? 0),
            'purchase'      => (int) ($funnelSteps->purchase ?? 0),
        ];
    }

    /**
     * Top-performing UTM campaigns by revenue.
     */
    private function buildTopCampaigns(array $range): array
    {
        // From visitor_sessions we get campaign + source + visitor counts
        $campaignVisitors = DB::table('visitor_sessions')
            ->whereBetween('started_at', $range)
            ->where('is_bot', false)
            ->whereNotNull('utm_campaign')
            ->where('utm_campaign', '!=', '')
            ->select([
                'utm_campaign',
                'utm_source',
                DB::raw('COUNT(*) as visitors'),
            ])
            ->groupBy('utm_campaign', 'utm_source')
            ->get()
            ->keyBy(fn ($row) => $row->utm_campaign . '|' . $row->utm_source);

        // From orders we get campaign + source + order/revenue counts
        $campaignOrders = DB::table('orders')
            ->whereBetween('created_at', $range)
            ->where('status', '!=', 'cancelled')
            ->whereNotNull('utm_campaign')
            ->where('utm_campaign', '!=', '')
            ->select([
                'utm_campaign',
                'utm_source',
                DB::raw('COUNT(*) as orders'),
                DB::raw('COALESCE(SUM(total), 0) as revenue'),
            ])
            ->groupBy('utm_campaign', 'utm_source')
            ->orderByDesc(DB::raw('SUM(total)'))
            ->limit(20)
            ->get();

        return $campaignOrders->map(function ($row) use ($campaignVisitors) {
            $key      = $row->utm_campaign . '|' . $row->utm_source;
            $visitors = (int) ($campaignVisitors[$key]->visitors ?? 0);
            $orders   = (int) $row->orders;

            return [
                'campaign'        => $row->utm_campaign,
                'source'          => $row->utm_source ?? 'direct',
                'visitors'        => $visitors,
                'orders'          => $orders,
                'revenue'         => (float) $row->revenue,
                'conversion_rate' => $visitors > 0 ? round(($orders / $visitors) * 100, 2) : 0,
            ];
        })->values()->toArray();
    }

    /**
     * Abandoned carts summary for the dashboard widget.
     */
    private function buildAbandonedCartsSummary(array $range): array
    {
        $stats = DB::table('abandoned_carts')
            ->whereBetween('created_at', $range)
            ->select([
                DB::raw('COUNT(*) as total'),
                DB::raw('SUM(CASE WHEN is_recovered = 1 THEN 1 ELSE 0 END) as recovered'),
                DB::raw('COALESCE(SUM(CASE WHEN is_recovered = 0 THEN cart_total ELSE 0 END), 0) as lost_revenue'),
                DB::raw('COALESCE(SUM(CASE WHEN is_recovered = 1 THEN cart_total ELSE 0 END), 0) as recovered_revenue'),
            ])
            ->first();

        $total     = (int) $stats->total;
        $recovered = (int) $stats->recovered;

        return [
            'total'             => $total,
            'recovered'         => $recovered,
            'recovery_rate'     => $total > 0 ? round(($recovered / $total) * 100, 1) : 0,
            'lost_revenue'      => (float) $stats->lost_revenue,
            'recovered_revenue' => (float) $stats->recovered_revenue,
        ];
    }

    /**
     * Device-type breakdown (mobile / desktop / tablet) from visitor_sessions.
     */
    private function buildDeviceBreakdown(array $range): array
    {
        // Visitors by device
        $visitorsByDevice = DB::table('visitor_sessions')
            ->whereBetween('started_at', $range)
            ->where('is_bot', false)
            ->select([
                DB::raw("COALESCE(NULLIF(device_type, ''), 'unknown') as device"),
                DB::raw('COUNT(*) as visitors'),
            ])
            ->groupBy(DB::raw("COALESCE(NULLIF(device_type, ''), 'unknown')"))
            ->get()
            ->keyBy('device');

        // Orders & revenue by device — join through visitor_sessions → orders
        // We match on utm_source + session timing, but a more reliable approach
        // is to join visitor_sessions (converted) with orders via the user_id or
        // use the visitor_events purchase events that link session → order.
        $ordersByDevice = DB::table('visitor_events')
            ->join('visitor_sessions', 'visitor_events.visitor_session_id', '=', 'visitor_sessions.id')
            ->join('orders', 'visitor_events.order_id', '=', 'orders.id')
            ->where('visitor_events.event_type', 'purchase')
            ->whereBetween('visitor_events.created_at', $range)
            ->where('visitor_sessions.is_bot', false)
            ->where('orders.status', '!=', 'cancelled')
            ->select([
                DB::raw("COALESCE(NULLIF(visitor_sessions.device_type, ''), 'unknown') as device"),
                DB::raw('COUNT(DISTINCT orders.id) as orders'),
                DB::raw('COALESCE(SUM(orders.total), 0) as revenue'),
            ])
            ->groupBy(DB::raw("COALESCE(NULLIF(visitor_sessions.device_type, ''), 'unknown')"))
            ->get()
            ->keyBy('device');

        $allDevices = $visitorsByDevice->keys()->merge($ordersByDevice->keys())->unique();

        return $allDevices->map(function ($device) use ($visitorsByDevice, $ordersByDevice) {
            return [
                'device'   => $device,
                'visitors' => (int) ($visitorsByDevice[$device]->visitors ?? 0),
                'orders'   => (int) ($ordersByDevice[$device]->orders ?? 0),
                'revenue'  => (float) ($ordersByDevice[$device]->revenue ?? 0),
            ];
        })
        ->sortByDesc('visitors')
        ->values()
        ->toArray();
    }

    /**
     * Percentage change between two values, rounded to 1 decimal.
     */
    private function percentChange(float $previous, float $current): float
    {
        if ($previous == 0) {
            return $current > 0 ? 100.0 : 0.0;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }
}
