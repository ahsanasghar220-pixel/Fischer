<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\HomepageContentService;
use Illuminate\Http\Request;

class HomepageController extends Controller
{
    public function __construct(private HomepageContentService $service) {}

    /**
     * Get all homepage settings
     */
    public function index()
    {
        try {
            return $this->success($this->service->getAllSettings());
        } catch (\Exception $e) {
            \Log::error('Homepage index error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->error('Failed to load homepage settings: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update section settings
     */
    public function updateSection(Request $request, $key)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:500',
            'is_enabled' => 'boolean',
            'settings' => 'nullable|array',
        ]);

        $section = $this->service->updateSection($key, $validated);

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

        $this->service->reorderSections($validated['sections']);

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

        $stats = $this->service->updateStats($validated['stats']);

        return $this->success($stats, 'Stats updated successfully');
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

        $features = $this->service->updateFeatures($validated['features']);

        return $this->success($features, 'Features updated successfully');
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

        $badges = $this->service->updateTrustBadges($validated['badges']);

        return $this->success($badges, 'Trust badges updated successfully');
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

        $categories = $this->service->updateCategories($validated['categories']);

        return $this->success($categories, 'Homepage categories updated successfully');
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

        $products = $this->service->updateProducts($section, $validated['products']);

        return $this->success($products, 'Products updated successfully');
    }

    /**
     * CRUD for testimonials
     */
    public function getTestimonials()
    {
        return $this->success($this->service->getTestimonials());
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

        $testimonial = $this->service->storeTestimonial($validated);

        return $this->success($testimonial, 'Testimonial created successfully');
    }

    public function updateTestimonial(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'string|max:100',
            'role' => 'nullable|string',
            'content' => 'string|max:1000',
            'image' => 'nullable|string',
            'rating' => 'integer|min:1|max:5',
            'sort_order' => 'integer',
            'is_visible' => 'boolean',
        ]);

        $testimonial = $this->service->updateTestimonial((int) $id, $validated);

        return $this->success($testimonial, 'Testimonial updated successfully');
    }

    public function deleteTestimonial($id)
    {
        $this->service->deleteTestimonial((int) $id);

        return $this->success(null, 'Testimonial deleted successfully');
    }

    /**
     * CRUD for banners
     */
    public function getBanners()
    {
        return $this->success($this->service->getBanners());
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

        $banner = $this->service->storeBanner($validated);

        return $this->success($banner, 'Banner created successfully');
    }

    public function updateBanner(Request $request, $id)
    {
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

        $banner = $this->service->updateBanner((int) $id, $validated);

        return $this->success($banner, 'Banner updated successfully');
    }

    public function deleteBanner($id)
    {
        $this->service->deleteBanner((int) $id);

        return $this->success(null, 'Banner deleted successfully');
    }

    /**
     * Update notable clients
     */
    public function updateNotableClients(Request $request)
    {
        $validated = $request->validate([
            'clients' => 'required|array',
            'clients.*.id' => 'nullable|integer',
            'clients.*.name' => 'required|string|max:100',
            'clients.*.logo' => 'nullable|string',
            'clients.*.website' => 'nullable|string|max:255',
            'clients.*.sort_order' => 'integer',
            'clients.*.is_visible' => 'boolean',
        ]);

        $clients = $this->service->updateNotableClients($validated['clients']);

        return $this->success($clients, 'Notable clients updated successfully');
    }

    /**
     * Upload hero product image
     */
    public function uploadHeroImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        $path = $request->file('image')->store('hero-products', 'public');

        return $this->success([
            'path' => '/storage/' . $path,
            'url' => asset('storage/' . $path),
        ], 'Hero image uploaded successfully');
    }

    /**
     * Upload client logo
     */
    public function uploadClientLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
        ]);

        $path = $request->file('logo')->store('clients', 'public');

        return $this->success([
            'path' => '/storage/' . $path,
            'url' => asset('storage/' . $path),
        ], 'Logo uploaded successfully');
    }

    /**
     * Upload video file (hero, category, etc.)
     */
    public function uploadVideo(Request $request)
    {
        $request->validate([
            'video' => 'required|file|mimes:mp4,webm,mov|max:102400',
            'type' => 'required|string|in:hero,category,general',
        ]);

        $type = $request->input('type', 'general');
        $path = $request->file('video')->store("videos/{$type}", 'public');

        return $this->success([
            'path' => '/storage/' . $path,
            'url' => asset('storage/' . $path),
        ], 'Video uploaded successfully');
    }
}
