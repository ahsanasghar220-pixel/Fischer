<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Spatie\Permission\Models\Role;

class CreateAdminUser extends Command
{
    protected $signature = 'admin:create {--email=admin@fischer.pk} {--password=admin123}';
    protected $description = 'Create an admin user';

    public function handle(): int
    {
        $email = $this->option('email');
        $password = $this->option('password');

        // Create roles if they don't exist
        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'super-admin', 'guard_name' => 'web']);

        // Check if user exists
        $existingUser = User::where('email', $email)->first();

        if ($existingUser) {
            // Update existing user to be admin
            $existingUser->update(['password' => $password]);
            if (!$existingUser->hasRole('super-admin')) {
                $existingUser->assignRole('super-admin');
            }
            $this->info("Existing user updated to admin: {$email}");
        } else {
            // Create new admin user
            $admin = User::create([
                'first_name' => 'Admin',
                'last_name' => 'Fischer',
                'email' => $email,
                'password' => $password,
                'phone' => '+923001234567',
                'status' => 'active',
                'email_verified_at' => now(),
            ]);
            $admin->assignRole('super-admin');
            $this->info("Admin user created: {$email}");
        }

        $this->info("Email: {$email}");
        $this->info("Password: {$password}");
        $this->info("\nYou can now login at /admin");

        return Command::SUCCESS;
    }
}
