<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dealer;
use App\Models\Product;
use App\Http\Requests\DealerRegisterRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class DealerController extends Controller
{
    public function register(DealerRegisterRequest $request)
    {
        $validated = $request->validated();

        $dealer = Dealer::create([
            'user_id' => auth()->id(),
            'business_name' => $validated['business_name'],
            'contact_person' => $validated['contact_person'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'alternate_phone' => $validated['alternate_phone'] ?? null,
            'city' => $validated['city'],
            'address' => $validated['address'],
            'ntn_number' => $validated['ntn_number'] ?? null,
            'strn_number' => $validated['strn_number'] ?? null,
            'established_year' => $validated['established_year'] ?? null,
            'business_type' => $validated['business_type'],
            'current_brands' => $validated['current_brands'] ?? null,
            'additional_details' => $validated['additional_details'] ?? null,
            'status' => 'pending',
        ]);

        // Handle documents
        if ($request->hasFile('documents')) {
            foreach ($request->file('documents') as $index => $document) {
                if (isset($document['file'])) {
                    $path = $document['file']->store('dealer-documents', 'public');
                    $dealer->documents()->create([
                        'type' => $validated['documents'][$index]['type'],
                        'name' => $document['file']->getClientOriginalName(),
                        'file' => $path,
                    ]);
                }
            }
        }

        return $this->success([
            'dealer' => $dealer->load('documents'),
        ], 'Dealer application submitted successfully. We will review and contact you soon.', 201);
    }

    public function status(Request $request)
    {
        $user = $request->user();
        $dealer = Dealer::where('user_id', $user->id)->first();

        if (!$dealer) {
            return $this->success([
                'has_application' => false,
            ]);
        }

        return $this->success([
            'has_application' => true,
            'status' => $dealer->status,
            'business_name' => $dealer->business_name,
            'submitted_at' => $dealer->created_at,
            'approved_at' => $dealer->approved_at,
        ]);
    }

    public function dashboard(Request $request)
    {
        $user = $request->user();
        $dealer = Dealer::where('user_id', $user->id)->approved()->firstOrFail();

        // Optimized: Single query instead of 4 separate queries
        $orderStats = $dealer->orders()
            ->selectRaw('
                COUNT(*) as total_orders,
                SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as pending_orders,
                SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as completed_orders,
                SUM(total) as total_spent
            ', ['pending', 'delivered'])
            ->first();

        $stats = [
            'total_orders' => $orderStats->total_orders ?? 0,
            'pending_orders' => $orderStats->pending_orders ?? 0,
            'completed_orders' => $orderStats->completed_orders ?? 0,
            'total_spent' => $orderStats->total_spent ?? 0,
            'available_credit' => $dealer->available_credit,
            'discount_percentage' => $dealer->discount_percentage,
        ];

        $recentOrders = $dealer->orders()
            ->with('items')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        return $this->success([
            'dealer' => $dealer,
            'stats' => $stats,
            'recent_orders' => $recentOrders,
        ]);
    }

    public function products(Request $request)
    {
        $user = $request->user();
        $dealer = Dealer::where('user_id', $user->id)->approved()->firstOrFail();

        $query = Product::with(['category', 'images'])
            ->active()
            ->whereNotNull('dealer_price');

        // Apply filters
        if ($request->category) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        if ($request->search) {
            $query->search($request->search);
        }

        $products = $query->paginate(20);

        // Add dealer-specific pricing
        $products->getCollection()->transform(function ($product) use ($dealer) {
            $discount = $dealer->discount_percentage;
            $product->dealer_discount = $discount;
            $product->effective_dealer_price = $product->dealer_price * (1 - $discount / 100);
            return $product;
        });

        return $this->paginated($products);
    }

    public function placeOrder(Request $request)
    {
        $user = $request->user();
        $dealer = Dealer::where('user_id', $user->id)->approved()->firstOrFail();

        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.variant_id' => 'nullable|exists:product_variants,id',
            'items.*.quantity' => 'required|integer|min:1',
            'shipping_address' => 'required|string|max:1000',
            'notes' => 'nullable|string|max:1000',
            'use_credit' => 'boolean',
        ]);

        // Calculate order total
        $subtotal = 0;
        $orderItems = [];

        foreach ($validated['items'] as $item) {
            $product = Product::findOrFail($item['product_id']);
            $dealerPrice = $product->getDealerPrice($item['variant_id'] ?? null);
            $effectivePrice = $dealerPrice * (1 - $dealer->discount_percentage / 100);

            $subtotal += $effectivePrice * $item['quantity'];

            $orderItems[] = [
                'product' => $product,
                'variant_id' => $item['variant_id'] ?? null,
                'quantity' => $item['quantity'],
                'unit_price' => $effectivePrice,
            ];
        }

        // Check credit if using credit
        if ($validated['use_credit'] ?? false) {
            if (!$dealer->hasAvailableCredit($subtotal)) {
                return $this->error('Insufficient credit limit', 400);
            }
        }

        // Create order
        $order = \App\Models\Order::create([
            'user_id' => $user->id,
            'dealer_id' => $dealer->id,
            'status' => 'pending',
            'payment_status' => ($validated['use_credit'] ?? false) ? 'pending' : 'pending',
            'payment_method' => ($validated['use_credit'] ?? false) ? 'credit' : 'bank_transfer',
            'subtotal' => $subtotal,
            'discount_amount' => 0,
            'shipping_amount' => 0, // Free shipping for dealers
            'total' => $subtotal,
            'shipping_first_name' => $dealer->contact_person,
            'shipping_last_name' => '',
            'shipping_phone' => $dealer->phone,
            'shipping_email' => $dealer->email,
            'shipping_address_line_1' => $validated['shipping_address'],
            'shipping_city' => $dealer->city,
            'shipping_country' => 'Pakistan',
            'customer_notes' => $validated['notes'] ?? null,
            'source' => 'dealer',
        ]);

        // Create order items
        foreach ($orderItems as $item) {
            \App\Models\OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $item['product']->id,
                'product_variant_id' => $item['variant_id'],
                'product_name' => $item['product']->name,
                'product_sku' => $item['product']->sku,
                'product_image' => $item['product']->primary_image,
                'quantity' => $item['quantity'],
                'unit_price' => $item['unit_price'],
                'total_price' => $item['unit_price'] * $item['quantity'],
            ]);
        }

        // Use credit if applicable
        if ($validated['use_credit'] ?? false) {
            $dealer->useCredit($subtotal);
        }

        return $this->success([
            'order' => $order->load('items'),
        ], 'Order placed successfully', 201);
    }

    public function orders(Request $request)
    {
        $user = $request->user();
        $dealer = Dealer::where('user_id', $user->id)->approved()->firstOrFail();

        $orders = $dealer->orders()
            ->with('items')
            ->orderByDesc('created_at')
            ->paginate(20);

        return $this->paginated($orders);
    }

    public function findDealers(Request $request)
    {
        $validated = $request->validate([
            'city' => 'nullable|string',
        ]);

        $query = Dealer::approved()
            ->select('business_name', 'city', 'phone', 'address');

        if ($validated['city'] ?? null) {
            $query->where('city', 'like', "%{$validated['city']}%");
        }

        $dealers = $query->orderBy('city')->get();

        return $this->success($dealers);
    }

    public function cities()
    {
        $cities = Dealer::approved()
            ->distinct()
            ->pluck('city')
            ->sort()
            ->values();

        return $this->success($cities);
    }
}
