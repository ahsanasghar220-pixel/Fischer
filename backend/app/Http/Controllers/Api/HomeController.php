<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\Testimonial;
use App\Services\HomepageDataService;
use Illuminate\Support\Facades\Cache;

class HomeController extends Controller
{
    public function __construct(private HomepageDataService $service) {}

    public function index()
    {
        // Cache home page data for 1 hour - data changes infrequently
        $homeData = Cache::remember('homepage_data', 3600, function () {
            return $this->service->getHomePageData();
        });

        return $this->success($homeData);
    }

    public function banners(string $position)
    {
        $banners = Banner::getByPosition($position);
        return $this->success($banners);
    }

    public function testimonials()
    {
        $testimonials = Testimonial::visible()->ordered()->get();
        return $this->success($testimonials);
    }
}
