<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class UserManagementController extends Controller
{
    public function index(Request $request)
    {
        $page = $request->get('page', 1);
        $search = $request->get('search');
        $perPage = 15;

        $query = User::role(['super-admin', 'admin', 'order-manager', 'content-manager']);

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
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => 'required|string|in:admin,order-manager,content-manager',
            'status' => 'sometimes|string|in:active,inactive',
        ]);

        $user = User::create([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'status' => $validated['status'] ?? 'active',
        ]);

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
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // Prevent modifying super-admin
        if ($user->hasRole('super-admin') && !$request->user()->hasRole('super-admin')) {
            return $this->error('Cannot modify a super admin', 403);
        }

        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'password' => ['sometimes', 'confirmed', Password::defaults()],
            'role' => 'sometimes|string|in:admin,order-manager,content-manager',
            'status' => 'sometimes|string|in:active,inactive',
        ]);

        $updateData = collect($validated)->except(['password', 'role', 'password_confirmation'])->toArray();

        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        if (isset($validated['role'])) {
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
