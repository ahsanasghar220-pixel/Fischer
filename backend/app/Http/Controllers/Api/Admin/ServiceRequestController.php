<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;

class ServiceRequestController extends Controller
{
    public function index(Request $request)
    {
        $query = ServiceRequest::query();

        // Search
        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_email', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%")
                  ->orWhere('product_name', 'like', "%{$search}%")
                  ->orWhere('ticket_number', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        $requests = $query->orderByDesc('created_at')->paginate(15);

        // Transform for frontend
        $transformedRequests = collect($requests->items())->map(function ($serviceRequest) {
            return [
                'id' => $serviceRequest->id,
                'ticket_number' => $serviceRequest->ticket_number,
                'name' => $serviceRequest->customer_name,
                'email' => $serviceRequest->customer_email,
                'phone' => $serviceRequest->customer_phone,
                'product_name' => $serviceRequest->product_name ?? 'N/A',
                'issue_type' => $serviceRequest->service_type ?? 'General',
                'description' => $serviceRequest->problem_description,
                'status' => $serviceRequest->status ?? 'pending',
                'created_at' => $serviceRequest->created_at->toISOString(),
            ];
        });

        return $this->success([
            'data' => $transformedRequests,
            'meta' => [
                'current_page' => $requests->currentPage(),
                'last_page' => $requests->lastPage(),
                'total' => $requests->total(),
            ],
        ]);
    }

    public function show($id)
    {
        $request = ServiceRequest::findOrFail($id);

        return $this->success([
            'data' => $request,
        ]);
    }

    public function update(Request $request, $id)
    {
        $serviceRequest = ServiceRequest::findOrFail($id);

        $validated = $request->validate([
            'status' => 'sometimes|string|in:pending,in_progress,completed,cancelled',
            'notes' => 'nullable|string',
            'assigned_to' => 'nullable|string|max:255',
        ]);

        $serviceRequest->update($validated);

        return $this->success([
            'data' => $serviceRequest->fresh(),
        ], 'Service request updated successfully');
    }

    public function assign(Request $request, $id)
    {
        $serviceRequest = ServiceRequest::findOrFail($id);

        $validated = $request->validate([
            'assigned_to' => 'required|string|max:255',
        ]);

        $serviceRequest->update([
            'assigned_to' => $validated['assigned_to'],
            'status' => 'in_progress',
        ]);

        return $this->success([
            'data' => $serviceRequest->fresh(),
        ], 'Service request assigned successfully');
    }
}
