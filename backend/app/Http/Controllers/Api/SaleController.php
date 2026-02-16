<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;

class SaleController extends Controller
{
    public function index()
    {
        $sales = Sale::active()
            ->withCount('saleProducts as products_count')
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($sale) {
                return [
                    'id' => $sale->id,
                    'name' => $sale->name,
                    'slug' => $sale->slug,
                    'description' => $sale->description,
                    'banner_image' => $sale->banner_image,
                    'start_date' => $sale->start_date,
                    'end_date' => $sale->end_date,
                    'products_count' => $sale->products_count,
                ];
            });

        return $this->success($sales);
    }

    public function show($slug)
    {
        $sale = Sale::where('slug', $slug)->active()->first();

        if (!$sale) {
            return $this->error('Sale not found', 404);
        }

        $products = $sale->products()
            ->where('products.is_active', true)
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'price' => $product->price,
                    'compare_price' => $product->compare_price,
                    'sale_price' => $product->pivot->sale_price,
                    'primary_image' => $product->primary_image,
                    'images' => $product->images->map(fn($img) => [
                        'id' => $img->id,
                        'url' => $img->url,
                        'is_primary' => $img->is_primary,
                    ]),
                    'discount_percentage' => $product->discount_percentage,
                    'average_rating' => $product->average_rating,
                    'reviews_count' => $product->reviews_count,
                    'category' => $product->category ? [
                        'id' => $product->category->id,
                        'name' => $product->category->name,
                        'slug' => $product->category->slug,
                    ] : null,
                ];
            });

        return $this->success([
            'id' => $sale->id,
            'name' => $sale->name,
            'slug' => $sale->slug,
            'description' => $sale->description,
            'banner_image' => $sale->banner_image,
            'start_date' => $sale->start_date,
            'end_date' => $sale->end_date,
            'products' => $products,
        ]);
    }
}
