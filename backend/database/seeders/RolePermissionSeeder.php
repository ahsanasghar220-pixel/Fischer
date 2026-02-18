<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            'manage-orders',
            'manage-products',
            'manage-categories',
            'manage-bundles',
            'manage-customers',
            'manage-coupons',
            'manage-reviews',
            'manage-settings',
            'manage-shipping',
            'manage-homepage',
            'manage-pages',
            'manage-dealers',
            'manage-sales',
            'manage-banners',
            'manage-service-requests',
            'manage-users',
            'view-analytics',
            'view-dashboard',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // Super Admin - ALL permissions
        $superAdmin = Role::firstOrCreate(['name' => 'super-admin', 'guard_name' => 'web']);
        $superAdmin->syncPermissions($permissions);

        // Admin - all except manage-users
        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $admin->syncPermissions(
            collect($permissions)->reject(fn($p) => $p === 'manage-users')->toArray()
        );

        // Order Manager
        $orderManager = Role::firstOrCreate(['name' => 'order-manager', 'guard_name' => 'web']);
        $orderManager->syncPermissions([
            'manage-orders',
            'manage-customers',
            'manage-service-requests',
            'view-analytics',
            'view-dashboard',
        ]);

        // Content Manager
        $contentManager = Role::firstOrCreate(['name' => 'content-manager', 'guard_name' => 'web']);
        $contentManager->syncPermissions([
            'manage-products',
            'manage-categories',
            'manage-bundles',
            'manage-homepage',
            'manage-pages',
            'manage-reviews',
            'manage-coupons',
            'manage-sales',
            'manage-banners',
            'view-dashboard',
        ]);

        // Ensure customer and dealer roles exist
        Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'dealer', 'guard_name' => 'web']);

        // Clear cache again after all changes
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
    }
}
