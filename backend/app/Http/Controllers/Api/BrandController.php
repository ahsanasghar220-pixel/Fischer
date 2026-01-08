<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Brand;

class BrandController extends Controller
{
    public function index()
    {
        $brands = Brand::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return $this->success($brands);
    }

    public function show(string $slug)
    {
        $brand = Brand::where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        return $this->success($brand);
    }
}
