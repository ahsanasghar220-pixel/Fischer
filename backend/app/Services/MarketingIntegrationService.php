<?php
namespace App\Services;
use App\Models\MarketingIntegration;
use Illuminate\Support\Collection;

class MarketingIntegrationService {
    const PLATFORMS = ['meta', 'google_analytics', 'google_ads', 'tiktok', 'snapchat', 'pinterest'];

    public function getAll(): Collection {
        $existing = MarketingIntegration::all()->keyBy('platform');
        return collect(self::PLATFORMS)->map(function ($platform) use ($existing) {
            return $existing->get($platform) ?? new MarketingIntegration(['platform' => $platform, 'is_enabled' => false, 'config' => []]);
        });
    }

    public function upsert(string $platform, array $data): MarketingIntegration {
        return MarketingIntegration::updateOrCreate(
            ['platform' => $platform],
            ['is_enabled' => $data['is_enabled'] ?? false, 'config' => $data['config'] ?? []]
        );
    }

    public function getClientConfig(): array {
        return MarketingIntegration::where('is_enabled', true)->get()->mapWithKeys(function ($integration) {
            return [$integration->platform => $integration->config ?? []];
        })->toArray();
    }
}
