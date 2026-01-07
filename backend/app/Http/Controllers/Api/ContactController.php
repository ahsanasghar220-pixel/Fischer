<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function submit(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|min:10|max:2000',
        ]);

        ContactMessage::create($validated);

        // Send notification email to admin
        // TODO: Implement notification

        return $this->success(null, 'Thank you for contacting us. We will get back to you soon.', 201);
    }

    public function subscribeNewsletter(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|max:255',
            'name' => 'nullable|string|max:255',
        ]);

        $existing = NewsletterSubscriber::where('email', $validated['email'])->first();

        if ($existing) {
            if ($existing->is_active) {
                return $this->success(null, 'You are already subscribed to our newsletter');
            }

            $existing->update([
                'is_active' => true,
                'unsubscribed_at' => null,
            ]);

            return $this->success(null, 'Welcome back! Your subscription has been reactivated.');
        }

        NewsletterSubscriber::create([
            'email' => $validated['email'],
            'name' => $validated['name'] ?? null,
            'source' => 'website',
        ]);

        return $this->success(null, 'Thank you for subscribing to our newsletter!', 201);
    }

    public function unsubscribe(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        $subscriber = NewsletterSubscriber::where('email', $validated['email'])->first();

        if ($subscriber) {
            $subscriber->update([
                'is_active' => false,
                'unsubscribed_at' => now(),
            ]);
        }

        return $this->success(null, 'You have been unsubscribed from our newsletter.');
    }
}
