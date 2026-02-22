<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceRequest;
use App\Models\Product;
use App\Http\Requests\StoreServiceRequestRequest;
use Illuminate\Http\Request;

class ServiceRequestController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $requests = ServiceRequest::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->paginate(10);

        return $this->paginated($requests);
    }

    public function store(StoreServiceRequestRequest $request)
    {
        $validated = $request->validated();

        $user = $request->user();

        // Handle images
        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $imagePaths[] = $image->store('service-requests', 'public');
            }
        }

        $serviceRequest = ServiceRequest::create([
            'user_id' => $user?->id,
            'customer_name' => $validated['customer_name'],
            'customer_email' => $validated['customer_email'],
            'customer_phone' => $validated['customer_phone'],
            'city' => $validated['city'],
            'address' => $validated['address'],
            'product_id' => $validated['product_id'] ?? null,
            'product_name' => $validated['product_name'],
            'model_number' => $validated['model_number'] ?? null,
            'serial_number' => $validated['serial_number'] ?? null,
            'purchase_date' => $validated['purchase_date'] ?? null,
            'under_warranty' => $validated['under_warranty'] ?? false,
            'service_type' => $validated['service_type'],
            'problem_description' => $validated['problem_description'],
            'images' => $imagePaths,
            'status' => 'pending',
            'priority' => 'medium',
        ]);

        return $this->success([
            'service_request' => $serviceRequest,
            'ticket_number' => $serviceRequest->ticket_number,
        ], 'Service request submitted successfully', 201);
    }

    public function show(Request $request, string $ticketNumber)
    {
        $query = ServiceRequest::where('ticket_number', $ticketNumber)
            ->with(['history', 'product', 'assignedTo:id,first_name,last_name']);

        // If user is logged in, verify ownership
        $user = $request->user();
        if ($user && !$user->isAdmin()) {
            $query->where('user_id', $user->id);
        }

        $serviceRequest = $query->firstOrFail();

        return $this->success([
            'service_request' => $serviceRequest,
        ]);
    }

    public function track(string $ticketNumber)
    {
        $serviceRequest = ServiceRequest::where('ticket_number', $ticketNumber)
            ->with('history')
            ->firstOrFail();

        return $this->success([
            'ticket_number' => $serviceRequest->ticket_number,
            'status' => $serviceRequest->status,
            'status_label' => $serviceRequest->status_label,
            'priority' => $serviceRequest->priority,
            'service_type' => $serviceRequest->service_type_label,
            'product_name' => $serviceRequest->product_name,
            'scheduled_date' => $serviceRequest->scheduled_date,
            'scheduled_time_slot' => $serviceRequest->scheduled_time_slot,
            'estimated_cost' => $serviceRequest->estimated_cost,
            'created_at' => $serviceRequest->created_at,
            'history' => $serviceRequest->history->map(function ($item) {
                return [
                    'status' => $item->status,
                    'notes' => $item->notes,
                    'created_at' => $item->created_at,
                ];
            }),
        ]);
    }

    public function cancel(Request $request, string $ticketNumber)
    {
        $user = $request->user();

        $serviceRequest = ServiceRequest::where('ticket_number', $ticketNumber)
            ->where('user_id', $user->id)
            ->whereIn('status', ['pending', 'assigned'])
            ->firstOrFail();

        $serviceRequest->updateStatus('cancelled', 'Cancelled by customer', $user->id);

        return $this->success(null, 'Service request cancelled');
    }

    public function submitFeedback(Request $request, string $ticketNumber)
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'feedback' => 'nullable|string|max:1000',
        ]);

        $user = $request->user();

        $serviceRequest = ServiceRequest::where('ticket_number', $ticketNumber)
            ->where('status', 'completed')
            ->firstOrFail();

        // Verify ownership if user is logged in
        if ($user && $serviceRequest->user_id && $serviceRequest->user_id !== $user->id) {
            return $this->error('Unauthorized', 403);
        }

        $serviceRequest->update([
            'customer_rating' => $validated['rating'],
            'customer_feedback' => $validated['feedback'] ?? null,
        ]);

        return $this->success(null, 'Thank you for your feedback');
    }

    public function getProducts()
    {
        $products = Product::active()
            ->select('id', 'name', 'model_number', 'warranty_period')
            ->orderBy('name')
            ->get();

        return $this->success($products);
    }
}
