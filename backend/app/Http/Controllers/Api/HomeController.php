<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\Banner;
use App\Models\Testimonial;
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

        // Home sliders
        $sliders = Banner::active()
            ->position('home_slider')
            ->ordered()
            ->get();

        // Promo banners
        $promoBanners = Banner::active()
            ->position('promo_banner')
            ->ordered()
            ->limit(3)
            ->get();

        // Testimonials
        $testimonials = Testimonial::where('is_active', true)
            ->where('is_featured', true)
            ->orderBy('sort_order')
            ->limit(6)
            ->get();

        // Settings
        $settings = [
            'phone' => Setting::get('contact_phone', '+92 321 1146642'),
            'email' => Setting::get('contact_email', 'fischer.few@gmail.com'),
            'address' => Setting::get('contact_address'),
            'social_facebook' => Setting::get('social_facebook'),
            'social_instagram' => Setting::get('social_instagram'),
        ];

        return $this->success([
            'sliders' => $sliders,
            'promo_banners' => $promoBanners,
            'featured_products' => $featuredProducts,
            'new_arrivals' => $newArrivals,
            'bestsellers' => $bestsellers,
            'categories' => $categories,
            'testimonials' => $testimonials,
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
        $testimonials = Testimonial::where('is_active', true)
            ->orderBy('sort_order')
            ->orderByDesc('created_at')
            ->get();

        return $this->success($testimonials);
    }
}
