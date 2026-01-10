<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Dealer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class DealerController extends Controller
{
    public function index(Request $request)
    {
        $page = $request->get('page', 1);
        $search = $request->get('search');
        $status = $request->get('status');
        $perPage = 15;

        // Raw query for maximum speed
        $query = DB::table('dealers')
            ->select([
                'id', 'business_name', 'contact_person', 'email',
                'phone', 'city', 'address', 'status', 'created_at',
            ])
            ->whereNull('deleted_at');

        // Search
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('business_name', 'like', "%{$search}%")
                  ->orWhere('contact_person', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($status) {
            $query->where('status', $status);
        }

        // Get total
        $total = $query->count();

        // Get paginated results
        $dealers = $query->orderByDesc('created_at')
            ->offset(($page - 1) * $perPage)
            ->limit($perPage)
            ->get();

        // Transform
        $transformedDealers = $dealers->map(function ($dealer) {
            return [
                'id' => $dealer->id,
                'business_name' => $dealer->business_name,
                'contact_person' => $dealer->contact_person,
                'email' => $dealer->email,
                'phone' => $dealer->phone,
                'city' => $dealer->city,
                'address' => $dealer->address,
                'status' => $dealer->status ?? 'pending',
                'created_at' => $dealer->created_at,
            ];
        });

        return $this->success([
            'data' => $transformedDealers,
            'meta' => [
                'current_page' => (int) $page,
                'last_page' => (int) ceil($total / $perPage),
                'total' => $total,
            ],
        ]);
    }

    public function show($id)
    {
        $dealer = DB::table('dealers')
            ->where('id', $id)
            ->whereNull('deleted_at')
            ->first();

        if (!$dealer) {
            return $this->error('Dealer not found', 404);
        }

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
