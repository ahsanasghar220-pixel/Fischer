<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\VisitorSession;
use App\Models\VisitorEvent;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class RealTimeAnalyticsController extends Controller
{
    /**
     * Check if analytics tables exist
     */
    protected function tablesExist(): bool
    {
        return Schema::hasTable('visitor_sessions') && Schema::hasTable('visitor_events');
    }

    /**
     * Get empty response when tables don't exist
     */
    protected function emptyOverview()
    {
        return $this->success([
            'active_visitors' => 0,
            'cart_summary' => [
                'empty' => 0,
                'has_items' => 0,
                'checkout_started' => 0,
                'converted' => 0,
                'total_cart_value' => 0,
                'avg_cart_value' => 0,
            ],
            'today' => [
                'page_views' => 0,
                'product_views' => 0,
                'add_to_cart' => 0,
                'conversions' => Order::whereDate('created_at', Carbon::today())->count(),
                'revenue' => Order::whereDate('created_at', Carbon::today())->sum('total'),
            ],
            'message' => 'Analytics tables not yet created. Run migrations to enable full tracking.',
        ]);
    }

    /**
     * Get real-time overview stats
     */
    public function overview()
    {
        try {
            // Check if tables exist
            if (!$this->tablesExist()) {
                return $this->emptyOverview();
            }

            $activeVisitors = VisitorSession::getActiveCount();
            $cartSummary = VisitorSession::getCartSummary();
            $todayStats = VisitorEvent::getTodayStats();

            // Get today's conversions
            $conversionsToday = Order::whereDate('created_at', Carbon::today())->count();
            $revenueToday = Order::whereDate('created_at', Carbon::today())->sum('total');

            return $this->success([
                'active_visitors' => $activeVisitors,
                'cart_summary' => $cartSummary,
                'today' => [
                    'page_views' => $todayStats['page_views'],
                    'product_views' => $todayStats['product_views'],
                    'add_to_cart' => $todayStats['add_to_cart'],
                    'conversions' => $conversionsToday,
                    'revenue' => $revenueToday,
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('Real-time analytics error: ' . $e->getMessage());
            return $this->emptyOverview();
        }
    }

    /**
     * Get live activity feed
     */
    public function activityFeed(Request $request)
    {
        try {
            if (!$this->tablesExist()) {
                return $this->success([
                    'activities' => [],
                    'updated_at' => Carbon::now()->toISOString(),
                    'message' => 'Analytics tables not yet created.',
                ]);
            }

            $limit = min($request->input('limit', 20), 50);
            $activities = VisitorEvent::getActivityFeed($limit);

            return $this->success([
                'activities' => $activities,
                'updated_at' => Carbon::now()->toISOString(),
            ]);
        } catch (\Exception $e) {
            \Log::error('Activity feed error: ' . $e->getMessage());
            return $this->success([
                'activities' => [],
                'updated_at' => Carbon::now()->toISOString(),
            ]);
        }
    }

    /**
     * Get geographic distribution of visitors
     */
    public function geographic()
    {
        try {
            if (!$this->tablesExist()) {
                return $this->success([
                    'by_country' => [],
                    'locations' => [],
                    'message' => 'Analytics tables not yet created.',
                ]);
            }

            $byCountry = VisitorSession::getByCountry();

            // Get visitor locations for map
            $locations = VisitorSession::active()
                ->notBot()
                ->whereNotNull('latitude')
                ->whereNotNull('longitude')
                ->select(['city', 'country', 'country_code', 'latitude', 'longitude'])
                ->limit(100)
                ->get()
                ->toArray();

            return $this->success([
                'by_country' => $byCountry,
                'locations' => $locations,
            ]);
        } catch (\Exception $e) {
            \Log::error('Geographic analytics error: ' . $e->getMessage());
            return $this->success([
                'by_country' => [],
                'locations' => [],
            ]);
        }
    }

    /**
     * Get traffic sources breakdown
     */
    public function trafficSources()
    {
        try {
            if (!$this->tablesExist()) {
                return $this->success([
                    'sources' => [
                        ['source' => 'direct', 'count' => 0, 'percentage' => 0],
                        ['source' => 'organic', 'count' => 0, 'percentage' => 0],
                        ['source' => 'social', 'count' => 0, 'percentage' => 0],
                        ['source' => 'paid', 'count' => 0, 'percentage' => 0],
                        ['source' => 'referral', 'count' => 0, 'percentage' => 0],
                        ['source' => 'email', 'count' => 0, 'percentage' => 0],
                    ],
                    'total' => 0,
                    'message' => 'Analytics tables not yet created.',
                ]);
            }

            $sources = VisitorSession::getByTrafficSource();

            // Calculate percentages
            $total = array_sum($sources);
            $sourcesWithPercentage = [];

            foreach ($sources as $source => $count) {
                $sourcesWithPercentage[] = [
                    'source' => $source,
                    'count' => $count,
                    'percentage' => $total > 0 ? round(($count / $total) * 100, 1) : 0,
                ];
            }

            // Sort by count descending
            usort($sourcesWithPercentage, fn($a, $b) => $b['count'] - $a['count']);

            return $this->success([
                'sources' => $sourcesWithPercentage,
                'total' => $total,
            ]);
        } catch (\Exception $e) {
            \Log::error('Traffic sources error: ' . $e->getMessage());
            return $this->success([
                'sources' => [],
                'total' => 0,
            ]);
        }
    }

    /**
     * Get conversion funnel data
     */
    public function conversionFunnel()
    {
        try {
            if (!$this->tablesExist()) {
                return $this->success([
                    'funnel' => [
                        ['step' => 'Visitors', 'count' => 0, 'rate' => 100],
                        ['step' => 'Product Views', 'count' => 0, 'rate' => 0],
                        ['step' => 'Add to Cart', 'count' => 0, 'rate' => 0],
                        ['step' => 'Checkout Started', 'count' => 0, 'rate' => 0],
                        ['step' => 'Purchases', 'count' => 0, 'rate' => 0],
                    ],
                    'conversion_rate' => 0,
                    'message' => 'Analytics tables not yet created.',
                ]);
            }

            $funnel = VisitorEvent::getConversionFunnel();

            // Calculate conversion rates between steps
            $funnelWithRates = [
                [
                    'step' => 'Visitors',
                    'count' => $funnel['visitors'],
                    'rate' => 100,
                ],
                [
                    'step' => 'Product Views',
                    'count' => $funnel['product_views'],
                    'rate' => $funnel['visitors'] > 0
                        ? round(($funnel['product_views'] / $funnel['visitors']) * 100, 1)
                        : 0,
                ],
                [
                    'step' => 'Add to Cart',
                    'count' => $funnel['add_to_cart'],
                    'rate' => $funnel['visitors'] > 0
                        ? round(($funnel['add_to_cart'] / $funnel['visitors']) * 100, 1)
                        : 0,
                ],
                [
                    'step' => 'Checkout Started',
                    'count' => $funnel['checkout_started'],
                    'rate' => $funnel['visitors'] > 0
                        ? round(($funnel['checkout_started'] / $funnel['visitors']) * 100, 1)
                        : 0,
                ],
                [
                    'step' => 'Purchases',
                    'count' => $funnel['purchases'],
                    'rate' => $funnel['visitors'] > 0
                        ? round(($funnel['purchases'] / $funnel['visitors']) * 100, 1)
                        : 0,
                ],
            ];

            // Calculate overall conversion rate
            $conversionRate = $funnel['visitors'] > 0
                ? round(($funnel['purchases'] / $funnel['visitors']) * 100, 2)
                : 0;

            return $this->success([
                'funnel' => $funnelWithRates,
                'conversion_rate' => $conversionRate,
            ]);
        } catch (\Exception $e) {
            \Log::error('Conversion funnel error: ' . $e->getMessage());
            return $this->success([
                'funnel' => [],
                'conversion_rate' => 0,
            ]);
        }
    }

    /**
     * Get active sessions with details
     */
    public function activeSessions(Request $request)
    {
        try {
            if (!$this->tablesExist()) {
                return $this->success([
                    'data' => [],
                    'meta' => [
                        'current_page' => 1,
                        'last_page' => 1,
                        'per_page' => 20,
                        'total' => 0,
                    ],
                    'message' => 'Analytics tables not yet created.',
                ]);
            }

            $perPage = min($request->input('per_page', 20), 50);

            $sessions = VisitorSession::active()
                ->notBot()
                ->with(['user:id,name,email'])
                ->orderByDesc('last_activity_at')
                ->paginate($perPage);

            $sessions->getCollection()->transform(function ($session) {
                return [
                    'id' => $session->id,
                    'user' => $session->user ? [
                        'id' => $session->user->id,
                        'name' => $session->user->name,
                        'email' => $session->user->email,
                    ] : null,
                    'location' => [
                        'city' => $session->city,
                        'country' => $session->country,
                        'country_code' => $session->country_code,
                    ],
                    'device' => [
                        'type' => $session->device_type,
                        'browser' => $session->browser,
                        'os' => $session->os,
                    ],
                    'traffic_source' => $session->getTrafficSource(),
                    'current_page' => $session->current_page,
                    'page_views' => $session->page_views,
                    'cart' => [
                        'status' => $session->cart_status,
                        'items' => $session->cart_item_count,
                        'value' => $session->cart_value,
                    ],
                    'duration' => $session->getFormattedDuration(),
                    'last_activity' => $session->last_activity_at->diffForHumans(),
                ];
            });

            return $this->paginated($sessions);
        } catch (\Exception $e) {
            \Log::error('Active sessions error: ' . $e->getMessage());
            return $this->success([
                'data' => [],
                'meta' => [
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => 20,
                    'total' => 0,
                ],
            ]);
        }
    }

    /**
     * Get cart analytics
     */
    public function cartAnalytics()
    {
        try {
            if (!$this->tablesExist()) {
                return $this->success([
                    'summary' => [
                        'empty' => 0,
                        'has_items' => 0,
                        'checkout_started' => 0,
                        'converted' => 0,
                        'total_cart_value' => 0,
                        'avg_cart_value' => 0,
                    ],
                    'abandoned_carts' => 0,
                    'abandonment_rate' => 0,
                    'message' => 'Analytics tables not yet created.',
                ]);
            }

            $cartSummary = VisitorSession::getCartSummary();

            // Get abandoned carts (has items but last activity > 1 hour ago)
            $abandonedCarts = VisitorSession::where('cart_status', 'has_items')
                ->where('last_activity_at', '<', Carbon::now()->subHour())
                ->notBot()
                ->count();

            // Calculate cart abandonment rate
            $totalCartsWithItems = VisitorSession::today()
                ->whereIn('cart_status', ['has_items', 'checkout_started', 'converted'])
                ->notBot()
                ->count();

            $convertedCarts = VisitorSession::today()
                ->where('cart_status', 'converted')
                ->notBot()
                ->count();

            $abandonmentRate = $totalCartsWithItems > 0
                ? round((1 - ($convertedCarts / $totalCartsWithItems)) * 100, 1)
                : 0;

            return $this->success([
                'summary' => $cartSummary,
                'abandoned_carts' => $abandonedCarts,
                'abandonment_rate' => $abandonmentRate,
            ]);
        } catch (\Exception $e) {
            \Log::error('Cart analytics error: ' . $e->getMessage());
            return $this->success([
                'summary' => [
                    'empty' => 0,
                    'has_items' => 0,
                    'checkout_started' => 0,
                    'converted' => 0,
                    'total_cart_value' => 0,
                    'avg_cart_value' => 0,
                ],
                'abandoned_carts' => 0,
                'abandonment_rate' => 0,
            ]);
        }
    }
}
