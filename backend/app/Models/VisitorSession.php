<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

class VisitorSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'session_id',
        'user_id',
        'ip_address',
        'user_agent',
        'country',
        'country_code',
        'region',
        'city',
        'latitude',
        'longitude',
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'referrer_url',
        'referrer_domain',
        'landing_page',
        'current_page',
        'page_views',
        'device_type',
        'browser',
        'os',
        'cart_status',
        'cart_item_count',
        'cart_value',
        'started_at',
        'last_activity_at',
        'is_active',
        'is_bot',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'cart_value' => 'decimal:2',
        'is_active' => 'boolean',
        'is_bot' => 'boolean',
        'started_at' => 'datetime',
        'last_activity_at' => 'datetime',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(VisitorEvent::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        // Consider a session active if last activity was within 30 minutes
        return $query->where('is_active', true)
            ->where('last_activity_at', '>=', Carbon::now()->subMinutes(30));
    }

    public function scopeToday($query)
    {
        return $query->whereDate('started_at', Carbon::today());
    }

    public function scopeNotBot($query)
    {
        return $query->where('is_bot', false);
    }

    public function scopeWithItems($query)
    {
        return $query->where('cart_status', 'has_items');
    }

    public function scopeCheckoutStarted($query)
    {
        return $query->where('cart_status', 'checkout_started');
    }

    public function scopeConverted($query)
    {
        return $query->where('cart_status', 'converted');
    }

    public function scopeBySource($query, string $source)
    {
        return $query->where('utm_source', $source);
    }

    public function scopeByCountry($query, string $countryCode)
    {
        return $query->where('country_code', $countryCode);
    }

    // Methods
    public function markInactive(): void
    {
        $this->update(['is_active' => false]);
    }

    public function updateActivity(string $currentPage = null): void
    {
        $updates = [
            'last_activity_at' => Carbon::now(),
            'is_active' => true,
        ];

        if ($currentPage) {
            $updates['current_page'] = $currentPage;
        }

        $this->increment('page_views');
        $this->update($updates);
    }

    public function updateCartStatus(string $status, int $itemCount = 0, float $value = 0): void
    {
        $this->update([
            'cart_status' => $status,
            'cart_item_count' => $itemCount,
            'cart_value' => $value,
        ]);
    }

    public function getTrafficSource(): string
    {
        // Determine traffic source based on UTM or referrer
        if ($this->utm_source) {
            // Paid traffic
            if (in_array(strtolower($this->utm_medium), ['cpc', 'ppc', 'paid', 'ad', 'ads'])) {
                return 'paid';
            }
            // Social
            if (in_array(strtolower($this->utm_source), ['facebook', 'fb', 'instagram', 'ig', 'twitter', 'linkedin', 'tiktok', 'youtube'])) {
                return 'social';
            }
            // Email
            if (in_array(strtolower($this->utm_medium), ['email', 'newsletter'])) {
                return 'email';
            }
        }

        if ($this->referrer_domain) {
            $domain = strtolower($this->referrer_domain);

            // Search engines
            $searchEngines = ['google', 'bing', 'yahoo', 'duckduckgo', 'baidu', 'yandex'];
            foreach ($searchEngines as $engine) {
                if (str_contains($domain, $engine)) {
                    return 'organic';
                }
            }

            // Social platforms
            $socialPlatforms = ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest', 'reddit'];
            foreach ($socialPlatforms as $platform) {
                if (str_contains($domain, $platform)) {
                    return 'social';
                }
            }

            // It's a referral from another website
            return 'referral';
        }

        // No referrer or utm = direct traffic
        return 'direct';
    }

    public function getSessionDuration(): int
    {
        if (!$this->started_at || !$this->last_activity_at) {
            return 0;
        }

        return $this->started_at->diffInSeconds($this->last_activity_at);
    }

    public function getFormattedDuration(): string
    {
        $seconds = $this->getSessionDuration();

        if ($seconds < 60) {
            return $seconds . 's';
        }

        $minutes = floor($seconds / 60);
        $remainingSeconds = $seconds % 60;

        if ($minutes < 60) {
            return $minutes . 'm ' . $remainingSeconds . 's';
        }

        $hours = floor($minutes / 60);
        $remainingMinutes = $minutes % 60;

        return $hours . 'h ' . $remainingMinutes . 'm';
    }

    // Static methods for analytics
    public static function getActiveCount(): int
    {
        return static::active()->notBot()->count();
    }

    public static function getCartSummary(): array
    {
        $sessions = static::active()->notBot()->get();

        return [
            'empty' => $sessions->where('cart_status', 'empty')->count(),
            'has_items' => $sessions->where('cart_status', 'has_items')->count(),
            'checkout_started' => $sessions->where('cart_status', 'checkout_started')->count(),
            'converted' => $sessions->where('cart_status', 'converted')->count(),
            'total_cart_value' => $sessions->whereIn('cart_status', ['has_items', 'checkout_started'])->sum('cart_value'),
            'avg_cart_value' => $sessions->whereIn('cart_status', ['has_items', 'checkout_started'])->avg('cart_value') ?? 0,
        ];
    }

    public static function getByCountry(): array
    {
        return static::active()
            ->notBot()
            ->whereNotNull('country_code')
            ->selectRaw('country_code, country, COUNT(*) as count')
            ->groupBy('country_code', 'country')
            ->orderByDesc('count')
            ->limit(20)
            ->get()
            ->toArray();
    }

    public static function getByTrafficSource(): array
    {
        $sessions = static::today()->notBot()->get();

        $sources = [
            'direct' => 0,
            'organic' => 0,
            'social' => 0,
            'paid' => 0,
            'referral' => 0,
            'email' => 0,
        ];

        foreach ($sessions as $session) {
            $source = $session->getTrafficSource();
            if (isset($sources[$source])) {
                $sources[$source]++;
            }
        }

        return $sources;
    }
}
