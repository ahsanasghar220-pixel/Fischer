<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Dealer;
use Illuminate\Http\Request;

class DealerController extends Controller
{
    public function index(Request $request)
    {
        $query = Dealer::query();

        // Search
        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('business_name', 'like', "%{$search}%")
                  ->orWhere('contact_person', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        $dealers = $query->orderByDesc('created_at')->paginate(15);

        // Transform for frontend
        $transformedDealers = collect($dealers->items())->map(function ($dealer) {
            return [
                'id' => $dealer->id,
                'business_name' => $dealer->business_name,
                'contact_person' => $dealer->contact_person,
                'email' => $dealer->email,
                'phone' => $dealer->phone,
                'city' => $dealer->city,
                'address' => $dealer->address,
                'status' => $dealer->status ?? 'pending',
                'created_at' => $dealer->created_at->toISOString(),
            ];
        });

        return $this->success([
            'data' => $transformedDealers,
            'meta' => [
                'current_page' => $dealers->currentPage(),
                'last_page' => $dealers->lastPage(),
                'total' => $dealers->total(),
            ],
        ]);
    }

    public function show($id)
    {
        $dealer = Dealer::findOrFail($id);

        return $this->success([
            'data' => $dealer,
        ]);
    }

    public function update(Request $request, $id)
    {
        $dealer = Dealer::findOrFail($id);

        $validated = $request->validate([
            'business_name' => 'sometimes|string|max:255',
            'contact_person' => 'sometimes|string|max:255',
            'email' => 'sometimes|email',
            'phone' => 'sometimes|string|max:20',
            'city' => 'sometimes|string|max:100',
            'address' => 'sometimes|string|max:500',
            'status' => 'sometimes|string|in:pending,approved,rejected,suspended',
        ]);

        $dealer->update($validated);

        return $this->success([
            'data' => $dealer->fresh(),
        ], 'Dealer updated successfully');
    }

    public function destroy($id)
    {
        $dealer = Dealer::findOrFail($id);
        $dealer->delete();

        return $this->success(null, 'Dealer deleted successfully');
    }

    public function approve($id)
    {
        $dealer = Dealer::findOrFail($id);
        $dealer->update(['status' => 'approved']);

        return $this->success([
            'data' => $dealer->fresh(),
        ], 'Dealer approved successfully');
    }

    public function reject($id)
    {
        $dealer = Dealer::findOrFail($id);
        $dealer->update(['status' => 'rejected']);

        return $this->success([
            'data' => $dealer->fresh(),
        ], 'Dealer rejected successfully');
    }
}
