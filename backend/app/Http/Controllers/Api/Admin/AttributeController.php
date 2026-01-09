<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attribute;
use Illuminate\Http\Request;

class AttributeController extends Controller
{
    public function index(Request $request)
    {
        $attributes = Attribute::with('values')->orderBy('name')->get();

        return $this->success(['data' => $attributes]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:attributes,name',
            'type' => 'nullable|string|in:text,select,color,size',
        ]);

        $attribute = Attribute::create($validated);

        return $this->success(['data' => $attribute], 'Attribute created successfully', 201);
    }

    public function show($id)
    {
        $attribute = Attribute::with('values')->findOrFail($id);
        return $this->success(['data' => $attribute]);
    }

    public function update(Request $request, $id)
    {
        $attribute = Attribute::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255|unique:attributes,name,' . $id,
            'type' => 'nullable|string|in:text,select,color,size',
        ]);

        $attribute->update($validated);

        return $this->success(['data' => $attribute->fresh()], 'Attribute updated successfully');
    }

    public function destroy($id)
    {
        $attribute = Attribute::findOrFail($id);
        $attribute->delete();

        return $this->success(null, 'Attribute deleted successfully');
    }
}
