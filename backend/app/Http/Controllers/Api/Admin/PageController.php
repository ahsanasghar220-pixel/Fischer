<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class PageController extends Controller
{
    public function index(Request $request)
    {
        try {
            $page = $request->get('page', 1);
            $search = $request->get('search');
            $perPage = 15;

            // Raw query for maximum speed
            $query = DB::table('pages')
                ->select([
                    'id', 'title', 'slug', 'content', 'meta_title',
                    'meta_description', 'status', 'created_at', 'updated_at',
                ])
                ->whereNull('deleted_at');

            // Search
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('slug', 'like', "%{$search}%");
                });
            }

            // Get total
            $total = $query->count();

            // Get paginated results
            $pages = $query->orderByDesc('updated_at')
                ->offset(($page - 1) * $perPage)
                ->limit($perPage)
                ->get();

            // Transform
            $transformedPages = $pages->map(function ($pg) {
                return [
                    'id' => $pg->id,
                    'title' => $pg->title,
                    'slug' => $pg->slug,
                    'content' => $pg->content,
                    'meta_title' => $pg->meta_title,
                    'meta_description' => $pg->meta_description,
                    'is_active' => ($pg->status ?? 'draft') === 'published',
                    'status' => $pg->status ?? 'draft',
                    'created_at' => $pg->created_at,
                    'updated_at' => $pg->updated_at,
                ];
            });

            return $this->success([
                'data' => $transformedPages,
                'meta' => [
                    'current_page' => (int) $page,
                    'last_page' => (int) ceil($total / $perPage),
                    'total' => $total,
                ],
            ]);
        } catch (\Exception $e) {
            return $this->error('Failed to load pages: ' . $e->getMessage(), 500);
        }
    }

    public function show($id)
    {
        $page = DB::table('pages')
            ->where('id', $id)
            ->whereNull('deleted_at')
            ->first();

        if (!$page) {
            return $this->error('Page not found', 404);
        }

        return $this->success([
            'data' => $page,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:pages,slug',
            'content' => 'required|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        // Generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        $page = Page::create($validated);

        // Clear cache
        Cache::forget('admin_pages_list');

        return $this->success([
            'data' => $page,
        ], 'Page created successfully', 201);
    }

    public function update(Request $request, $id)
    {
        $page = Page::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:pages,slug,' . $id,
            'content' => 'sometimes|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        $page->update($validated);

        // Clear cache
        Cache::forget('admin_pages_list');

        return $this->success([
            'data' => $page->fresh(),
        ], 'Page updated successfully');
    }

    public function destroy($id)
    {
        $page = Page::findOrFail($id);
        $page->delete();

        // Clear cache
        Cache::forget('admin_pages_list');

        return $this->success(null, 'Page deleted successfully');
    }
}
