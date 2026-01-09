<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = User::role('customer')->withCount('orders');

        // Search
        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                  ->orWhere('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        $customers = $query->withSum('orders', 'total')->orderByDesc('created_at')->paginate(15);

        // Transform for frontend
        $transformedCustomers = collect($customers->items())->map(function ($customer) {
            return [
                'id' => $customer->id,
                'name' => trim($customer->first_name . ' ' . $customer->last_name),
                'email' => $customer->email,
                'phone' => $customer->phone,
                'orders_count' => $customer->orders_count ?? 0,
                'total_spent' => $customer->orders_sum_total ?? 0,
                'loyalty_points' => $customer->loyalty_points ?? 0,
                'created_at' => $customer->created_at->toISOString(),
                'last_order_at' => $customer->orders()->latest()->first()?->created_at?->toISOString(),
            ];
        });

        return $this->success([
            'data' => $transformedCustomers,
            'meta' => [
                'current_page' => $customers->currentPage(),
                'last_page' => $customers->lastPage(),
                'total' => $customers->total(),
            ],
        ]);
    }

    public function show($id)
    {
        $customer = User::role('customer')
            ->withCount('orders')
            ->with(['orders' => function ($q) {
                $q->latest()->limit(10);
            }])
            ->findOrFail($id);

        return $this->success([
            'data' => $customer,
        ]);
    }

    public function update(Request $request, $id)
    {
        $customer = User::role('customer')->findOrFail($id);

        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'phone' => 'nullable|string|max:20',
            'status' => 'sometimes|string|in:active,inactive,suspended',
        ]);

        $customer->update($validated);

        return $this->success([
            'data' => $customer->fresh(),
        ], 'Customer updated successfully');
    }

    public function destroy($id)
    {
        $customer = User::role('customer')->findOrFail($id);

        // Soft delete
        $customer->delete();

        return $this->success(null, 'Customer deleted successfully');
    }

    public function orders($id)
    {
        $customer = User::role('customer')->findOrFail($id);

        $orders = $customer->orders()
            ->with('items.product:id,name,slug')
            ->orderByDesc('created_at')
            ->paginate(10);

        return $this->success([
            'data' => $orders->items(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'total' => $orders->total(),
            ],
        ]);
    }
}
