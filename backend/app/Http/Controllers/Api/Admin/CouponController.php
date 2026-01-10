<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class CouponController extends Controller
{
    public function index(Request $request)
    {
        $page = $request->get('page', 1);
        $search = $request->get('search');
        $perPage = 15;

        // Raw query for maximum speed
        $query = DB::table('coupons')
            ->select([
                'id', 'code', 'type', 'value', 'min_order_amount',
                'max_discount', 'usage_limit', 'used_count',
                'starts_at', 'expires_at', 'is_active', 'created_at',
            ])
            ->whereNull('deleted_at');

        if ($search) {
            $query->where('code', 'like', "%{$search}%");
        }

        // Get total
        $total = $query->count();

        // Get paginated results
        $coupons = $query->orderByDesc('created_at')
            ->offset(($page - 1) * $perPage)
            ->limit($perPage)
            ->get();

        return $this->success([
            'data' => $coupons,
            'meta' => [
                'current_page' => (int) $page,
                'last_page' => (int) ceil($total / $perPage),
                'total' => $total,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:coupons,code',
            'type' => 'required|string|in:fixed,percentage',
            'value' => 'required|numeric|min:0',
            'min_order_amount' => 'nullable|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after:starts_at',
            'is_active' => 'boolean',
        ]);

        $coupon = Coupon::create($validated);

        return $this->success(['data' => $coupon], 'Coupon created successfully', 201);
    }

    public function show($id)
    {
        $coupon = DB::table('coupons')
            ->where('id', $id)
            ->whereNull('deleted_at')
            ->first();

        if (!$coupon) {
            return $this->error('Coupon not found', 404);
        }

        return $this->success(['data' => $coupon]);
    }

    public function update(Request $request, $id)
    {
        $coupon = Coupon::findOrFail($id);

        $validated = $request->validate([
            'code' => 'sometimes|string|max:50|unique:coupons,code,' . $id,
            'type' => 'sometimes|string|in:fixed,percentage',
            'value' => 'sometimes|numeric|min:0',
            'min_order_amount' => 'nullable|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        $coupon->update($validated);

        return $this->success(['data' => $coupon->fresh()], 'Coupon updated successfully');
    }

    public function destroy($id)
    {
        $coupon = Coupon::findOrFail($id);
        $coupon->delete();

        return $this->success(null, 'Coupon deleted successfully');
    }
}
