<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PortfolioVideo;
use Illuminate\Support\Facades\Cache;

class PortfolioController extends Controller
{
    public function index()
    {
        // Auto-seed if table is empty (handles fresh deploys)
        if (PortfolioVideo::count() === 0) {
            \Artisan::call('db:seed', ['--class' => 'PortfolioVideoSeeder', '--force' => true]);
            Cache::forget('portfolio_videos');
        }

        $videos = Cache::remember('portfolio_videos', 3600, function () {
            return PortfolioVideo::visible()->ordered()->get();
        });

        return $this->success($videos);
    }
}
