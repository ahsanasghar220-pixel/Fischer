<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Adds HTTP Cache-Control headers to public GET API responses.
 * Allows browsers and CDNs (e.g. Cloudflare) to cache responses,
 * reducing load on the server dramatically under traffic.
 *
 * max-age=300            → browser/CDN serves cached copy for 5 minutes
 * stale-while-revalidate → serve stale copy instantly while fetching fresh in background
 */
class PublicApiCache
{
    public function handle(Request $request, Closure $next, int $maxAge = 300, int $staleWhileRevalidate = 60): Response
    {
        $response = $next($request);

        // Only cache successful GET responses
        if ($request->isMethod('GET') && $response->isSuccessful()) {
            $response->headers->set(
                'Cache-Control',
                "public, max-age={$maxAge}, stale-while-revalidate={$staleWhileRevalidate}"
            );
        }

        return $response;
    }
}
