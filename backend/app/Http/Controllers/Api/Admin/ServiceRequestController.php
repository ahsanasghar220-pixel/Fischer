<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ServiceRequestController extends Controller
{
    public function index(Request $request)
    {
        $page = $request->get('page', 1);
        $search = $request->get('search');
        $status = $request->get('status');
        $perPage = 15;

        // Raw query for maximum speed
        $query = DB::table('service_requests')
            ->select([
                'id', 'ticket_number', 'customer_name', 'customer_email',
                'customer_phone', 'product_name', 'service_type',
                'problem_description', 'status', 'assigned_to', 'created_at',
            ])
            ->whereNull('deleted_at');

        // Search
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_email', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%")
                  ->orWhere('product_name', 'like', "%{$search}%")
                  ->orWhere('ticket_number', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($status) {
            $query->where('status', $status);
        }

        // Get total
        $total = $query->count();

        // Get paginated results
        $requests = $query->orderByDesc('created_at')
            ->offset(($page - 1) * $perPage)
            ->limit($perPage)
            ->get();

        // Transform
        $transformedRequests = $requests->map(function ($serviceRequest) {
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
                'assigned_to' => $serviceRequest->assigned_to,
                'created_at' => $serviceRequest->created_at,
            ];
        });

        return $this->success([
            'data' => $transformedRequests,
            'meta' => [
                'current_page' => (int) $page,
                'last_page' => (int) ceil($total / $perPage),
                'total' => $total,
            ],
        ]);
    }

    public function show($id)
    {
        $request = DB::table('service_requests')
            ->where('id', $id)
            ->whereNull('deleted_at')
            ->first();

        if (!$request) {
            return $this->error('Service request not found', 404);
        }

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
