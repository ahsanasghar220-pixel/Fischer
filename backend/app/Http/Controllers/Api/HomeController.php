<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\Banner;
use App\Models\Setting;
use App\Models\HomepageSection;
use App\Models\HomepageCategory;
use App\Models\HomepageProduct;
use App\Models\HomepageStat;
use App\Models\HomepageFeature;
use App\Models\HomepageTrustBadge;
use App\Models\Testimonial;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;

class HomeController extends Controller
{
    public function index()
    {
        // Cache home page data for 30 minutes for better performance
        $homeData = Cache::remember('homepage_data', 1800, function () {
            return $this->getHomePageData();
        });

        return $this->success($homeData);
    }

    protected function getHomePageData(): array
    {
        // Check if new homepage tables exist
        $hasNewTables = Schema::hasTable('homepage_sections');

        if ($hasNewTables) {
            return $this->getDynamicHomePageData();
        }

        return $this->getLegacyHomePageData();
    }

    protected function getDynamicHomePageData(): array
    {
        // Get enabled sections ordered
        $sections = HomepageSection::enabled()->ordered()->get()->keyBy('key');

        // Get section settings
        $sectionSettings = $sections->mapWithKeys(function ($section) {
            return [$section->key => [
                'title' => $section->title,
                'subtitle' => $section->subtitle,
                'is_enabled' => $section->is_enabled,
                'settings' => $section->settings,
            ]];
        });

        // Get categories - from homepage_categories if available, otherwise auto
        $categoriesSection = $sections->get('categories');
        $categoriesSettings = $categoriesSection?->settings ?? [];
        $categoriesCount = $categoriesSettings['display_count'] ?? 6;

        $homepageCategories = HomepageCategory::visible()->ordered()->with('category')->get();

        if ($homepageCategories->isNotEmpty()) {
            // Use manually selected categories
            $categories = $homepageCategories
                ->take($categoriesCount)
                ->map(function ($hc) {
                    $cat = $hc->category;
                    return $cat ? [
                        'id' => $cat->id,
                        'name' => $cat->name,
                        'slug' => $cat->slug,
                        'image' => $cat->image,
                        'icon' => $cat->icon,
                        'products_count' => $cat->products()->count(),
                    ] : null;
                })
                ->filter()
                ->values();
        } else {
            // Fallback to auto categories
            $categories = Category::withCount('products')
                ->active()
                ->topLevel()
                ->ordered()
                ->limit($categoriesCount)
                ->get()
                ->map(function ($cat) {
                    return [
                        'id' => $cat->id,
                        'name' => $cat->name,
                        'slug' => $cat->slug,
                        'image' => $cat->image,
                        'icon' => $cat->icon,
                        'products_count' => $cat->products_count,
                    ];
                });
        }

        // Get featured products
        $featuredSection = $sections->get('featured_products');
        $featuredSettings = $featuredSection?->settings ?? [];
        $featuredCount = $featuredSettings['display_count'] ?? 10;
        $featuredSource = $featuredSettings['source'] ?? 'auto';

        if ($featuredSource === 'manual') {
            $homepageProducts = HomepageProduct::visible()
                ->section('featured')
                ->ordered()
                ->with('product')
                ->take($featuredCount)
                ->get();

            $featuredProducts = $homepageProducts
                ->map(fn($hp) => $hp->product)
                ->filter()
                ->map(fn($p) => $this->formatProduct($p));
        } else {
            $featuredProducts = Product::with(['images', 'category'])
                ->active()
                ->featured()
                ->orderByDesc('created_at')
                ->limit($featuredCount)
                ->get()
                ->map(fn($p) => $this->formatProduct($p));
        }

        // Get new arrivals
        $newArrivalsSection = $sections->get('new_arrivals');
        $newArrivalsSettings = $newArrivalsSection?->settings ?? [];
        $newArrivalsCount = $newArrivalsSettings['display_count'] ?? 5;

        $newArrivals = Product::with(['images', 'category'])
            ->active()
            ->new()
            ->orderByDesc('created_at')
            ->limit($newArrivalsCount)
            ->get()
            ->map(fn($p) => $this->formatProduct($p));

        // Get bestsellers
        $bestsellers = Product::with(['images', 'category'])
            ->active()
            ->bestseller()
            ->orderByDesc('sales_count')
            ->limit(10)
            ->get()
            ->map(fn($p) => $this->formatProduct($p));

        // Get banners
        $banners = Banner::active()
            ->where('position', 'hero')
            ->ordered()
            ->get()
            ->map(function ($b) {
                return [
                    'id' => $b->id,
                    'title' => $b->title,
                    'subtitle' => $b->subtitle,
                    'image' => $b->image,
                    'mobile_image' => $b->mobile_image,
                    'button_text' => $b->button_text ?? $b->link_text,
                    'button_link' => $b->button_link ?? $b->link_url,
                ];
            });

        // Get stats with dynamic products sold calculation
        // Only override if we have real data, otherwise keep admin-set values
        $productsSold = $this->getProductsSoldCount();
        $stats = HomepageStat::visible()->ordered()->get()->map(function ($stat) use ($productsSold) {
            $value = $stat->value;

            // Only override "Products Sold" if we have real order/sales data
            // (i.e., not the fallback value)
            if ((stripos($stat->label, 'Products Sold') !== false || stripos($stat->label, 'Sold') !== false)
                && $productsSold !== '1M+') {
                $value = $productsSold;
            }

            return [
                'label' => $stat->label,
                'value' => $value,
                'icon' => $stat->icon,
            ];
        });

        // Get features
        $features = HomepageFeature::visible()->ordered()->get()->map(function ($feature) {
            return [
                'title' => $feature->title,
                'description' => $feature->description,
                'icon' => $feature->icon,
                'color' => $feature->color,
            ];
        });

        // Get testimonials
        $testimonials = Testimonial::visible()->ordered()->get()->map(function ($t) {
            return [
                'name' => $t->name,
                'role' => $t->role,
                'content' => $t->content,
                'image' => $t->image,
                'rating' => $t->rating,
            ];
        });

        // Get trust badges
        $trustBadges = HomepageTrustBadge::visible()->ordered()->get()->map(function ($badge) {
            return [
                'title' => $badge->title,
                'image' => $badge->image,
            ];
        });

        // Get general settings
        $settings = [
            'phone' => Setting::get('phone', '+92 321 1146642'),
            'email' => Setting::get('email', 'fischer.few@gmail.com'),
            'address' => Setting::get('address'),
            'whatsapp' => Setting::get('whatsapp_number'),
            'social_facebook' => Setting::get('facebook_url'),
            'social_instagram' => Setting::get('instagram_url'),
        ];

        return [
            'sections' => $sectionSettings,
            'banners' => $banners,
            'categories' => $categories,
            'featured_products' => $featuredProducts,
            'new_arrivals' => $newArrivals,
            'bestsellers' => $bestsellers,
            'stats' => $stats,
            'features' => $features,
            'testimonials' => $testimonials,
            'trust_badges' => $trustBadges,
            'settings' => $settings,
        ];
    }

    protected function getLegacyHomePageData(): array
    {
        // Featured products
        $featuredProducts = Product::with(['images', 'category'])
            ->active()
            ->featured()
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn($p) => $this->formatProduct($p));

        // New arrivals
        $newArrivals = Product::with(['images', 'category'])
            ->active()
            ->new()
            ->orderByDesc('created_at')
            ->limit(8)
            ->get()
            ->map(fn($p) => $this->formatProduct($p));

        // Bestsellers
        $bestsellers = Product::with(['images', 'category'])
            ->active()
            ->bestseller()
            ->orderByDesc('sales_count')
            ->limit(8)
            ->get()
            ->map(fn($p) => $this->formatProduct($p));

        // Categories
        $categories = Category::withCount('products')
            ->active()
            ->topLevel()
            ->ordered()
            ->limit(6)
            ->get();

        // Banners
        $banners = Banner::active()
            ->ordered()
            ->get()
            ->map(function ($b) {
                return [
                    'id' => $b->id,
                    'title' => $b->title,
                    'subtitle' => $b->subtitle,
                    'image' => $b->image,
                    'button_text' => $b->button_text ?? $b->link_text ?? 'Shop Now',
                    'button_link' => $b->button_link ?? $b->link_url ?? '/shop',
                ];
            });

        // Settings
        $settings = [
            'phone' => Setting::get('phone', '+92 321 1146642'),
            'email' => Setting::get('email', 'fischer.few@gmail.com'),
            'address' => Setting::get('address'),
            'social_facebook' => Setting::get('facebook_url'),
            'social_instagram' => Setting::get('instagram_url'),
        ];

        return [
            'banners' => $banners,
            'categories' => $categories,
            'featured_products' => $featuredProducts,
            'new_arrivals' => $newArrivals,
            'bestsellers' => $bestsellers,
            'testimonials' => [],
            'settings' => $settings,
        ];
    }

    protected function formatProduct($product): array
    {
        return [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'price' => $product->price,
            'compare_price' => $product->compare_price,
            'primary_image' => $product->primary_image,
            'stock_status' => $product->stock_status,
            'is_new' => $product->is_new,
            'is_bestseller' => $product->is_bestseller,
            'average_rating' => $product->average_rating,
            'review_count' => $product->review_count ?? 0,
            'category' => $product->category ? [
                'name' => $product->category->name,
                'slug' => $product->category->slug,
            ] : null,
        ];
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

    /**
     * Get formatted products sold count
     */
    protected function getProductsSoldCount(): string
    {
        try {
            // Get total quantity of products sold from order items
            $totalSold = OrderItem::whereHas('order', function ($query) {
                $query->whereIn('status', ['completed', 'delivered', 'processing', 'shipped']);
            })->sum('quantity');

            // If we have order data, format it
            if ($totalSold > 0) {
                if ($totalSold >= 1000000) {
                    return round($totalSold / 1000000, 1) . 'M+';
                } elseif ($totalSold >= 1000) {
                    return round($totalSold / 1000, 1) . 'K+';
                }
                return $totalSold . '+';
            }

            // Fallback to products' sales_count if no order items
            $salesCount = Product::sum('sales_count');
            if ($salesCount > 0) {
                if ($salesCount >= 1000000) {
                    return round($salesCount / 1000000, 1) . 'M+';
                } elseif ($salesCount >= 1000) {
                    return round($salesCount / 1000, 1) . 'K+';
                }
                return $salesCount . '+';
            }

            // Default fallback - use the value from homepage_stats if available
            // This ensures admin-set values are respected when no real order data exists
            return '1M+';
        } catch (\Exception $e) {
            return '1M+';
        }
    }
}
