<?php

namespace App\Console\Commands;

use App\Mail\OrderConfirmation;
use App\Models\Order;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestMailCommand extends Command
{
    protected $signature = 'mail:test {email : Recipient email address}';
    protected $description = 'Send a test email to verify SMTP configuration';

    public function handle(): int
    {
        $email = $this->argument('email');

        $this->info("Sending test email to: {$email}");
        $this->info('Mail driver : ' . config('mail.default'));
        $this->info('SMTP host   : ' . config('mail.mailers.smtp.host'));
        $this->info('SMTP port   : ' . config('mail.mailers.smtp.port'));
        $this->info('From address: ' . config('mail.from.address'));

        // Use the most recent real order for a realistic preview, or a stub.
        $order = Order::with('items')->latest()->first();

        if ($order) {
            $this->line("Using order #{$order->order_number} as preview data.");
        } else {
            $this->warn('No orders found — sending a plain test message instead.');
            Mail::raw(
                "This is a test email from Fischer Pakistan.\n\nIf you received this, your SMTP configuration is working correctly.",
                fn ($m) => $m->to($email)->subject('Fischer Pakistan — SMTP Test')
            );
            $this->info('✓ Test email sent (plain text).');
            return self::SUCCESS;
        }

        try {
            Mail::to($email)->send(new OrderConfirmation($order));
            $this->info('✓ Test email sent successfully. Check your inbox.');
            return self::SUCCESS;
        } catch (\Exception $e) {
            $this->error('✗ Failed to send email: ' . $e->getMessage());
            $this->line('');
            $this->line('Check your .env MAIL_* settings and ensure the SMTP server is reachable.');
            return self::FAILURE;
        }
    }
}
