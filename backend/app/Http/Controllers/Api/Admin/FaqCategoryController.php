<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FaqCategoryController extends Controller
{
    public function index(Request $request)
    {
        try {
            $categories = DB::table('faq_categories')->orderBy('name')->paginate(15);

            return $this->success([
                'data' => $categories->items(),
                'meta' => [
                    'current_page' => $categories->currentPage(),
                    'last_page' => $categories->lastPage(),
                    'total' => $categories->total(),
                ],
            ]);
        } catch (\Exception $e) {
            return $this->success(['data' => [], 'meta' => ['current_page' => 1, 'last_page' => 1, 'total' => 0]]);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'sort_order' => 'nullable|integer',
        ]);

        try {
            $id = DB::table('faq_categories')->insertGetId($validated);
            $category = DB::table('faq_categories')->find($id);

            return $this->success(['data' => $category], 'FAQ Category created successfully', 201);
        } catch (\Exception $e) {
            return $this->error('Failed to create FAQ Category: ' . $e->getMessage(), 500);
        }
    }

    public function show($id)
    {
        $category = DB::table('faq_categories')->find($id);

        if (!$category) {
            return $this->error('FAQ Category not found', 404);
        }

        return $this->success(['data' => $category]);
    }

    public function update(Request $request, $id)
    {
        $category = DB::table('faq_categories')->find($id);

        if (!$category) {
            return $this->error('FAQ Category not found', 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'sort_order' => 'nullable|integer',
        ]);

        DB::table('faq_categories')->where('id', $id)->update($validated);

        return $this->success(['data' => DB::table('faq_categories')->find($id)], 'FAQ Category updated successfully');
    }

    public function destroy($id)
    {
        DB::table('faq_categories')->where('id', $id)->delete();

        return $this->success(null, 'FAQ Category deleted successfully');
    }
}
