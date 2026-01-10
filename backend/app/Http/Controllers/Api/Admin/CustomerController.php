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
        $page = $request->get('page', 1);
        $search = $request->get('search');
        $status = $request->get('status');
        $perPage = 15;

        // Ultra-fast raw query with correlated subqueries
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
                DB::raw('(SELECT COUNT(*) FROM orders WHERE orders.user_id = users.id AND orders.deleted_at IS NULL) as orders_count'),
                DB::raw('(SELECT COALESCE(SUM(total), 0) FROM orders WHERE orders.user_id = users.id AND orders.deleted_at IS NULL) as total_spent'),
                DB::raw('(SELECT MAX(created_at) FROM orders WHERE orders.user_id = users.id AND orders.deleted_at IS NULL) as last_order_at'),
            ])
            ->whereExists(function ($q) {
                $q->select(DB::raw(1))
                  ->from('orders')
                  ->whereRaw('orders.user_id = users.id')
                  ->whereNull('orders.deleted_at');
            })
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

        // Transform
        $transformedCustomers = $customers->map(function ($customer) {
            return [
                'id' => $customer->id,
                'name' => trim(($customer->first_name ?? '') . ' ' . ($customer->last_name ?? '')),
                'email' => $customer->email,
                'phone' => $customer->phone,
                'orders_count' => (int) $customer->orders_count,
                'total_spent' => (float) $customer->total_spent,
                'loyalty_points' => (int) ($customer->loyalty_points ?? 0),
                'status' => $customer->status ?? 'active',
                'created_at' => $customer->created_at,
                'last_order_at' => $customer->last_order_at,
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
