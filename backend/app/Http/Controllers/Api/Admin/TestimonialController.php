<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TestimonialController extends Controller
{
    public function index(Request $request)
    {
        try {
            $testimonials = DB::table('testimonials')->orderByDesc('created_at')->paginate(15);

            return $this->success([
                'data' => $testimonials->items(),
                'meta' => [
                    'current_page' => $testimonials->currentPage(),
                    'last_page' => $testimonials->lastPage(),
                    'total' => $testimonials->total(),
                ],
            ]);
        } catch (\Exception $e) {
            return $this->success(['data' => [], 'meta' => ['current_page' => 1, 'last_page' => 1, 'total' => 0]]);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'content' => 'required|string',
            'rating' => 'required|integer|min:1|max:5',
            'image' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $validated['created_at'] = now();
        $validated['updated_at'] = now();

        try {
            $id = DB::table('testimonials')->insertGetId($validated);
            $testimonial = DB::table('testimonials')->find($id);

            return $this->success(['data' => $testimonial], 'Testimonial created successfully', 201);
        } catch (\Exception $e) {
            return $this->error('Failed to create testimonial: ' . $e->getMessage(), 500);
        }
    }

    public function show($id)
    {
        $testimonial = DB::table('testimonials')->find($id);

        if (!$testimonial) {
            return $this->error('Testimonial not found', 404);
        }

        return $this->success(['data' => $testimonial]);
    }

    public function update(Request $request, $id)
    {
        $testimonial = DB::table('testimonials')->find($id);

        if (!$testimonial) {
            return $this->error('Testimonial not found', 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'location' => 'nullable|string|max:255',
            'content' => 'sometimes|string',
            'rating' => 'sometimes|integer|min:1|max:5',
            'image' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $validated['updated_at'] = now();
        DB::table('testimonials')->where('id', $id)->update($validated);

        return $this->success(['data' => DB::table('testimonials')->find($id)], 'Testimonial updated successfully');
    }

    public function destroy($id)
    {
        DB::table('testimonials')->where('id', $id)->delete();

        return $this->success(null, 'Testimonial deleted successfully');
    }
}
