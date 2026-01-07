<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Models\Faq;
use App\Models\FaqCategory;

class PageController extends Controller
{
    public function show(string $slug)
    {
        $page = Page::published()
            ->where('slug', $slug)
            ->firstOrFail();

        return $this->success([
            'page' => $page,
        ]);
    }

    public function faqs()
    {
        $categories = FaqCategory::where('is_active', true)
            ->orderBy('sort_order')
            ->with(['faqs' => function ($query) {
                $query->where('is_active', true)->orderBy('sort_order');
            }])
            ->get();

        // Also get uncategorized FAQs
        $uncategorizedFaqs = Faq::whereNull('faq_category_id')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return $this->success([
            'categories' => $categories,
            'uncategorized' => $uncategorizedFaqs,
        ]);
    }
}
