<?php

namespace App\Services;

use App\Models\VisitorSession;
use App\Models\VisitorEvent;
use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Carbon\Carbon;

class AnalyticsTrackingService
{
    protected GeolocationService $geoService;
    protected ?VisitorSession $currentSession = null;

    public function __construct(GeolocationService $geoService)
    {
        $this->geoService = $geoService;
    }

    /**
     * Get or create a visitor session from the request
     */
    public function getOrCreateSession(Request $request): VisitorSession
    {
        // Try to get existing session
        $sessionId = $this->getSessionId($request);

        $session = VisitorSession::where('session_id', $sessionId)->first();

        if ($session) {
            // Update last activity
            $session->updateActivity($request->fullUrl());
            $this->currentSession = $session;
            return $session;
        }

        // Create new session
        $session = $this->createSession($request, $sessionId);
        $this->currentSession = $session;

        return $session;
    }

    /**
     * Create a new visitor session
     */
    protected function createSession(Request $request, string $sessionId): VisitorSession
    {
        $userAgent = $request->userAgent() ?? '';

        // Get IP address (handle proxies)
        $ipAddress = $this->getClientIp($request);

        // Get geolocation
        $geo = $this->geoService->getLocation($ipAddress);

        // Parse referrer
        $referrer = $request->header('Referer');
        $referrerDomain = $referrer ? parse_url($referrer, PHP_URL_HOST) : null;

        // Detect device type using simple user agent parsing
        $deviceInfo = $this->parseUserAgent($userAgent);

        // Check if likely a bot
        $isBot = $this->isBot($userAgent);

        $now = Carbon::now();

        return VisitorSession::create([
            'session_id' => $sessionId,
            'user_id' => auth()->id(),
            'ip_address' => $ipAddress,
            'user_agent' => $request->userAgent(),

            // Geolocation
            'country' => $geo['country'] ?? null,
            'country_code' => $geo['country_code'] ?? null,
            'region' => $geo['region'] ?? null,
            'city' => $geo['city'] ?? null,
            'latitude' => $geo['latitude'] ?? null,
            'longitude' => $geo['longitude'] ?? null,

            // Traffic source
            'utm_source' => $request->input('utm_source'),
            'utm_medium' => $request->input('utm_medium'),
            'utm_campaign' => $request->input('utm_campaign'),
            'referrer_url' => $referrer,
            'referrer_domain' => $referrerDomain,

            // Navigation
            'landing_page' => $request->fullUrl(),
            'current_page' => $request->fullUrl(),
            'page_views' => 1,

            // Device info
            'device_type' => $deviceInfo['device_type'],
            'browser' => $deviceInfo['browser'],
            'os' => $deviceInfo['os'],

            // Status
            'cart_status' => 'empty',
            'started_at' => $now,
            'last_activity_at' => $now,
            'is_active' => true,
            'is_bot' => $isBot,
        ]);
    }

    /**
     * Track an event
     */
    public function trackEvent(
        string $eventType,
        ?string $pageUrl = null,
        ?string $pageType = null,
        ?int $productId = null,
        ?int $categoryId = null,
        ?int $orderId = null,
        ?int $bundleId = null,
        ?array $metadata = null,
        ?float $value = null,
        ?int $quantity = null
    ): ?VisitorEvent {
        if (!$this->currentSession) {
            return null;
        }

        // Don't track bot activity
        if ($this->currentSession->is_bot) {
            return null;
        }

        return VisitorEvent::create([
            'visitor_session_id' => $this->currentSession->id,
            'user_id' => auth()->id(),
            'event_type' => $eventType,
            'page_url' => $pageUrl,
            'page_type' => $pageType,
            'product_id' => $productId,
            'category_id' => $categoryId,
            'order_id' => $orderId,
            'bundle_id' => $bundleId,
            'metadata' => $metadata,
            'value' => $value,
            'quantity' => $quantity,
        ]);
    }

    /**
     * Track a page view
     */
    public function trackPageView(Request $request, string $pageType = 'page'): ?VisitorEvent
    {
        return $this->trackEvent(
            VisitorEvent::TYPE_PAGE_VIEW,
            $request->fullUrl(),
            $pageType
        );
    }

    /**
     * Track a product view
     */
    public function trackProductView(int $productId, ?float $price = null): ?VisitorEvent
    {
        return $this->trackEvent(
            VisitorEvent::TYPE_PRODUCT_VIEW,
            null,
            'product',
            $productId,
            null,
            null,
            null,
            null,
            $price
        );
    }

    /**
     * Track add to cart
     */
    public function trackAddToCart(int $productId, int $quantity = 1, ?float $price = null): ?VisitorEvent
    {
        $event = $this->trackEvent(
            VisitorEvent::TYPE_ADD_TO_CART,
            null,
            'cart',
            $productId,
            null,
            null,
            null,
            null,
            $price,
            $quantity
        );

        // Update session cart status
        $this->updateSessionCartStatus();

        return $event;
    }

    /**
     * Track checkout start
     */
    public function trackCheckoutStart(?float $cartValue = null): ?VisitorEvent
    {
        if ($this->currentSession) {
            $this->currentSession->updateCartStatus('checkout_started', $this->currentSession->cart_item_count, $cartValue ?? $this->currentSession->cart_value);
        }

        return $this->trackEvent(
            VisitorEvent::TYPE_CHECKOUT_START,
            null,
            'checkout',
            null,
            null,
            null,
            null,
            null,
            $cartValue
        );
    }

    /**
     * Track purchase
     */
    public function trackPurchase(int $orderId, float $orderValue): ?VisitorEvent
    {
        if ($this->currentSession) {
            $this->currentSession->updateCartStatus('converted', 0, 0);
        }

        return $this->trackEvent(
            VisitorEvent::TYPE_PURCHASE,
            null,
            'confirmation',
            null,
            null,
            $orderId,
            null,
            null,
            $orderValue
        );
    }

    /**
     * Track search
     */
    public function trackSearch(string $query, int $resultsCount = 0): ?VisitorEvent
    {
        return $this->trackEvent(
            VisitorEvent::TYPE_SEARCH,
            null,
            'search',
            null,
            null,
            null,
            null,
            ['query' => $query, 'results_count' => $resultsCount]
        );
    }

    /**
     * Track bundle view
     */
    public function trackBundleView(int $bundleId, ?float $price = null): ?VisitorEvent
    {
        return $this->trackEvent(
            VisitorEvent::TYPE_BUNDLE_VIEW,
            null,
            'bundle',
            null,
            null,
            null,
            $bundleId,
            null,
            $price
        );
    }

    /**
     * Update session cart status based on current cart
     */
    public function updateSessionCartStatus(): void
    {
        if (!$this->currentSession) {
            return;
        }

        // Get current cart
        $cart = $this->getCurrentCart();

        if (!$cart || $cart->items->isEmpty()) {
            $this->currentSession->updateCartStatus('empty', 0, 0);
        } else {
            $itemCount = $cart->items->sum('quantity');
            $cartValue = $cart->items->sum(function ($item) {
                return ($item->price ?? $item->product->price ?? 0) * $item->quantity;
            });

            $this->currentSession->updateCartStatus('has_items', $itemCount, $cartValue);
        }
    }

    /**
     * Get the current cart
     */
    protected function getCurrentCart(): ?Cart
    {
        $userId = auth()->id();

        if ($userId) {
            return Cart::where('user_id', $userId)->with('items.product')->first();
        }

        $sessionId = session()->getId();
        return Cart::where('session_id', $sessionId)->with('items.product')->first();
    }

    /**
     * Get session ID from request
     */
    protected function getSessionId(Request $request): string
    {
        // Check for custom header first (for API clients)
        $customSessionId = $request->header('X-Visitor-Session');
        if ($customSessionId) {
            return $customSessionId;
        }

        // Use Laravel session ID or create a unique one
        if (session()->isStarted()) {
            return session()->getId();
        }

        // Generate a unique ID based on IP and user agent
        return 'anon_' . md5($request->ip() . $request->userAgent() . date('Y-m-d'));
    }

    /**
     * Get client IP address handling proxies
     */
    protected function getClientIp(Request $request): string
    {
        // Check for forwarded IP headers
        $headers = [
            'HTTP_CF_CONNECTING_IP', // Cloudflare
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_REAL_IP',
        ];

        foreach ($headers as $header) {
            $ip = $request->server($header);
            if ($ip) {
                // X-Forwarded-For can contain multiple IPs, get the first one
                if (str_contains($ip, ',')) {
                    $ip = trim(explode(',', $ip)[0]);
                }
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            }
        }

        return $request->ip() ?? '127.0.0.1';
    }

    /**
     * Set the current session directly
     */
    public function setSession(VisitorSession $session): void
    {
        $this->currentSession = $session;
    }

    /**
     * Get the current session
     */
    public function getSession(): ?VisitorSession
    {
        return $this->currentSession;
    }

    /**
     * Mark old sessions as inactive (cleanup job)
     */
    public static function markInactiveSessions(): int
    {
        return VisitorSession::where('is_active', true)
            ->where('last_activity_at', '<', Carbon::now()->subMinutes(30))
            ->update(['is_active' => false]);
    }

    /**
     * Parse user agent to extract device info
     */
    protected function parseUserAgent(string $userAgent): array
    {
        $userAgent = strtolower($userAgent);

        // Detect device type
        $deviceType = 'desktop';
        if (preg_match('/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i', $userAgent)) {
            $deviceType = 'tablet';
        } elseif (preg_match('/(mobile|iphone|ipod|android.*mobile|windows phone|blackberry|bb10|opera mini|opera mobi)/i', $userAgent)) {
            $deviceType = 'mobile';
        }

        // Detect browser
        $browser = 'Unknown';
        if (str_contains($userAgent, 'edg/') || str_contains($userAgent, 'edge/')) {
            $browser = 'Edge';
        } elseif (str_contains($userAgent, 'opr/') || str_contains($userAgent, 'opera')) {
            $browser = 'Opera';
        } elseif (str_contains($userAgent, 'chrome') && !str_contains($userAgent, 'chromium')) {
            $browser = 'Chrome';
        } elseif (str_contains($userAgent, 'firefox')) {
            $browser = 'Firefox';
        } elseif (str_contains($userAgent, 'safari') && !str_contains($userAgent, 'chrome')) {
            $browser = 'Safari';
        } elseif (str_contains($userAgent, 'msie') || str_contains($userAgent, 'trident')) {
            $browser = 'Internet Explorer';
        }

        // Detect OS
        $os = 'Unknown';
        if (str_contains($userAgent, 'windows nt 10')) {
            $os = 'Windows 10/11';
        } elseif (str_contains($userAgent, 'windows nt')) {
            $os = 'Windows';
        } elseif (str_contains($userAgent, 'mac os x')) {
            $os = 'macOS';
        } elseif (str_contains($userAgent, 'iphone') || str_contains($userAgent, 'ipad')) {
            $os = 'iOS';
        } elseif (str_contains($userAgent, 'android')) {
            $os = 'Android';
        } elseif (str_contains($userAgent, 'linux')) {
            $os = 'Linux';
        }

        return [
            'device_type' => $deviceType,
            'browser' => $browser,
            'os' => $os,
        ];
    }

    /**
     * Check if user agent is likely a bot
     */
    protected function isBot(string $userAgent): bool
    {
        $userAgent = strtolower($userAgent);

        $botPatterns = [
            'bot', 'crawler', 'spider', 'slurp', 'googlebot', 'bingbot',
            'yandex', 'baidu', 'duckduck', 'facebookexternalhit', 'twitterbot',
            'linkedinbot', 'whatsapp', 'telegram', 'pinterest', 'discordbot',
            'semrush', 'ahrefs', 'moz', 'screaming frog', 'curl', 'wget',
            'python-requests', 'axios', 'postman', 'insomnia', 'httpclient',
            'java/', 'libwww', 'apache-http', 'go-http', 'node-fetch',
            'headless', 'phantom', 'selenium', 'puppeteer', 'playwright',
        ];

        foreach ($botPatterns as $pattern) {
            if (str_contains($userAgent, $pattern)) {
                return true;
            }
        }

        // Also flag empty or very short user agents as potential bots
        if (strlen($userAgent) < 20) {
            return true;
        }

        return false;
    }
}
