<?php

namespace App\Http\Controllers\Api\Complaints;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreComplaintRequest;
use App\Http\Requests\UpdateComplaintStatusRequest;
use App\Models\Complaint;
use App\Models\ComplaintActivityLog;
use App\Models\ComplaintAttachment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ComplaintController extends Controller
{
    /**
     * List all complaints (complaints_manager / admin / super-admin).
     * Supports filtering by status, category, complainant_type, city, search.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Complaint::with([
            'filedBy:id,first_name,last_name',
            'assignedTo:id,first_name,last_name',
            'product:id,name,sku',
        ])->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('category')) {
            $query->where('complaint_category', $request->category);
        }

        if ($request->filled('complainant_type')) {
            $query->where('complainant_type', $request->complainant_type);
        }

        if ($request->filled('city')) {
            $query->where('complainant_city', 'like', '%' . $request->city . '%');
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('complainant_name', 'like', "%{$search}%")
                  ->orWhere('complaint_number', 'like', "%{$search}%")
                  ->orWhere('complainant_phone', 'like', "%{$search}%");
            });
        }

        $paginator = $query->paginate(15);

        $items = collect($paginator->items())->map(fn ($c) => $this->formatListItem($c));

        return response()->json([
            'success' => true,
            'data'    => $items,
            'meta'    => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
                'from'         => $paginator->firstItem(),
                'to'           => $paginator->lastItem(),
            ],
            'links'   => [
                'first' => $paginator->url(1),
                'last'  => $paginator->url($paginator->lastPage()),
                'prev'  => $paginator->previousPageUrl(),
                'next'  => $paginator->nextPageUrl(),
            ],
        ]);
    }

    /**
     * List complaints filed by the authenticated salesperson.
     */
    public function myComplaints(Request $request): JsonResponse
    {
        $query = Complaint::with([
            'filedBy:id,first_name,last_name',
            'assignedTo:id,first_name,last_name',
            'product:id,name,sku',
        ])
            ->where('filed_by_id', auth()->id())
            ->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('category')) {
            $query->where('complaint_category', $request->category);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('complainant_name', 'like', "%{$search}%")
                  ->orWhere('complaint_number', 'like', "%{$search}%")
                  ->orWhere('complainant_phone', 'like', "%{$search}%");
            });
        }

        $paginator = $query->paginate(15);

        $items = collect($paginator->items())->map(fn ($c) => $this->formatListItem($c));

        return response()->json([
            'success' => true,
            'data'    => $items,
            'meta'    => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
                'from'         => $paginator->firstItem(),
                'to'           => $paginator->lastItem(),
            ],
            'links'   => [
                'first' => $paginator->url(1),
                'last'  => $paginator->url($paginator->lastPage()),
                'prev'  => $paginator->previousPageUrl(),
                'next'  => $paginator->nextPageUrl(),
            ],
        ]);
    }

    /**
     * File a new complaint.
     */
    public function store(StoreComplaintRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Determine filed_by_type from the authenticated user's role
        $user = auth()->user();
        if ($user->hasRole('salesperson')) {
            $data['filed_by_type'] = 'salesperson';
        } else {
            $data['filed_by_type'] = 'admin_staff';
        }

        $data['filed_by_id'] = $user->id;
        $data['status']      = 'open';

        $complaint = DB::transaction(function () use ($data, $user) {
            $complaint = Complaint::create($data);

            // Auto-log initial activity
            ComplaintActivityLog::create([
                'complaint_id' => $complaint->id,
                'user_id'      => $user->id,
                'action_type'  => 'status_change',
                'new_status'   => 'open',
                'body'         => 'Complaint filed',
            ]);

            return $complaint;
        });

        $complaint->load(['filedBy:id,first_name,last_name', 'product:id,name,sku']);

        return $this->success([
            'complaint' => $this->formatListItem($complaint),
        ], 'Complaint filed successfully', 201);
    }

    /**
     * Show full detail of a single complaint.
     */
    public function show(Complaint $complaint): JsonResponse
    {
        $complaint->load([
            'filedBy:id,first_name,last_name',
            'assignedTo:id,first_name,last_name',
            'product:id,name,sku',
            'attachments',
            'activityLog.user:id,first_name,last_name',
        ]);

        // Re-order activity log ascending for timeline display
        $activityLog = $complaint->activityLog
            ->sortBy('created_at')
            ->values()
            ->map(function ($log) {
                return [
                    'id'          => $log->id,
                    'action_type' => $log->action_type,
                    'old_status'  => $log->old_status,
                    'new_status'  => $log->new_status,
                    'body'        => $log->body,
                    'created_at'  => $log->created_at,
                    'user'        => $log->user ? [
                        'id'        => $log->user->id,
                        'full_name' => $log->user->full_name,
                    ] : null,
                ];
            });

        $attachments = $complaint->attachments->map(function ($att) {
            return [
                'id'        => $att->id,
                'file_name' => $att->file_name,
                'file_path' => Storage::url($att->file_path),
                'created_at' => $att->created_at,
            ];
        });

        return $this->success([
            'complaint' => [
                'id'                    => $complaint->id,
                'complaint_number'      => $complaint->complaint_number,
                'complainant_type'      => $complaint->complainant_type,
                'complainant_name'      => $complaint->complainant_name,
                'complainant_phone'     => $complaint->complainant_phone,
                'complainant_city'      => $complaint->complainant_city,
                'dealer_purchased_from' => $complaint->dealer_purchased_from,
                'purchase_channel'      => $complaint->purchase_channel,
                'approx_purchase_month' => $complaint->approx_purchase_month,
                'approx_purchase_year'  => $complaint->approx_purchase_year,
                'sku'                   => $complaint->product?->sku ?? $complaint->sku_manual,
                'product_name'          => $complaint->product?->name ?? $complaint->product_name_manual,
                'serial_number'         => $complaint->serial_number,
                'complaint_category'    => $complaint->complaint_category,
                'description'           => $complaint->description,
                'status'                => $complaint->status,
                'resolution_notes'      => $complaint->resolution_notes,
                'resolved_at'           => $complaint->resolved_at,
                'filed_by_type'         => $complaint->filed_by_type,
                'created_at'            => $complaint->created_at,
                'updated_at'            => $complaint->updated_at,
                'filed_by'              => $complaint->filedBy ? [
                    'id'        => $complaint->filedBy->id,
                    'full_name' => $complaint->filedBy->full_name,
                ] : null,
                'assigned_to'           => $complaint->assignedTo ? [
                    'id'        => $complaint->assignedTo->id,
                    'full_name' => $complaint->assignedTo->full_name,
                ] : null,
                'product'               => $complaint->product ? [
                    'id'   => $complaint->product->id,
                    'name' => $complaint->product->name,
                    'sku'  => $complaint->product->sku,
                ] : null,
                'attachments'           => $attachments,
                'activity_log'          => $activityLog,
            ],
        ]);
    }

    /**
     * Update the status of a complaint.
     */
    public function updateStatus(Request $request, Complaint $complaint): JsonResponse
    {
        $validated = $request->validate([
            'status'           => 'required|in:open,assigned,in_progress,resolved,closed',
            'resolution_notes' => [
                'nullable',
                'string',
                'max:3000',
                function ($attribute, $value, $fail) use ($request) {
                    if ($request->status === 'resolved' && empty($value)) {
                        $fail('Resolution notes are required when marking a complaint as resolved.');
                    }
                },
            ],
        ]);

        $oldStatus = $complaint->status;
        $newStatus = $validated['status'];

        $updateData = ['status' => $newStatus];

        if (isset($validated['resolution_notes'])) {
            $updateData['resolution_notes'] = $validated['resolution_notes'];
        }

        if ($newStatus === 'resolved') {
            $updateData['resolved_at'] = now();
        }

        $complaint->update($updateData);

        // Log the status change
        ComplaintActivityLog::create([
            'complaint_id' => $complaint->id,
            'user_id'      => auth()->id(),
            'action_type'  => 'status_change',
            'old_status'   => $oldStatus,
            'new_status'   => $newStatus,
        ]);

        $complaint->load(['filedBy:id,first_name,last_name', 'assignedTo:id,first_name,last_name', 'product:id,name,sku']);

        return $this->success([
            'complaint' => $this->formatListItem($complaint),
        ], 'Status updated successfully');
    }

    /**
     * Assign a complaint to a staff user.
     */
    public function assign(Request $request, Complaint $complaint): JsonResponse
    {
        $validated = $request->validate([
            'assigned_to_id' => 'required|integer|exists:users,id',
        ]);

        $assignee = User::findOrFail($validated['assigned_to_id']);

        $complaint->update([
            'assigned_to' => $assignee->id,
            'status'      => $complaint->status === 'open' ? 'assigned' : $complaint->status,
        ]);

        // Log the assignment
        ComplaintActivityLog::create([
            'complaint_id' => $complaint->id,
            'user_id'      => auth()->id(),
            'action_type'  => 'assignment',
            'body'         => "Assigned to {$assignee->full_name}",
        ]);

        $complaint->load(['filedBy:id,first_name,last_name', 'assignedTo:id,first_name,last_name', 'product:id,name,sku']);

        return $this->success([
            'complaint' => $this->formatListItem($complaint),
        ], 'Complaint assigned successfully');
    }

    /**
     * Add a comment to a complaint's activity log.
     */
    public function addComment(Request $request, Complaint $complaint): JsonResponse
    {
        $validated = $request->validate([
            'body' => 'required|string|max:2000',
        ]);

        $log = ComplaintActivityLog::create([
            'complaint_id' => $complaint->id,
            'user_id'      => auth()->id(),
            'action_type'  => 'comment',
            'body'         => $validated['body'],
        ]);

        $log->load('user:id,first_name,last_name');

        return $this->success([
            'activity_log' => [
                'id'          => $log->id,
                'action_type' => $log->action_type,
                'body'        => $log->body,
                'created_at'  => $log->created_at,
                'user'        => $log->user ? [
                    'id'        => $log->user->id,
                    'full_name' => $log->user->full_name,
                ] : null,
            ],
        ], 'Comment added successfully', 201);
    }

    /**
     * Upload an attachment to a complaint.
     */
    public function uploadAttachment(Request $request, Complaint $complaint): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:jpg,jpeg,png,gif,webp,pdf|max:5120',
        ]);

        $file         = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $storedPath   = $file->store("complaints/{$complaint->id}", 'public');

        $attachment = ComplaintAttachment::create([
            'complaint_id' => $complaint->id,
            'file_path'    => $storedPath,
            'file_name'    => $originalName,
            'uploaded_by'  => auth()->id(),
        ]);

        return $this->success([
            'attachment' => [
                'id'        => $attachment->id,
                'file_name' => $attachment->file_name,
                'file_path' => Storage::url($attachment->file_path),
                'created_at' => $attachment->created_at,
            ],
        ], 'Attachment uploaded successfully', 201);
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    /**
     * Format a complaint for list views (index / myComplaints).
     */
    private function formatListItem(Complaint $complaint): array
    {
        return [
            'id'                 => $complaint->id,
            'complaint_number'   => $complaint->complaint_number,
            'complainant_type'   => $complaint->complainant_type,
            'complainant_name'   => $complaint->complainant_name,
            'complainant_phone'  => $complaint->complainant_phone,
            'complainant_city'   => $complaint->complainant_city,
            'complaint_category' => $complaint->complaint_category,
            'status'             => $complaint->status,
            'product_name'       => $complaint->product?->name ?? $complaint->product_name_manual,
            'sku'                => $complaint->product?->sku ?? $complaint->sku_manual,
            'created_at'         => $complaint->created_at,
            'filed_by'           => $complaint->filedBy ? [
                'id'        => $complaint->filedBy->id,
                'full_name' => $complaint->filedBy->full_name,
            ] : null,
            'assigned_to'        => $complaint->assignedTo ? [
                'id'        => $complaint->assignedTo->id,
                'full_name' => $complaint->assignedTo->full_name,
            ] : null,
        ];
    }
}
