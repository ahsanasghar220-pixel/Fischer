<?php

namespace App\Http\Controllers\Api\Production;

use App\Http\Controllers\Controller;
use App\Models\B2bOrder;
use App\Models\B2bOrderItem;
use App\Models\Product;
use App\Http\Requests\StoreB2BOrderRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SalesOrderController extends Controller
{
    /**
     * GET /api/production/my-orders
     * Returns the authenticated salesperson's own orders, paginated, newest first.
     */
    public function myOrders(Request $request): JsonResponse
    {
        $query = B2bOrder::with(['items'])
            ->where('salesperson_id', auth()->id())
            ->orderByDesc('created_at');

        // Optional filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $orders = $query->paginate(15);

        return response()->json(['data' => $orders]);
    }

    /**
     * GET /api/production/orders
     * For production managers: returns ALL orders with filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = B2bOrder::with(['items', 'salesperson'])
            ->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('city')) {
            $query->where('city', 'like', '%' . $request->city . '%');
        }

        if ($request->filled('salesperson_id')) {
            $query->where('salesperson_id', $request->salesperson_id);
        }

        if ($request->filled('brand_name')) {
            $query->where('brand_name', $request->brand_name);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('dealer_name', 'like', "%{$search}%");
            });
        }

        $orders = $query->paginate(20);

        // Append salesperson name to each order
        $orders->getCollection()->transform(function ($order) {
            $order->salesperson_name = $order->salesperson
                ? $order->salesperson->full_name
                : null;
            return $order;
        });

        return response()->json(['data' => $orders]);
    }

    /**
     * POST /api/production/orders
     * Salesperson creates a new B2B order.
     */
    public function store(StoreB2BOrderRequest $request): JsonResponse
    {
        $order = DB::transaction(function () use ($request) {
            $order = B2bOrder::create([
                'salesperson_id' => auth()->id(),
                'dealer_name'    => $request->dealer_name,
                'city'           => $request->city,
                'brand_name'     => $request->brand_name,
                'remarks'        => $request->remarks,
                'status'         => 'pending',
            ]);

            $items = [];
            foreach ($request->items as $itemData) {
                $items[] = [
                    'b2b_order_id' => $order->id,
                    'product_id'   => $itemData['product_id'] ?? null,
                    'sku'          => $itemData['sku'],
                    'product_name' => $itemData['product_name'],
                    'quantity'     => $itemData['quantity'],
                    'notes'        => $itemData['notes'] ?? null,
                    'created_at'   => now(),
                    'updated_at'   => now(),
                ];
            }

            B2bOrderItem::insert($items);

            return $order->load('items');
        });

        return response()->json([
            'message' => 'Order created successfully.',
            'data'    => $order,
        ], 201);
    }

    /**
     * GET /api/production/orders/{id}
     * Returns a single order with all items and salesperson info.
     */
    public function show(B2bOrder $order): JsonResponse
    {
        $order->load(['items', 'salesperson']);
        $order->salesperson_name = $order->salesperson
            ? $order->salesperson->full_name
            : null;

        return response()->json(['data' => $order]);
    }

    /**
     * PUT /api/production/orders/{id}/status
     * Production manager updates order status and optionally sets delivery_estimate.
     */
    public function updateStatus(Request $request, B2bOrder $order): JsonResponse
    {
        $request->validate([
            'status'            => 'required|in:pending,in_production,ready,delivered,cancelled',
            'delivery_estimate' => 'nullable|date|date_format:Y-m-d',
            'remarks'           => 'nullable|string|max:1000',
        ]);

        $updateData = ['status' => $request->status];

        if ($request->filled('delivery_estimate')) {
            $updateData['delivery_estimate'] = $request->delivery_estimate;
        }

        if ($request->filled('remarks')) {
            $updateData['remarks'] = $request->remarks;
        }

        $order->update($updateData);

        return response()->json([
            'message' => 'Order status updated.',
            'data'    => $order->fresh(['items', 'salesperson']),
        ]);
    }

    /**
     * GET /api/production/products/search?q=
     * Search products by name or SKU for the salesperson's order form.
     */
    public function searchProducts(Request $request): JsonResponse
    {
        $q = $request->get('q', '');

        if (strlen(trim($q)) < 1) {
            return response()->json(['data' => []]);
        }

        $products = Product::where('is_active', true)
            ->where(function ($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                      ->orWhere('sku', 'like', "%{$q}%")
                      ->orWhere('model_number', 'like', "%{$q}%");
            })
            ->select('id', 'sku', 'name', 'price', 'dealer_price', 'stock_quantity', 'stock_status')
            ->limit(20)
            ->get();

        return response()->json(['data' => $products]);
    }
}
