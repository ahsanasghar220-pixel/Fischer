<?php

namespace App\Http\Middleware;

use App\Services\AnalyticsTrackingService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackVisitor
{
    protected AnalyticsTrackingService $trackingService;

    public function __construct(AnalyticsTrackingService $trackingService)
    {
        $this->trackingService = $trackingService;
    }

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip tracking for certain paths
        if ($this->shouldSkip($request)) {
            return $next($request);
        }

        try {
            // Get or create visitor session
            $session = $this->trackingService->getOrCreateSession($request);

            // Track page view for certain endpoints
            if ($this->shouldTrackPageView($request)) {
                $pageType = $this->determinePageType($request);
                $this->trackingService->trackPageView($request, $pageType);
            }
        } catch (\Exception $e) {
            // Don't let tracking errors break the request
            \Log::warning('Visitor tracking error: ' . $e->getMessage());
        }

        return $next($request);
    }

    /**
     * Determine if we should skip tracking for this request
     */
    protected function shouldSkip(Request $request): bool
    {
        $path = $request->path();

        // Skip admin API endpoints (they're tracked separately or not at all)
        if (str_starts_with($path, 'api/admin/')) {
            return true;
        }

        // Skip health check endpoints
        if (in_array($path, ['api/health', 'health', 'up'])) {
            return true;
        }

        // Skip static assets if somehow they hit the API
        if (preg_match('/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/i', $path)) {
            return true;
        }

        return false;
    }

    /**
     * Determine if we should track a page view for this request
     */
    protected function shouldTrackPageView(Request $request): bool
    {
        // Only track GET requests
        if (!$request->isMethod('GET')) {
            return false;
        }

        // Track main content endpoints
        $trackableEndpoints = [
            'api/home',
            'api/products',
            'api/categories',
            'api/bundles',
        ];

        $path = $request->path();

        foreach ($trackableEndpoints as $endpoint) {
            if (str_starts_with($path, $endpoint)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Determine the page type based on the request
     */
    protected function determinePageType(Request $request): string
    {
        $path = $request->path();

        if (str_starts_with($path, 'api/home')) {
            return 'home';
        }

        if (preg_match('/api\/products\/[^\/]+$/', $path)) {
            return 'product';
        }

        if (str_starts_with($path, 'api/products')) {
            return 'shop';
        }

        if (preg_match('/api\/categories\/[^\/]+$/', $path)) {
            return 'category';
        }

        if (str_starts_with($path, 'api/categories')) {
            return 'categories';
        }

        if (preg_match('/api\/bundles\/[^\/]+$/', $path)) {
            return 'bundle';
        }

        if (str_starts_with($path, 'api/bundles')) {
            return 'bundles';
        }

        if (str_starts_with($path, 'api/cart')) {
            return 'cart';
        }

        if (str_starts_with($path, 'api/checkout')) {
            return 'checkout';
        }

        return 'page';
    }
}
