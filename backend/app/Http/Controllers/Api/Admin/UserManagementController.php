<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\RolePermissionService;
use Illuminate\Http\Request;

class UserManagementController extends Controller
{
    public function index(Request $request)
    {
        try {
            $page = $request->get('page', 1);
            $search = $request->get('search');
            $perPage = 15;

            $query = User::whereHas('roles', function ($q) {
                $q->whereIn('name', ['super-admin', 'admin', 'order-manager', 'content-manager']);
            });

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            $users = $query->orderByDesc('created_at')
                ->paginate($perPage, ['*'], 'page', $page);

            $data = collect($users->items())->map(function ($user) {
                return [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'full_name' => $user->full_name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'status' => $user->status ?? 'active',
                    'roles' => $user->getRoleNames()->toArray(),
                    'last_login_at' => $user->last_login_at,
                    'created_at' => $user->created_at,
                ];
            });

            return $this->success([
                'data' => $data,
                'meta' => [
                    'current_page' => $users->currentPage(),
                    'last_page' => $users->lastPage(),
                    'total' => $users->total(),
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('UserManagement index error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->error('Failed to load users', 500);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => ['required', 'confirmed', 'min:8'],
            'role' => 'required|string|in:admin,order-manager,content-manager',
            'status' => 'sometimes|string|in:active,inactive',
        ]);

        try {
            $user = User::create([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'email' => $validated['email'],
                'password' => $validated['password'], // 'hashed' cast on model handles hashing
                'status' => $validated['status'] ?? 'active',
            ]);

            RolePermissionService::ensureRolePermissions($validated['role']);
            $user->assignRole($validated['role']);

            return $this->success([
                'data' => [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'full_name' => $user->full_name,
                    'email' => $user->email,
                    'roles' => $user->getRoleNames()->toArray(),
                    'status' => $user->status,
                ],
            ], 'User created successfully', 201);
        } catch (\Exception $e) {
            \Log::error('UserManagement store error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->error('Failed to create user: ' . $e->getMessage(), 500);
        }
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // Prevent modifying super-admin
        if ($user->hasRole('super-admin') && !$request->user()->hasRole('super-admin')) {
            return $this->error('Cannot modify a super admin', 403);
        }

        $rules = [
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'role' => 'sometimes|string|in:admin,order-manager,content-manager',
            'status' => 'sometimes|string|in:active,inactive',
        ];

        // Only validate password if it's actually provided (non-empty)
        if ($request->filled('password')) {
            $rules['password'] = ['confirmed', 'min:8'];
        }

        $validated = $request->validate($rules);

        try {
            $updateData = collect($validated)->except(['password', 'role', 'password_confirmation'])->toArray();

            if (!empty($validated['password'])) {
                $updateData['password'] = $validated['password']; // 'hashed' cast on model handles hashing
            }

            $user->update($updateData);

            if (isset($validated['role'])) {
                RolePermissionService::ensureRolePermissions($validated['role']);
                $user->syncRoles([$validated['role']]);
            }

            return $this->success([
                'data' => [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'full_name' => $user->full_name,
                    'email' => $user->email,
                    'roles' => $user->getRoleNames()->toArray(),
                    'status' => $user->status ?? 'active',
                ],
            ], 'User updated successfully');
        } catch (\Exception $e) {
            \Log::error('UserManagement update error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->error('Failed to update user: ' . $e->getMessage(), 500);
        }
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);

        if ($user->hasRole('super-admin')) {
            return $this->error('Cannot delete a super admin', 403);
        }

        $user->update(['status' => 'inactive']);

        return $this->success(null, 'User deactivated successfully');
    }
}
