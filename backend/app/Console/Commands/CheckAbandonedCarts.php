<?php
namespace App\Console\Commands;
use App\Models\AbandonedCart;
use Illuminate\Console\Command;

class CheckAbandonedCarts extends Command {
    protected $signature = "marketing:check-abandoned-carts";
    protected $description = "Check for abandoned carts and send reminder emails";

    public function handle(): void {
        $carts = AbandonedCart::where("last_activity_at", "<=", now()->subHour())
            ->where("last_activity_at", ">=", now()->subDay())
            ->where("reminder_sent", false)
            ->where("is_recovered", false)
            ->get();

        foreach ($carts as $cart) {
            // TODO: dispatch mail job
            $cart->update(["reminder_sent" => true, "reminder_sent_at" => now()]);
            $this->info("Reminder queued for: {$cart->email}");
        }

        $this->info("Processed {$carts->count()} abandoned carts.");
    }
}
