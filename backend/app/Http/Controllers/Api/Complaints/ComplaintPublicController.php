<?php

namespace App\Http\Controllers\Api\Complaints;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use Illuminate\Http\JsonResponse;

class ComplaintPublicController extends Controller
{
    /**
     * Public complaint tracking — no auth required.
     * Returns limited info only; no personal data exposed.
     */
    public function track(string $reference): JsonResponse
    {
        $complaint = Complaint::whereRaw('LOWER(complaint_number) = ?', [strtolower($reference)])->first();

        if (! $complaint) {
            return $this->error('Complaint not found', 404);
        }

        return $this->success([
            'complaint' => [
                'complaint_number'   => $complaint->complaint_number,
                'complaint_category' => $complaint->complaint_category,
                'status'             => $complaint->status,
                'description'        => mb_substr($complaint->description, 0, 100),
                'created_at'         => $complaint->created_at,
                'resolved_at'        => $complaint->resolved_at,
            ],
        ]);
    }
}
