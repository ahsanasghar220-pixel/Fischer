<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class BannerController extends Controller
{
    public function index(Request $request)
    {
        $page = $request->get('page', 1);
        $position = $request->get('position');
        $perPage = 15;

        // Cache banners for 5 minutes when no filters
        $cacheKey = $position ? null : 'admin_banners_list';
        if ($cacheKey && Cache::has($cacheKey)) {
            return $this->success(Cache::get($cacheKey));
        }

        // Raw query for maximum speed
        $query = DB::table('banners')
            ->select([
                'id', 'title', 'subtitle', 'image', 'link',
                'position', 'sort_order', 'is_active',
                'starts_at', 'ends_at', 'created_at',
            ])
            ->whereNull('deleted_at');

        if ($position) {
            $query->where('position', $position);
        }

        // Get total
        $total = $query->count();

        // Get paginated results
        $banners = $query->orderBy('sort_order')
            ->offset(($page - 1) * $perPage)
            ->limit($perPage)
            ->get();

        $result = [
            'data' => $banners,
            'meta' => [
                'current_page' => (int) $page,
                'last_page' => (int) ceil($total / $perPage),
                'total' => $total,
            ],
        ];

        if ($cacheKey) {
            Cache::put($cacheKey, $result, 300);
        }

        return $this->success($result);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'image' => 'required|string',
            'link' => 'nullable|string|max:255',
            'position' => 'required|string|in:hero,sidebar,footer,promotional',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date',
        ]);

        $banner = Banner::create($validated);

        // Clear cache
        Cache::forget('admin_banners_list');

        return $this->success(['data' => $banner], 'Banner created successfully', 201);
    }

    public function show($id)
    {
        $banner = DB::table('banners')
            ->where('id', $id)
            ->whereNull('deleted_at')
            ->first();

        if (!$banner) {
            return $this->error('Banner not found', 404);
        }

        return $this->success(['data' => $banner]);
    }

    public function update(Request $request, $id)
    {
        $banner = Banner::findOrFail($id);

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'image' => 'sometimes|string',
            'link' => 'nullable|string|max:255',
            'position' => 'sometimes|string|in:hero,sidebar,footer,promotional',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date',
        ]);

        $banner->update($validated);

        // Clear cache
        Cache::forget('admin_banners_list');

        return $this->success(['data' => $banner->fresh()], 'Banner updated successfully');
    }

    public function destroy($id)
    {
        $banner = Banner::findOrFail($id);
        $banner->delete();

        // Clear cache
        Cache::forget('admin_banners_list');

        return $this->success(null, 'Banner deleted successfully');
    }
}
