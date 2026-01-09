<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PageController extends Controller
{
    public function index(Request $request)
    {
        $query = Page::query();

        // Search
        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $pages = $query->orderByDesc('updated_at')->paginate(15);

        // Transform for frontend
        $transformedPages = collect($pages->items())->map(function ($page) {
            return [
                'id' => $page->id,
                'title' => $page->title,
                'slug' => $page->slug,
                'content' => $page->content,
                'meta_title' => $page->meta_title,
                'meta_description' => $page->meta_description,
                'is_active' => (bool) ($page->is_active ?? true),
                'created_at' => $page->created_at->toISOString(),
                'updated_at' => $page->updated_at->toISOString(),
            ];
        });

        return $this->success([
            'data' => $transformedPages,
            'meta' => [
                'current_page' => $pages->currentPage(),
                'last_page' => $pages->lastPage(),
                'total' => $pages->total(),
            ],
        ]);
    }

    public function show($id)
    {
        $page = Page::findOrFail($id);

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

        return $this->success([
            'data' => $page->fresh(),
        ], 'Page updated successfully');
    }

    public function destroy($id)
    {
        $page = Page::findOrFail($id);
        $page->delete();

        return $this->success(null, 'Page deleted successfully');
    }
}
