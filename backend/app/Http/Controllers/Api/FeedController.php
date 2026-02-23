<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Services\ProductFeedService;
use Illuminate\Http\Response;

class FeedController extends Controller {
    public function __construct(private ProductFeedService $feedService) {}

    public function google(): Response {
        return response($this->feedService->generateGoogleFeed(), 200, ["Content-Type" => "application/xml"]);
    }

    public function meta(): Response {
        return response($this->feedService->generateMetaFeed(), 200, ["Content-Type" => "application/xml"]);
    }

    public function tiktok(): Response {
        return response($this->feedService->generateTikTokFeed(), 200, ["Content-Type" => "application/xml"]);
    }

    public function clientConfig(): \Illuminate\Http\JsonResponse {
        try {
            $service = app(\App\Services\MarketingIntegrationService::class);
            return response()->json($service->getClientConfig());
        } catch (\Throwable $e) {
            return response()->json([]);
        }
    }
}
