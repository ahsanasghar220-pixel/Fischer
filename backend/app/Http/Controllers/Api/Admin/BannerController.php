<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;

class BannerController extends Controller
{
    public function index(Request $request)
    {
        $query = Banner::query();

        if ($position = $request->get('position')) {
            $query->where('position', $position);
        }

        $banners = $query->orderBy('sort_order')->paginate(15);

        return $this->success([
            'data' => $banners->items(),
            'meta' => [
                'current_page' => $banners->currentPage(),
                'last_page' => $banners->lastPage(),
                'total' => $banners->total(),
            ],
        ]);
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

        return $this->success(['data' => $banner], 'Banner created successfully', 201);
    }

    public function show($id)
    {
        $banner = Banner::findOrFail($id);
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

        return $this->success(['data' => $banner->fresh()], 'Banner updated successfully');
    }

    public function destroy($id)
    {
        $banner = Banner::findOrFail($id);
        $banner->delete();

        return $this->success(null, 'Banner deleted successfully');
    }
}
