<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ContactMessageController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = DB::table('contact_messages');

            if ($status = $request->get('status')) {
                $query->where('status', $status);
            }

            $messages = $query->orderByDesc('created_at')->paginate(15);

            return $this->success([
                'data' => $messages->items(),
                'meta' => [
                    'current_page' => $messages->currentPage(),
                    'last_page' => $messages->lastPage(),
                    'total' => $messages->total(),
                ],
            ]);
        } catch (\Exception $e) {
            return $this->success(['data' => [], 'meta' => ['current_page' => 1, 'last_page' => 1, 'total' => 0]]);
        }
    }

    public function show($id)
    {
        $message = DB::table('contact_messages')->find($id);

        if (!$message) {
            return $this->error('Contact message not found', 404);
        }

        // Mark as read
        if ($message->status === 'unread') {
            DB::table('contact_messages')->where('id', $id)->update(['status' => 'read', 'updated_at' => now()]);
            $message = DB::table('contact_messages')->find($id);
        }

        return $this->success(['data' => $message]);
    }

    public function update(Request $request, $id)
    {
        $message = DB::table('contact_messages')->find($id);

        if (!$message) {
            return $this->error('Contact message not found', 404);
        }

        $validated = $request->validate([
            'status' => 'sometimes|string|in:unread,read,replied,archived',
            'notes' => 'nullable|string',
        ]);

        $validated['updated_at'] = now();
        DB::table('contact_messages')->where('id', $id)->update($validated);

        return $this->success(['data' => DB::table('contact_messages')->find($id)], 'Contact message updated successfully');
    }

    public function destroy($id)
    {
        DB::table('contact_messages')->where('id', $id)->delete();

        return $this->success(null, 'Contact message deleted successfully');
    }
}
