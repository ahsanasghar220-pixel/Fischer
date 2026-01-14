<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\Banner;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class HomeController extends Controller
{
    public function index()
    {
        // Cache home page data for 30 minutes for better performance
        $homeData = Cache::remember('home_page_data', 1800, function () {
            return $this->getHomePageData();
        });

        // Settings are cached separately (they change less frequently)
        $settings = Cache::remember('home_settings', 3600, function () {
            return [
                'phone' => Setting::get('phone', '+92 321 1146642'),
                'email' => Setting::get('email', 'fischer.few@gmail.com'),
                'address' => Setting::get('address'),
                'social_facebook' => Setting::get('facebook_url'),
                'social_instagram' => Setting::get('instagram_url'),
            ];
        });

        return $this->success(array_merge($homeData, ['settings' => $settings]));
    }

    protected function getHomePageData(): array
    {
        // Featured products - only show products with images
        $featuredProducts = Product::with(['images', 'category', 'brand'])
            ->active()
            ->featured()
            ->whereHas('images')
            ->orderByDesc('created_at')
            ->limit(8)
            ->get();

        // New arrivals - only show products with images
        $newArrivals = Product::with(['images', 'category', 'brand'])
            ->active()
            ->new()
            ->whereHas('images')
            ->orderByDesc('created_at')
            ->limit(8)
            ->get();

        // Bestsellers - only show products with images
        $bestsellers = Product::with(['images', 'category', 'brand'])
            ->active()
            ->bestseller()
            ->whereHas('images')
            ->orderByDesc('sales_count')
            ->limit(8)
            ->get();

        // Featured categories - only get unique categories (avoid duplicates from multiple seeder runs)
        $categories = Category::withCount('products')
            ->active()
            ->featured()
            ->topLevel()
            ->ordered()
            ->whereIn('id', function($query) {
                // Get the first (oldest) category ID for each unique name
                $query->selectRaw('MIN(id)')
                    ->from('categories')
                    ->whereNull('deleted_at')
                    ->where('is_active', true)
                    ->groupBy('name');
            })
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

        return [
            'sliders' => $sliders,
            'promo_banners' => $promoBanners,
            'featured_products' => $featuredProducts,
            'new_arrivals' => $newArrivals,
            'bestsellers' => $bestsellers,
            'categories' => $categories,
            'testimonials' => [],
        ];
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
