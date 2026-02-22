<?php

namespace App\Services;

use App\Models\HomepageSection;
use App\Models\HomepageCategory;
use App\Models\HomepageProduct;
use App\Models\HomepageStat;
use App\Models\HomepageFeature;
use App\Models\HomepageTrustBadge;
use App\Models\NotableClient;
use App\Models\Testimonial;
use App\Models\Banner;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class HomepageContentService
{
    // -------------------------------------------------------------------------
    // Index
    // -------------------------------------------------------------------------

    public function getAllSettings(): array
    {
        // Auto-seed sections if table is empty (handles fresh deploys)
        if (HomepageSection::count() === 0) {
            \Artisan::call('db:seed', ['--class' => 'HomepageSeeder', '--force' => true]);
        }

        return [
            'sections' => HomepageSection::ordered()->get(),
            'stats' => HomepageStat::ordered()->get(),
            'features' => HomepageFeature::ordered()->get(),
            'testimonials' => Testimonial::ordered()->get(),
            'trust_badges' => HomepageTrustBadge::ordered()->get(),
            'homepage_categories' => HomepageCategory::with('category:id,name,slug,image,icon')
                ->visible()
                ->ordered()
                ->get(),
            'homepage_products' => HomepageProduct::with(['product' => function ($q) {
                    $q->select('id', 'name', 'slug', 'price', 'sku')->with('images');
                }])
                ->visible()
                ->ordered()
                ->get(),
            'banners' => Banner::orderBy('sort_order')->get(),
            'notable_clients' => NotableClient::ordered()->get(),
            // For selection dropdowns
            'all_categories' => Category::select('id', 'name', 'slug', 'image', 'icon')
                ->where('is_active', true)
                ->withCount('products')
                ->orderBy('name')
                ->get(),
            'all_products' => Product::select('id', 'name', 'slug', 'price', 'sku')
                ->with('images')
                ->where('is_active', true)
                ->orderBy('name')
                ->limit(500)
                ->get(),
        ];
    }

    // -------------------------------------------------------------------------
    // Section management
    // -------------------------------------------------------------------------

    public function updateSection(string $key, array $validated): HomepageSection
    {
        $section = HomepageSection::where('key', $key)->firstOrFail();

        // Merge new settings with existing
        if (isset($validated['settings'])) {
            $currentSettings = $section->settings ?? [];
            $validated['settings'] = array_merge($currentSettings, $validated['settings']);
        }

        $section->update($validated);
        $this->clearCache();

        return $section;
    }

    public function reorderSections(array $sections): void
    {
        DB::transaction(function () use ($sections) {
            foreach ($sections as $item) {
                HomepageSection::where('key', $item['key'])
                    ->update(['sort_order' => $item['sort_order']]);
            }
        });

        $this->clearCache();
    }

    // -------------------------------------------------------------------------
    // Stats
    // -------------------------------------------------------------------------

    public function updateStats(array $stats): mixed
    {
        DB::transaction(function () use ($stats) {
            $existingIds = collect($stats)->pluck('id')->filter()->toArray();

            HomepageStat::whereNotIn('id', $existingIds)->delete();

            foreach ($stats as $index => $stat) {
                HomepageStat::updateOrCreate(
                    ['id' => $stat['id'] ?? null],
                    [
                        'label' => $stat['label'],
                        'value' => $stat['value'],
                        'icon' => $stat['icon'] ?? 'star',
                        'sort_order' => $stat['sort_order'] ?? $index,
                        'is_visible' => $stat['is_visible'] ?? true,
                    ]
                );
            }
        });

        $this->clearCache();

        return HomepageStat::ordered()->get();
    }

    // -------------------------------------------------------------------------
    // Features
    // -------------------------------------------------------------------------

    public function updateFeatures(array $features): mixed
    {
        DB::transaction(function () use ($features) {
            $existingIds = collect($features)->pluck('id')->filter()->toArray();

            HomepageFeature::whereNotIn('id', $existingIds)->delete();

            foreach ($features as $index => $feature) {
                HomepageFeature::updateOrCreate(
                    ['id' => $feature['id'] ?? null],
                    [
                        'title' => $feature['title'],
                        'description' => $feature['description'] ?? '',
                        'icon' => $feature['icon'] ?? 'star',
                        'color' => $feature['color'] ?? 'blue',
                        'sort_order' => $feature['sort_order'] ?? $index,
                        'is_visible' => $feature['is_visible'] ?? true,
                    ]
                );
            }
        });

        $this->clearCache();

        return HomepageFeature::ordered()->get();
    }

    // -------------------------------------------------------------------------
    // Trust badges
    // -------------------------------------------------------------------------

    public function updateTrustBadges(array $badges): mixed
    {
        DB::transaction(function () use ($badges) {
            $existingIds = collect($badges)->pluck('id')->filter()->toArray();

            HomepageTrustBadge::whereNotIn('id', $existingIds)->delete();

            foreach ($badges as $index => $badge) {
                HomepageTrustBadge::updateOrCreate(
                    ['id' => $badge['id'] ?? null],
                    [
                        'title' => $badge['title'],
                        'image' => $badge['image'] ?? null,
                        'sort_order' => $badge['sort_order'] ?? $index,
                        'is_visible' => $badge['is_visible'] ?? true,
                    ]
                );
            }
        });

        $this->clearCache();

        return HomepageTrustBadge::ordered()->get();
    }

    // -------------------------------------------------------------------------
    // Homepage categories
    // -------------------------------------------------------------------------

    public function updateCategories(array $categories): mixed
    {
        // Clear existing homepage categories (outside transaction since truncate auto-commits)
        HomepageCategory::query()->delete();

        foreach ($categories as $index => $cat) {
            HomepageCategory::create([
                'category_id' => $cat['category_id'],
                'sort_order' => $cat['sort_order'] ?? $index,
                'is_visible' => $cat['is_visible'] ?? true,
            ]);
        }

        $this->clearCache();

        return HomepageCategory::with('category:id,name,slug,image,icon')->ordered()->get();
    }

    // -------------------------------------------------------------------------
    // Homepage products
    // -------------------------------------------------------------------------

    public function updateProducts(string $section, array $products): mixed
    {
        DB::transaction(function () use ($section, $products) {
            HomepageProduct::where('section', $section)->delete();

            foreach ($products as $index => $prod) {
                HomepageProduct::create([
                    'product_id' => $prod['product_id'],
                    'section' => $section,
                    'sort_order' => $prod['sort_order'] ?? $index,
                    'is_visible' => $prod['is_visible'] ?? true,
                ]);
            }
        });

        $this->clearCache();

        return HomepageProduct::with(['product' => function ($q) {
                $q->select('id', 'name', 'slug', 'price', 'sku')->with('images');
            }])
            ->section($section)
            ->ordered()
            ->get();
    }

    // -------------------------------------------------------------------------
    // Testimonials
    // -------------------------------------------------------------------------

    public function getTestimonials(): mixed
    {
        return Testimonial::ordered()->get();
    }

    public function storeTestimonial(array $validated): Testimonial
    {
        $data = [
            'customer_name' => $validated['name'],
            'content' => $validated['content'],
            'rating' => $validated['rating'] ?? 5,
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_active' => $validated['is_visible'] ?? true,
            'is_featured' => true,
        ];

        // Parse role into designation and company
        if (!empty($validated['role'])) {
            $parts = array_map('trim', explode(',', $validated['role'], 2));
            $data['customer_designation'] = $parts[0] ?? null;
            $data['customer_company'] = $parts[1] ?? null;
        }

        if (array_key_exists('image', $validated)) {
            $data['customer_image'] = $validated['image'];
        }

        $testimonial = Testimonial::create($data);
        $this->clearCache();

        return $testimonial;
    }

    public function updateTestimonial(int $id, array $validated): Testimonial
    {
        $testimonial = Testimonial::findOrFail($id);

        $data = [];

        if (isset($validated['name'])) {
            $data['customer_name'] = $validated['name'];
        }

        if (isset($validated['content'])) {
            $data['content'] = $validated['content'];
        }

        if (isset($validated['rating'])) {
            $data['rating'] = $validated['rating'];
        }

        if (isset($validated['sort_order'])) {
            $data['sort_order'] = $validated['sort_order'];
        }

        if (isset($validated['is_visible'])) {
            $data['is_active'] = $validated['is_visible'];
        }

        // Parse role into designation and company
        if (array_key_exists('role', $validated)) {
            if (!empty($validated['role'])) {
                $parts = array_map('trim', explode(',', $validated['role'], 2));
                $data['customer_designation'] = $parts[0] ?? null;
                $data['customer_company'] = $parts[1] ?? null;
            } else {
                $data['customer_designation'] = null;
                $data['customer_company'] = null;
            }
        }

        // Handle image - allow setting to null/empty
        if (array_key_exists('image', $validated)) {
            $data['customer_image'] = $validated['image'] ?: null;
        }

        $testimonial->update($data);
        $this->clearCache();

        return $testimonial;
    }

    public function deleteTestimonial(int $id): void
    {
        $testimonial = Testimonial::findOrFail($id);
        $testimonial->delete();
        $this->clearCache();
    }

    // -------------------------------------------------------------------------
    // Banners
    // -------------------------------------------------------------------------

    public function getBanners(): mixed
    {
        return Banner::orderBy('sort_order')->get();
    }

    public function storeBanner(array $validated): Banner
    {
        $banner = Banner::create($validated);
        $this->clearCache();

        return $banner;
    }

    public function updateBanner(int $id, array $validated): Banner
    {
        $banner = Banner::findOrFail($id);
        $banner->update($validated);
        $this->clearCache();

        return $banner;
    }

    public function deleteBanner(int $id): void
    {
        $banner = Banner::findOrFail($id);
        $banner->delete();
        $this->clearCache();
    }

    // -------------------------------------------------------------------------
    // Notable clients
    // -------------------------------------------------------------------------

    public function updateNotableClients(array $clients): mixed
    {
        DB::transaction(function () use ($clients) {
            $existingIds = collect($clients)->pluck('id')->filter()->toArray();

            NotableClient::whereNotIn('id', $existingIds)->delete();

            foreach ($clients as $index => $client) {
                NotableClient::updateOrCreate(
                    ['id' => $client['id'] ?? null],
                    [
                        'name' => $client['name'],
                        'logo' => $client['logo'] ?? null,
                        'website' => $client['website'] ?? null,
                        'sort_order' => $client['sort_order'] ?? $index,
                        'is_visible' => $client['is_visible'] ?? true,
                    ]
                );
            }
        });

        $this->clearCache();

        return NotableClient::ordered()->get();
    }

    // -------------------------------------------------------------------------
    // Cache
    // -------------------------------------------------------------------------

    public function clearCache(): void
    {
        Cache::forget('homepage_data');
        Cache::forget('homepage_sections');
    }
}
