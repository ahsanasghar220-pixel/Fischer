<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        try {
            $page = $request->get('page', 1);
            $search = $request->get('search');
            $status = $request->get('status');
            $perPage = 15;

            // Get users who have placed orders
            $query = DB::table('users')
                ->select([
                    'users.id',
                    'users.first_name',
                    'users.last_name',
                    'users.email',
                    'users.phone',
                    'users.loyalty_points',
                    'users.status',
                    'users.created_at',
                ])
                ->whereNull('users.deleted_at');

            // Search
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('users.email', 'like', "%{$search}%")
                      ->orWhere('users.first_name', 'like', "%{$search}%")
                      ->orWhere('users.last_name', 'like', "%{$search}%")
                      ->orWhere('users.phone', 'like', "%{$search}%");
                });
            }

            // Filter by status
            if ($status) {
                $query->where('users.status', $status);
            }

            // Get total for pagination
            $total = $query->count();

            // Get paginated results
            $customers = $query->orderByDesc('users.created_at')
                ->offset(($page - 1) * $perPage)
                ->limit($perPage)
                ->get();

            // Get order stats for these customers in separate query
            $customerIds = $customers->pluck('id')->toArray();
            $orderStats = [];
            if (!empty($customerIds)) {
                $orderStats = DB::table('orders')
                    ->select([
                        'user_id',
                        DB::raw('COUNT(*) as orders_count'),
                        DB::raw('COALESCE(SUM(total), 0) as total_spent'),
                        DB::raw('MAX(created_at) as last_order_at'),
                    ])
                    ->whereIn('user_id', $customerIds)
                    ->whereNull('deleted_at')
                    ->groupBy('user_id')
                    ->get()
                    ->keyBy('user_id')
                    ->toArray();
            }

            // Transform
            $transformedCustomers = $customers->map(function ($customer) use ($orderStats) {
                $stats = $orderStats[$customer->id] ?? null;
                return [
                    'id' => $customer->id,
                    'name' => trim(($customer->first_name ?? '') . ' ' . ($customer->last_name ?? '')),
                    'email' => $customer->email,
                    'phone' => $customer->phone,
                    'orders_count' => (int) ($stats->orders_count ?? 0),
                    'total_spent' => (float) ($stats->total_spent ?? 0),
                    'loyalty_points' => (int) ($customer->loyalty_points ?? 0),
                    'status' => $customer->status ?? 'active',
                    'created_at' => $customer->created_at,
                    'last_order_at' => $stats->last_order_at ?? null,
                ];
            });

            return $this->success([
                'data' => $transformedCustomers,
                'meta' => [
                    'current_page' => (int) $page,
                    'last_page' => (int) ceil($total / $perPage),
                    'total' => $total,
                ],
            ]);
        } catch (\Exception $e) {
            return $this->error('Failed to load customers: ' . $e->getMessage(), 500);
        }
    }

    public function show($id)
    {
        $customer = DB::table('users')
            ->select([
                'id', 'first_name', 'last_name', 'email', 'phone',
                'status', 'loyalty_points', 'created_at',
                DB::raw('(SELECT COUNT(*) FROM orders WHERE orders.user_id = users.id AND orders.deleted_at IS NULL) as orders_count'),
            ])
            ->where('id', $id)
            ->whereNull('deleted_at')
            ->first();

        if (!$customer) {
            return $this->error('Customer not found', 404);
        }

        // Get recent orders with minimal data
        $recentOrders = DB::table('orders')
            ->select(['id', 'order_number', 'total', 'status', 'created_at'])
            ->where('user_id', $id)
            ->whereNull('deleted_at')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        return $this->success([
            'data' => [
                'id' => $customer->id,
                'first_name' => $customer->first_name,
                'last_name' => $customer->last_name,
                'email' => $customer->email,
                'phone' => $customer->phone,
                'status' => $customer->status,
                'loyalty_points' => $customer->loyalty_points,
                'created_at' => $customer->created_at,
                'orders_count' => $customer->orders_count,
                'orders' => $recentOrders,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:8',
        ]);

        $validated['password'] = bcrypt($validated['password']);
        $customer = User::create($validated);

        return $this->success(['data' => $customer], 'Customer created successfully', 201);
    }

    public function update(Request $request, $id)
    {
        $customer = User::findOrFail($id);

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
        $customer = User::findOrFail($id);
        $customer->delete();

        return $this->success(null, 'Customer deleted successfully');
    }

    public function orders($id)
    {
        $page = request()->get('page', 1);
        $perPage = 10;

        // Raw query for speed
        $total = DB::table('orders')
            ->where('user_id', $id)
            ->whereNull('deleted_at')
            ->count();

        $orders = DB::table('orders')
            ->select(['id', 'order_number', 'total', 'status', 'payment_status', 'created_at'])
            ->where('user_id', $id)
            ->whereNull('deleted_at')
            ->orderByDesc('created_at')
            ->offset(($page - 1) * $perPage)
            ->limit($perPage)
            ->get();

        return $this->success([
            'data' => $orders,
            'meta' => [
                'current_page' => (int) $page,
                'last_page' => (int) ceil($total / $perPage),
                'total' => $total,
            ],
        ]);
    }
}
