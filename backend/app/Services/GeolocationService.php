<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeolocationService
{
    /**
     * Get geolocation data for an IP address
     * Uses ip-api.com free API with caching
     */
    public function getLocation(string $ipAddress): ?array
    {
        // Skip for local/private IPs
        if ($this->isPrivateIp($ipAddress)) {
            return $this->getDefaultLocation();
        }

        // Check cache first (cache for 24 hours)
        $cacheKey = "geo_ip_{$ipAddress}";
        $cached = Cache::get($cacheKey);

        if ($cached !== null) {
            return $cached;
        }

        try {
            // ip-api.com free tier: 45 requests per minute
            $response = Http::timeout(5)->get("http://ip-api.com/json/{$ipAddress}", [
                'fields' => 'status,country,countryCode,region,regionName,city,lat,lon',
            ]);

            if ($response->successful()) {
                $data = $response->json();

                if ($data['status'] === 'success') {
                    $location = [
                        'country' => $data['country'] ?? null,
                        'country_code' => $data['countryCode'] ?? null,
                        'region' => $data['regionName'] ?? null,
                        'city' => $data['city'] ?? null,
                        'latitude' => $data['lat'] ?? null,
                        'longitude' => $data['lon'] ?? null,
                    ];

                    // Cache the result for 24 hours
                    Cache::put($cacheKey, $location, now()->addHours(24));

                    return $location;
                }
            }
        } catch (\Exception $e) {
            Log::warning('Geolocation lookup failed for IP: ' . $ipAddress, [
                'error' => $e->getMessage(),
            ]);
        }

        // Cache null result to avoid repeated failed lookups
        Cache::put($cacheKey, null, now()->addHours(1));

        return null;
    }

    /**
     * Check if IP is private/local
     */
    protected function isPrivateIp(string $ip): bool
    {
        // Handle IPv6 localhost
        if ($ip === '::1') {
            return true;
        }

        return filter_var(
            $ip,
            FILTER_VALIDATE_IP,
            FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
        ) === false;
    }

    /**
     * Get default location for local/private IPs
     * Returns Pakistan as default since this is a Pakistani e-commerce site
     */
    protected function getDefaultLocation(): array
    {
        return [
            'country' => 'Pakistan',
            'country_code' => 'PK',
            'region' => null,
            'city' => null,
            'latitude' => 30.3753,
            'longitude' => 69.3451,
        ];
    }

    /**
     * Batch lookup multiple IPs
     */
    public function batchLookup(array $ipAddresses): array
    {
        $results = [];

        foreach ($ipAddresses as $ip) {
            $results[$ip] = $this->getLocation($ip);
        }

        return $results;
    }
}
