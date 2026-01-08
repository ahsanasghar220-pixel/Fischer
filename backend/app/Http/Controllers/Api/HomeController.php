<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\Banner;
use App\Models\Setting;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function index()
    {
        // Featured products
        $featuredProducts = Product::with(['images', 'category'])
            ->active()
            ->featured()
            ->orderByDesc('created_at')
            ->limit(8)
            ->get();

        // New arrivals
        $newArrivals = Product::with(['images', 'category'])
            ->active()
            ->new()
            ->orderByDesc('created_at')
            ->limit(8)
            ->get();

        // Bestsellers
        $bestsellers = Product::with(['images', 'category'])
            ->active()
            ->bestseller()
            ->orderByDesc('sales_count')
            ->limit(8)
            ->get();

        // Featured categories
        $categories = Category::active()
            ->featured()
            ->topLevel()
            ->ordered()
            ->limit(6)
            ->get();

        // Home hero banners
        $sliders = Banner::active()
            ->position('home_hero')
            ->ordered()
            ->get();

        // Secondary banners
        $promoBanners = Banner::active()
            ->position('home_secondary')
            ->ordered()
            ->limit(3)
            ->get();

        // Settings
        $settings = [
            'phone' => Setting::get('phone', '+92 321 1146642'),
            'email' => Setting::get('email', 'fischer.few@gmail.com'),
            'address' => Setting::get('address'),
            'social_facebook' => Setting::get('facebook_url'),
            'social_instagram' => Setting::get('instagram_url'),
        ];

        return $this->success([
            'sliders' => $sliders,
            'promo_banners' => $promoBanners,
            'featured_products' => $featuredProducts,
            'new_arrivals' => $newArrivals,
            'bestsellers' => $bestsellers,
            'categories' => $categories,
            'testimonials' => [],
            'settings' => $settings,
        ]);
    }

    public function banners(string $position)
    {
        $banners = Banner::getByPosition($position);
        return $this->success($banners);
    }

    public function testimonials()
    {
        return $this->success([]);
    }
}
