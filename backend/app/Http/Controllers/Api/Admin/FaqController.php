<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FaqController extends Controller
{
    public function index(Request $request)
    {
        try {
            $faqs = DB::table('faqs')->orderBy('sort_order')->paginate(15);

            return $this->success([
                'data' => $faqs->items(),
                'meta' => [
                    'current_page' => $faqs->currentPage(),
                    'last_page' => $faqs->lastPage(),
                    'total' => $faqs->total(),
                ],
            ]);
        } catch (\Exception $e) {
            return $this->success(['data' => [], 'meta' => ['current_page' => 1, 'last_page' => 1, 'total' => 0]]);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'question' => 'required|string|max:500',
            'answer' => 'required|string',
            'category_id' => 'nullable|integer',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        try {
            $id = DB::table('faqs')->insertGetId($validated);
            $faq = DB::table('faqs')->find($id);

            return $this->success(['data' => $faq], 'FAQ created successfully', 201);
        } catch (\Exception $e) {
            return $this->error('Failed to create FAQ: ' . $e->getMessage(), 500);
        }
    }

    public function show($id)
    {
        $faq = DB::table('faqs')->find($id);

        if (!$faq) {
            return $this->error('FAQ not found', 404);
        }

        return $this->success(['data' => $faq]);
    }

    public function update(Request $request, $id)
    {
        $faq = DB::table('faqs')->find($id);

        if (!$faq) {
            return $this->error('FAQ not found', 404);
        }

        $validated = $request->validate([
            'question' => 'sometimes|string|max:500',
            'answer' => 'sometimes|string',
            'category_id' => 'nullable|integer',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        DB::table('faqs')->where('id', $id)->update($validated);

        return $this->success(['data' => DB::table('faqs')->find($id)], 'FAQ updated successfully');
    }

    public function destroy($id)
    {
        DB::table('faqs')->where('id', $id)->delete();

        return $this->success(null, 'FAQ deleted successfully');
    }
}
