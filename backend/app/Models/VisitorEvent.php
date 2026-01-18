<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class VisitorEvent extends Model
{
    use HasFactory;

    const UPDATED_AT = null; // Events are immutable, no updated_at needed

    protected $fillable = [
        'visitor_session_id',
        'user_id',
        'event_type',
        'page_url',
        'page_type',
        'product_id',
        'category_id',
        'order_id',
        'bundle_id',
        'metadata',
        'value',
        'quantity',
    ];

    protected $casts = [
        'metadata' => 'array',
        'value' => 'decimal:2',
    ];

    // Event types as constants
    const TYPE_PAGE_VIEW = 'page_view';
    const TYPE_PRODUCT_VIEW = 'product_view';
    const TYPE_CATEGORY_VIEW = 'category_view';
    const TYPE_ADD_TO_CART = 'add_to_cart';
    const TYPE_REMOVE_FROM_CART = 'remove_from_cart';
    const TYPE_CHECKOUT_START = 'checkout_start';
    const TYPE_PURCHASE = 'purchase';
    const TYPE_SEARCH = 'search';
    const TYPE_WISHLIST_ADD = 'wishlist_add';
    const TYPE_BUNDLE_VIEW = 'bundle_view';

    // Relationships
    public function session(): BelongsTo
    {
        return $this->belongsTo(VisitorSession::class, 'visitor_session_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function bundle(): BelongsTo
    {
        return $this->belongsTo(Bundle::class);
    }

    // Scopes
    public function scopeOfType($query, string $type)
    {
        return $query->where('event_type', $type);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('created_at', Carbon::today());
    }

    public function scopeRecent($query, int $minutes = 30)
    {
        return $query->where('created_at', '>=', Carbon::now()->subMinutes($minutes));
    }

    public function scopeWithSession($query)
    {
        return $query->with('session');
    }

    // Methods
    public function getDescription(): string
    {
        switch ($this->event_type) {
            case self::TYPE_PAGE_VIEW:
                return 'Viewed page: ' . ($this->page_type ?? 'unknown');

            case self::TYPE_PRODUCT_VIEW:
                $productName = $this->product?->name ?? 'Unknown Product';
                return "Viewed product: {$productName}";

            case self::TYPE_CATEGORY_VIEW:
                $categoryName = $this->category?->name ?? 'Unknown Category';
                return "Browsed category: {$categoryName}";

            case self::TYPE_ADD_TO_CART:
                $productName = $this->product?->name ?? 'Unknown Product';
                $qty = $this->quantity ?? 1;
                return "Added {$qty}x {$productName} to cart";

            case self::TYPE_REMOVE_FROM_CART:
                $productName = $this->product?->name ?? 'Unknown Product';
                return "Removed {$productName} from cart";

            case self::TYPE_CHECKOUT_START:
                return 'Started checkout';

            case self::TYPE_PURCHASE:
                $amount = number_format($this->value ?? 0, 0);
                return "Completed purchase (PKR {$amount})";

            case self::TYPE_SEARCH:
                $query = $this->metadata['query'] ?? 'unknown';
                return "Searched for: {$query}";

            case self::TYPE_WISHLIST_ADD:
                $productName = $this->product?->name ?? 'Unknown Product';
                return "Added {$productName} to wishlist";

            case self::TYPE_BUNDLE_VIEW:
                $bundleName = $this->bundle?->name ?? 'Unknown Bundle';
                return "Viewed bundle: {$bundleName}";

            default:
                return 'Unknown event';
        }
    }

    public function getIcon(): string
    {
        return match ($this->event_type) {
            self::TYPE_PAGE_VIEW => '👁️',
            self::TYPE_PRODUCT_VIEW => '📦',
            self::TYPE_CATEGORY_VIEW => '📁',
            self::TYPE_ADD_TO_CART => '🛒',
            self::TYPE_REMOVE_FROM_CART => '❌',
            self::TYPE_CHECKOUT_START => '💳',
            self::TYPE_PURCHASE => '✅',
            self::TYPE_SEARCH => '🔍',
            self::TYPE_WISHLIST_ADD => '❤️',
            self::TYPE_BUNDLE_VIEW => '🎁',
            default => '📌',
        };
    }

    // Static methods for analytics
    public static function getActivityFeed(int $limit = 20): array
    {
        return static::with(['session', 'product', 'category', 'bundle'])
            ->recent(60) // Last hour
            ->whereHas('session', function ($q) {
                $q->where('is_bot', false);
            })
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(function ($event) {
                return [
                    'id' => $event->id,
                    'type' => $event->event_type,
                    'icon' => $event->getIcon(),
                    'description' => $event->getDescription(),
                    'value' => $event->value,
                    'location' => $event->session ? [
                        'city' => $event->session->city,
                        'country' => $event->session->country,
                        'country_code' => $event->session->country_code,
                    ] : null,
                    'time' => $event->created_at->diffForHumans(),
                    'timestamp' => $event->created_at->toISOString(),
                ];
            })
            ->toArray();
    }

    public static function getConversionFunnel(): array
    {
        $today = Carbon::today();

        return [
            'visitors' => VisitorSession::whereDate('started_at', $today)->notBot()->count(),
            'product_views' => static::ofType(self::TYPE_PRODUCT_VIEW)->whereDate('created_at', $today)->distinct('visitor_session_id')->count(),
            'add_to_cart' => static::ofType(self::TYPE_ADD_TO_CART)->whereDate('created_at', $today)->distinct('visitor_session_id')->count(),
            'checkout_started' => static::ofType(self::TYPE_CHECKOUT_START)->whereDate('created_at', $today)->distinct('visitor_session_id')->count(),
            'purchases' => static::ofType(self::TYPE_PURCHASE)->whereDate('created_at', $today)->distinct('visitor_session_id')->count(),
        ];
    }

    public static function getTodayStats(): array
    {
        $today = Carbon::today();

        return [
            'page_views' => static::ofType(self::TYPE_PAGE_VIEW)->whereDate('created_at', $today)->count(),
            'product_views' => static::ofType(self::TYPE_PRODUCT_VIEW)->whereDate('created_at', $today)->count(),
            'add_to_cart' => static::ofType(self::TYPE_ADD_TO_CART)->whereDate('created_at', $today)->count(),
            'purchases' => static::ofType(self::TYPE_PURCHASE)->whereDate('created_at', $today)->count(),
            'revenue' => static::ofType(self::TYPE_PURCHASE)->whereDate('created_at', $today)->sum('value'),
        ];
    }
}
