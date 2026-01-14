<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\HomepageSection;
use App\Models\HomepageCategory;
use App\Models\HomepageProduct;
use App\Models\HomepageStat;
use App\Models\HomepageFeature;
use App\Models\HomepageTrustBadge;
use App\Models\Testimonial;
use App\Models\Banner;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class HomepageController extends Controller
{
    /**
     * Get all homepage settings
     */
    public function index()
    {
        $data = [
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

        return $this->success($data);
    }

    /**
     * Update section settings
     */
    public function updateSection(Request $request, $key)
    {
        $section = HomepageSection::where('key', $key)->firstOrFail();

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:500',
            'is_enabled' => 'boolean',
            'settings' => 'nullable|array',
        ]);

        // Merge new settings with existing
        if (isset($validated['settings'])) {
            $currentSettings = $section->settings ?? [];
            $validated['settings'] = array_merge($currentSettings, $validated['settings']);
        }

        $section->update($validated);

        $this->clearCache();

        return $this->success($section, 'Section updated successfully');
    }

    /**
     * Reorder sections
     */
    public function reorderSections(Request $request)
    {
        $validated = $request->validate([
            'sections' => 'required|array',
            'sections.*.key' => 'required|string',
            'sections.*.sort_order' => 'required|integer',
        ]);

        DB::transaction(function () use ($validated) {
            foreach ($validated['sections'] as $item) {
                HomepageSection::where('key', $item['key'])
                    ->update(['sort_order' => $item['sort_order']]);
            }
        });

        $this->clearCache();

        return $this->success(null, 'Sections reordered successfully');
    }

    /**
     * Update stats
     */
    public function updateStats(Request $request)
    {
        $validated = $request->validate([
            'stats' => 'required|array',
            'stats.*.id' => 'nullable|integer',
            'stats.*.label' => 'required|string|max:100',
            'stats.*.value' => 'required|string|max:50',
            'stats.*.icon' => 'nullable|string|max:50',
            'stats.*.sort_order' => 'integer',
            'stats.*.is_visible' => 'boolean',
        ]);

        DB::transaction(function () use ($validated) {
            // Get existing IDs
            $existingIds = collect($validated['stats'])
                ->pluck('id')
                ->filter()
                ->toArray();

            // Delete removed stats
            HomepageStat::whereNotIn('id', $existingIds)->delete();

            // Update or create stats
            foreach ($validated['stats'] as $index => $stat) {
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

        return $this->success(HomepageStat::ordered()->get(), 'Stats updated successfully');
    }

    /**
     * Update features
     */
    public function updateFeatures(Request $request)
    {
        $validated = $request->validate([
            'features' => 'required|array',
            'features.*.id' => 'nullable|integer',
            'features.*.title' => 'required|string|max:100',
            'features.*.description' => 'nullable|string|max:255',
            'features.*.icon' => 'nullable|string|max:50',
            'features.*.color' => 'nullable|string|max:50',
            'features.*.sort_order' => 'integer',
            'features.*.is_visible' => 'boolean',
        ]);

        DB::transaction(function () use ($validated) {
            $existingIds = collect($validated['features'])
                ->pluck('id')
                ->filter()
                ->toArray();

            HomepageFeature::whereNotIn('id', $existingIds)->delete();

            foreach ($validated['features'] as $index => $feature) {
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

        return $this->success(HomepageFeature::ordered()->get(), 'Features updated successfully');
    }

    /**
     * Update trust badges
     */
    public function updateTrustBadges(Request $request)
    {
        $validated = $request->validate([
            'badges' => 'required|array',
            'badges.*.id' => 'nullable|integer',
            'badges.*.title' => 'required|string|max:100',
            'badges.*.image' => 'nullable|string',
            'badges.*.sort_order' => 'integer',
            'badges.*.is_visible' => 'boolean',
        ]);

        DB::transaction(function () use ($validated) {
            $existingIds = collect($validated['badges'])
                ->pluck('id')
                ->filter()
                ->toArray();

            HomepageTrustBadge::whereNotIn('id', $existingIds)->delete();

            foreach ($validated['badges'] as $index => $badge) {
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

        return $this->success(HomepageTrustBadge::ordered()->get(), 'Trust badges updated successfully');
    }

    /**
     * Update homepage categories
     */
    public function updateCategories(Request $request)
    {
        $validated = $request->validate([
            'categories' => 'required|array',
            'categories.*.category_id' => 'required|integer|exists:categories,id',
            'categories.*.sort_order' => 'integer',
            'categories.*.is_visible' => 'boolean',
        ]);

        // Clear existing homepage categories (outside transaction since truncate auto-commits)
        HomepageCategory::query()->delete();

        // Insert new ones
        foreach ($validated['categories'] as $index => $cat) {
            HomepageCategory::create([
                'category_id' => $cat['category_id'],
                'sort_order' => $cat['sort_order'] ?? $index,
                'is_visible' => $cat['is_visible'] ?? true,
            ]);
        }

        $this->clearCache();

        return $this->success(
            HomepageCategory::with('category:id,name,slug,image,icon')->ordered()->get(),
            'Homepage categories updated successfully'
        );
    }

    /**
     * Update homepage products for a section
     */
    public function updateProducts(Request $request, $section)
    {
        $validated = $request->validate([
            'products' => 'required|array',
            'products.*.product_id' => 'required|integer|exists:products,id',
            'products.*.sort_order' => 'integer',
            'products.*.is_visible' => 'boolean',
        ]);

        DB::transaction(function () use ($validated, $section) {
            // Clear existing products for this section
            HomepageProduct::where('section', $section)->delete();

            // Insert new ones
            foreach ($validated['products'] as $index => $prod) {
                HomepageProduct::create([
                    'product_id' => $prod['product_id'],
                    'section' => $section,
                    'sort_order' => $prod['sort_order'] ?? $index,
                    'is_visible' => $prod['is_visible'] ?? true,
                ]);
            }
        });

        $this->clearCache();

        return $this->success(
            HomepageProduct::with(['product' => function ($q) {
                    $q->select('id', 'name', 'slug', 'price', 'sku')->with('images');
                }])
                ->section($section)
                ->ordered()
                ->get(),
            'Products updated successfully'
        );
    }

    /**
     * CRUD for testimonials
     */
    public function getTestimonials()
    {
        return $this->success(Testimonial::ordered()->get());
    }

    public function storeTestimonial(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'role' => 'nullable|string|max:100',
            'content' => 'required|string|max:1000',
            'image' => 'nullable|string',
            'rating' => 'integer|min:1|max:5',
            'sort_order' => 'integer',
            'is_visible' => 'boolean',
        ]);

        // Map API fields to database columns
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

        return $this->success($testimonial, 'Testimonial created successfully');
    }

    public function updateTestimonial(Request $request, $id)
    {
        $testimonial = Testimonial::findOrFail($id);

        $validated = $request->validate([
            'name' => 'string|max:100',
            'role' => 'nullable|string',
            'content' => 'string|max:1000',
            'image' => 'nullable|string',
            'rating' => 'integer|min:1|max:5',
            'sort_order' => 'integer',
            'is_visible' => 'boolean',
        ]);

        // Map API fields to database columns
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

        return $this->success($testimonial, 'Testimonial updated successfully');
    }

    public function deleteTestimonial($id)
    {
        $testimonial = Testimonial::findOrFail($id);
        $testimonial->delete();

        $this->clearCache();

        return $this->success(null, 'Testimonial deleted successfully');
    }

    /**
     * CRUD for banners
     */
    public function getBanners()
    {
        return $this->success(Banner::orderBy('sort_order')->get());
    }

    public function storeBanner(Request $request)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:500',
            'image' => 'required|string',
            'mobile_image' => 'nullable|string',
            'button_text' => 'nullable|string|max:50',
            'button_link' => 'nullable|string|max:255',
            'position' => 'string|in:hero,promo,sidebar',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date',
        ]);

        $banner = Banner::create($validated);

        $this->clearCache();

        return $this->success($banner, 'Banner created successfully');
    }

    public function updateBanner(Request $request, $id)
    {
        $banner = Banner::findOrFail($id);

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:500',
            'image' => 'string',
            'mobile_image' => 'nullable|string',
            'button_text' => 'nullable|string|max:50',
            'button_link' => 'nullable|string|max:255',
            'position' => 'string|in:hero,promo,sidebar',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date',
        ]);

        $banner->update($validated);

        $this->clearCache();

        return $this->success($banner, 'Banner updated successfully');
    }

    public function deleteBanner($id)
    {
        $banner = Banner::findOrFail($id);
        $banner->delete();

        $this->clearCache();

        return $this->success(null, 'Banner deleted successfully');
    }

    /**
     * Clear homepage cache
     */
    protected function clearCache()
    {
        Cache::forget('homepage_data');
        Cache::forget('homepage_sections');
    }
}
