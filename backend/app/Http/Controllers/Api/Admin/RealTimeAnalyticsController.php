<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\VisitorSession;
use App\Models\VisitorEvent;
use App\Models\Order;
use Illuminate\Http\Request;
use Carbon\Carbon;

class RealTimeAnalyticsController extends Controller
{
    /**
     * Get real-time overview stats
     */
    public function overview()
    {
        try {
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
            return $this->error('Failed to load analytics', 500);
        }
    }

    /**
     * Get live activity feed
     */
    public function activityFeed(Request $request)
    {
        try {
            $limit = min($request->input('limit', 20), 50);
            $activities = VisitorEvent::getActivityFeed($limit);

            return $this->success([
                'activities' => $activities,
                'updated_at' => Carbon::now()->toISOString(),
            ]);
        } catch (\Exception $e) {
            \Log::error('Activity feed error: ' . $e->getMessage());
            return $this->error('Failed to load activity feed', 500);
        }
    }

    /**
     * Get geographic distribution of visitors
     */
    public function geographic()
    {
        try {
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
            return $this->error('Failed to load geographic data', 500);
        }
    }

    /**
     * Get traffic sources breakdown
     */
    public function trafficSources()
    {
        try {
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
            return $this->error('Failed to load traffic sources', 500);
        }
    }

    /**
     * Get conversion funnel data
     */
    public function conversionFunnel()
    {
        try {
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
            return $this->error('Failed to load conversion funnel', 500);
        }
    }

    /**
     * Get active sessions with details
     */
    public function activeSessions(Request $request)
    {
        try {
            $page = $request->input('page', 1);
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
            return $this->error('Failed to load active sessions', 500);
        }
    }

    /**
     * Get cart analytics
     */
    public function cartAnalytics()
    {
        try {
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
            return $this->error('Failed to load cart analytics', 500);
        }
    }
}
