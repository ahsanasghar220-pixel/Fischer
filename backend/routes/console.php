<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Daily analytics aggregation
Schedule::command('analytics:aggregate')->dailyAt('01:00');

// Expire abandoned carts after 7 days
Schedule::command('carts:cleanup')->dailyAt('02:00');

// Send abandoned cart reminders
Schedule::command('notifications:abandoned-carts')->everyThreeHours();

// Expire loyalty points
Schedule::command('loyalty:expire-points')->dailyAt('00:00');

// Clean up old sessions
Schedule::command('session:gc')->weekly();
