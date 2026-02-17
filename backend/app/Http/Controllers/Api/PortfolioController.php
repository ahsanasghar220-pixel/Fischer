<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PortfolioVideo;
use Illuminate\Support\Facades\Cache;

class PortfolioController extends Controller
{
    public function index()
    {
        $videos = Cache::remember('portfolio_videos', 3600, function () {
            return PortfolioVideo::visible()->ordered()->get();
        });

        return $this->success($videos);
    }
}
