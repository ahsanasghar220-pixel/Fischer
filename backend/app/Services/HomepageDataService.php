<?php

namespace App\Services;

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
use App\Models\NotableClient;
use App\Models\Testimonial;
use App\Models\OrderItem;
use Illuminate\Support\Facades\Schema;

class HomepageDataService
{
    // Cache the schema check result to avoid repeated database queries
    private static ?bool $hasNewTables = null;

    public function getHomePageData(): array
    {
        // Cache schema check in static property to avoid repeated queries
        if (self::$hasNewTables === null) {
            self::$hasNewTables = Schema::hasTable('homepage_sections');
        }

        if (self::$hasNewTables) {
            return $this->getDynamicHomePageData();
        }

        return $this->getLegacyHomePageData();
    }

    public function getDynamicHomePageData(): array
    {
        // Get ALL sections ordered (include disabled so frontend knows sort_order)
        $allSections = HomepageSection::ordered()->get()->keyBy('key');

        // Get section settings with sort_order for dynamic rendering
        $sectionSettings = $allSections->mapWithKeys(function ($section) {
            return [$section->key => [
                'title' => $section->title,
                'subtitle' => $section->subtitle,
                'is_enabled' => $section->is_enabled,
                'sort_order' => $section->sort_order,
                'settings' => is_string($section->settings) ? json_decode($section->settings, true) : $section->settings,
            ]];
        });

        // Filter to enabled sections for data fetching
        $sections = $allSections->filter(fn($s) => $s->is_enabled);

        $categoriesSection = $sections->get('categories');
        $categoriesSettings = $categoriesSection?->settings ?? [];

        $categories = $this->getCategories($categoriesSettings);

        $featuredSection = $sections->get('featured_products');
        $featuredSettings = $featuredSection?->settings ?? [];
        $featuredProducts = $this->getFeaturedProducts($featuredSettings);

        $newArrivalsSection = $sections->get('new_arrivals');
        $newArrivalsSettings = $newArrivalsSection?->settings ?? [];
        $newArrivals = $this->getNewArrivals($newArrivalsSettings);

        $bestsellersSection = $sections->get('bestsellers');
        $bestsellersSettings = $bestsellersSection?->settings ?? [];
        $bestsellers = $this->getBestsellers($bestsellersSettings);

        $banners = $this->getBanners();
        $stats = $this->getStats();
        $features = $this->getFeatures();
        $testimonials = $this->getTestimonials();
        $trustBadges = $this->getTrustBadges();
        $notableClients = $this->getNotableClients();
        $videoCategories = $this->getVideoCategories($categoriesSettings);
        $settings = $this->getSettings();

        return [
            'sections' => $sectionSettings,
            'banners' => $banners,
            'categories' => $categories,
            'video_categories' => $videoCategories,
            'featured_products' => $featuredProducts,
            'new_arrivals' => $newArrivals,
            'bestsellers' => $bestsellers,
            'stats' => $stats,
            'features' => $features,
            'testimonials' => $testimonials,
            'trust_badges' => $trustBadges,
            'notable_clients' => $notableClients,
            'settings' => $settings,
        ];
    }

    public function getLegacyHomePageData(): array
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
        $settings = $this->getSettings();

        return [
            'banners' => $banners,
            'categories' => $categories,
            'featured_products' => $featuredProducts,
            'new_arrivals' => $newArrivals,
            'bestsellers' => $bestsellers,
            'testimonials' => [],
            'notable_clients' => [],
            'settings' => $settings,
        ];
    }

    public function getCategories(array $categoriesSettings): mixed
    {
        $categoriesCount = $categoriesSettings['display_count'] ?? 6;

        // Eager load category with products_count to avoid N+1 queries
        $homepageCategories = HomepageCategory::visible()
            ->ordered()
            ->with(['category' => function ($query) {
                $query->withCount('products');
            }])
            ->get();

        if ($homepageCategories->isNotEmpty()) {
            // Use manually selected categories
            return $homepageCategories
                ->take($categoriesCount)
                ->map(function ($hc) {
                    $cat = $hc->category;
                    return $cat ? [
                        'id' => $cat->id,
                        'name' => $cat->name,
                        'slug' => $cat->slug,
                        'image' => $cat->image,
                        'icon' => $cat->icon,
                        'description' => $cat->description,
                        'features' => $cat->features,
                        'products_count' => $cat->products_count ?? 0,
                    ] : null;
                })
                ->filter()
                ->values();
        }

        // Fallback to auto categories
        return Category::withCount('products')
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
                    'description' => $cat->description,
                    'features' => $cat->features,
                    'products_count' => $cat->products_count,
                ];
            });
    }

    public function getFeaturedProducts(array $settings): mixed
    {
        $count = $settings['display_count'] ?? 10;
        $source = $settings['source'] ?? 'auto';

        if ($source === 'manual') {
            return HomepageProduct::visible()
                ->section('featured')
                ->ordered()
                ->with(['product.images', 'product.category'])
                ->take($count)
                ->get()
                ->map(fn($hp) => $hp->product)
                ->filter()
                ->map(fn($p) => $this->formatProduct($p));
        }

        return Product::with(['images', 'category'])
            ->active()
            ->featured()
            ->orderByDesc('created_at')
            ->limit($count)
            ->get()
            ->map(fn($p) => $this->formatProduct($p));
    }

    public function getNewArrivals(array $settings): mixed
    {
        $count = $settings['display_count'] ?? 5;
        $source = $settings['source'] ?? 'auto';

        if ($source === 'manual') {
            return HomepageProduct::visible()
                ->section('new_arrivals')
                ->ordered()
                ->with(['product.images', 'product.category'])
                ->take($count)
                ->get()
                ->map(fn($hp) => $hp->product)
                ->filter()
                ->map(fn($p) => $this->formatProduct($p));
        }

        return Product::with(['images', 'category'])
            ->active()
            ->new()
            ->orderByDesc('created_at')
            ->limit($count)
            ->get()
            ->map(fn($p) => $this->formatProduct($p));
    }

    public function getBestsellers(array $settings): mixed
    {
        $count = $settings['display_count'] ?? 10;
        $source = $settings['source'] ?? 'auto';

        if ($source === 'manual') {
            return HomepageProduct::visible()
                ->section('bestsellers')
                ->ordered()
                ->with(['product.images', 'product.category'])
                ->take($count)
                ->get()
                ->map(fn($hp) => $hp->product)
                ->filter()
                ->map(fn($p) => $this->formatProduct($p));
        }

        return Product::with(['images', 'category'])
            ->active()
            ->bestseller()
            ->orderByDesc('sales_count')
            ->limit($count)
            ->get()
            ->map(fn($p) => $this->formatProduct($p));
    }

    public function getBanners(): mixed
    {
        return Banner::active()
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
    }

    public function getStats(): mixed
    {
        $productsSold = $this->getProductsSoldCount();

        return HomepageStat::visible()->ordered()->get()->map(function ($stat) use ($productsSold) {
            $value = $stat->value;

            // Only override "Products Sold" if we have real order/sales data (non-null)
            if ($productsSold !== null &&
                (stripos($stat->label, 'Products Sold') !== false || stripos($stat->label, 'Sold') !== false)) {
                $value = $productsSold;
            }

            return [
                'label' => $stat->label,
                'value' => $value,
                'icon' => $stat->icon,
            ];
        });
    }

    public function getFeatures(): mixed
    {
        return HomepageFeature::visible()->ordered()->get()->map(function ($feature) {
            return [
                'title' => $feature->title,
                'description' => $feature->description,
                'icon' => $feature->icon,
                'color' => $feature->color,
            ];
        });
    }

    public function getTestimonials(): mixed
    {
        return Testimonial::visible()->ordered()->get()->map(function ($t) {
            return [
                'name' => $t->name,
                'role' => $t->role,
                'content' => $t->content,
                'image' => $t->image,
                'rating' => $t->rating,
            ];
        });
    }

    public function getTrustBadges(): mixed
    {
        return HomepageTrustBadge::visible()->ordered()->get()->map(function ($badge) {
            return [
                'title' => $badge->title,
                'image' => $badge->image,
            ];
        });
    }

    public function getNotableClients(): mixed
    {
        return NotableClient::visible()->withLogo()->ordered()->get()->map(function ($client) {
            return [
                'id' => $client->id,
                'name' => $client->name,
                'logo' => $client->logo,
                'website' => $client->website,
            ];
        });
    }

    public function getVideoCategories(array $categoriesSettings): mixed
    {
        $categoryVideoSlugs = array_keys($categoriesSettings['category_videos'] ?? []);

        if (empty($categoryVideoSlugs)) {
            return [];
        }

        return Category::withCount('products')
            ->active()
            ->whereIn('slug', $categoryVideoSlugs)
            ->ordered()
            ->get()
            ->map(function ($cat) {
                return [
                    'id' => $cat->id,
                    'name' => $cat->name,
                    'slug' => $cat->slug,
                    'image' => $cat->image,
                    'icon' => $cat->icon,
                    'description' => $cat->description,
                    'features' => $cat->features,
                    'products_count' => $cat->products_count,
                ];
            });
    }

    public function getSettings(): array
    {
        return [
            'phone' => Setting::get('phone', '+92 XXX XXXXXXX'),
            'email' => Setting::get('email', 'info@fischerpk.com'),
            'address' => Setting::get('address'),
            'whatsapp' => Setting::get('whatsapp_number'),
            'social_facebook' => Setting::get('facebook_url'),
            'social_instagram' => Setting::get('instagram_url'),
        ];
    }

    /**
     * Get formatted products sold count.
     * Returns null if no real sales data (so admin-set values are kept).
     */
    public function getProductsSoldCount(): ?string
    {
        try {
            // Get total quantity of products sold from order items
            $totalSold = OrderItem::whereHas('order', function ($query) {
                $query->whereIn('status', ['completed', 'delivered', 'processing', 'shipped']);
            })->sum('quantity');

            // Fallback to products' sales_count if no order items
            if ($totalSold <= 0) {
                $totalSold = Product::sum('sales_count');
            }

            // Only override admin value if we have significant real sales data (>= 1000)
            // Below that, the admin-set value is more meaningful for display
            if ($totalSold >= 1000000) {
                return round($totalSold / 1000000, 1) . 'M+';
            } elseif ($totalSold >= 1000) {
                return round($totalSold / 1000, 1) . 'K+';
            }

            // Return null for small numbers - admin-set value should be kept
            return null;
        } catch (\Exception $e) {
            return null;
        }
    }

    public function formatProduct($product): array
    {
        return [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'price' => $product->price,
            'compare_price' => $product->compare_price,
            'primary_image' => $product->primary_image,
            'images' => $product->images ? $product->images->map(fn($img) => [
                'id' => $img->id,
                'image' => $img->image,
                'is_primary' => $img->is_primary,
            ])->toArray() : [],
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
}
