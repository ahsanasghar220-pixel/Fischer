<?php

namespace App\Services;

use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionService
{
    /**
     * Canonical permission sets per admin role.
     */
    public const ROLE_PERMISSIONS = [
        'super-admin' => [
            'manage-orders', 'manage-products', 'manage-categories', 'manage-bundles',
            'manage-customers', 'manage-coupons', 'manage-reviews', 'manage-settings',
            'manage-shipping', 'manage-homepage', 'manage-pages', 'manage-dealers',
            'manage-sales', 'manage-banners', 'manage-service-requests', 'manage-users',
            'view-analytics', 'view-dashboard',
        ],
        'admin' => [
            'manage-orders', 'manage-products', 'manage-categories', 'manage-bundles',
            'manage-customers', 'manage-coupons', 'manage-reviews', 'manage-settings',
            'manage-shipping', 'manage-homepage', 'manage-pages', 'manage-dealers',
            'manage-sales', 'manage-banners', 'manage-service-requests', 'view-analytics',
            'view-dashboard',
        ],
        'order-manager' => [
            'manage-orders', 'manage-customers', 'manage-service-requests',
            'view-analytics', 'view-dashboard',
        ],
        'content-manager' => [
            'manage-products', 'manage-categories', 'manage-bundles', 'manage-homepage',
            'manage-pages', 'manage-reviews', 'manage-coupons', 'manage-sales',
            'manage-banners', 'view-dashboard',
        ],
    ];

    private static bool $seeded = false;

    /**
     * Ensure all admin roles and their permissions exist in the database.
     * Uses a static flag so it only runs once per request lifecycle.
     */
    public static function ensureAllRolesAndPermissions(): void
    {
        if (self::$seeded) {
            return;
        }

        // Collect all unique permissions
        $allPerms = collect(self::ROLE_PERMISSIONS)->flatten()->unique()->values();

        foreach ($allPerms as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
        }

        foreach (self::ROLE_PERMISSIONS as $roleName => $permissions) {
            $role = Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
            if ($role->permissions->isEmpty() || $role->permissions->count() !== count($permissions)) {
                $role->syncPermissions($permissions);
            }
        }

        // Also ensure customer and dealer roles exist
        Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'dealer', 'guard_name' => 'web']);

        // Clear Spatie's cached permissions
        app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();

        self::$seeded = true;
    }

    /**
     * Ensure a specific role has its permissions.
     */
    public static function ensureRolePermissions(string $roleName): Role
    {
        $role = Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);

        if (isset(self::ROLE_PERMISSIONS[$roleName]) && $role->permissions->isEmpty()) {
            foreach (self::ROLE_PERMISSIONS[$roleName] as $perm) {
                Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
            }
            $role->syncPermissions(self::ROLE_PERMISSIONS[$roleName]);
            app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
        }

        return $role;
    }
}
