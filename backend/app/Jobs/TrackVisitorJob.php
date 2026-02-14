<?php

namespace App\Jobs;

use App\Services\AnalyticsTrackingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class TrackVisitorJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public $tries = 3;

    /**
     * The number of seconds the job can run before timing out.
     */
    public $timeout = 30;

    /**
     * Create a new job instance.
     */
    public function __construct(
        protected array $requestData,
        protected ?string $pageType = null
    ) {}

    /**
     * Execute the job.
     */
    public function handle(AnalyticsTrackingService $trackingService): void
    {
        try {
            // Recreate a minimal request object from stored data
            $request = new \Illuminate\Http\Request();
            $request->headers->add($this->requestData['headers'] ?? []);
            $request->server->add($this->requestData['server'] ?? []);
            $request->query->add($this->requestData['query'] ?? []);

            // Set request properties
            $request->setMethod($this->requestData['method'] ?? 'GET');
            if (isset($this->requestData['url'])) {
                $request->server->set('REQUEST_URI', $this->requestData['url']);
            }

            // Get or create visitor session
            $session = $trackingService->getOrCreateSession($request);

            // Track page view if page type is provided
            if ($this->pageType && $session) {
                $trackingService->trackPageView($request, $this->pageType);
            }
        } catch (\Exception $e) {
            // Log the error but don't fail the job
            Log::warning('Visitor tracking job error: ' . $e->getMessage(), [
                'request_data' => $this->requestData,
                'page_type' => $this->pageType,
            ]);

            // Don't retry for certain errors
            if ($e instanceof \PDOException || str_contains($e->getMessage(), 'Table')) {
                $this->fail($e);
            }
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Visitor tracking job failed after all retries', [
            'exception' => $exception->getMessage(),
            'request_data' => $this->requestData,
        ]);
    }
}
