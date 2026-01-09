<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NewsletterController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = DB::table('newsletter_subscribers');

            if ($search = $request->get('search')) {
                $query->where('email', 'like', "%{$search}%");
            }

            $subscribers = $query->orderByDesc('created_at')->paginate(15);

            return $this->success([
                'data' => $subscribers->items(),
                'meta' => [
                    'current_page' => $subscribers->currentPage(),
                    'last_page' => $subscribers->lastPage(),
                    'total' => $subscribers->total(),
                ],
            ]);
        } catch (\Exception $e) {
            return $this->success(['data' => [], 'meta' => ['current_page' => 1, 'last_page' => 1, 'total' => 0]]);
        }
    }

    public function destroy($id)
    {
        DB::table('newsletter_subscribers')->where('id', $id)->delete();

        return $this->success(null, 'Subscriber removed successfully');
    }

    public function export()
    {
        try {
            $subscribers = DB::table('newsletter_subscribers')->select('email', 'created_at')->get();

            $csv = "Email,Subscribed At\n";
            foreach ($subscribers as $subscriber) {
                $csv .= "{$subscriber->email},{$subscriber->created_at}\n";
            }

            return response($csv, 200, [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="newsletter_subscribers.csv"',
            ]);
        } catch (\Exception $e) {
            return $this->error('Failed to export subscribers', 500);
        }
    }
}
