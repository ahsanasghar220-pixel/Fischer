<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attribute;
use App\Models\AttributeValue;
use Illuminate\Http\Request;

class AttributeValueController extends Controller
{
    public function index($attributeId)
    {
        $attribute = Attribute::findOrFail($attributeId);
        $values = $attribute->values()->orderBy('value')->get();

        return $this->success(['data' => $values]);
    }

    public function store(Request $request, $attributeId)
    {
        $attribute = Attribute::findOrFail($attributeId);

        $validated = $request->validate([
            'value' => 'required|string|max:255',
            'color_code' => 'nullable|string|max:7',
        ]);

        $validated['attribute_id'] = $attribute->id;
        $value = AttributeValue::create($validated);

        return $this->success(['data' => $value], 'Attribute value created successfully', 201);
    }

    public function show($id)
    {
        $value = AttributeValue::findOrFail($id);
        return $this->success(['data' => $value]);
    }

    public function update(Request $request, $id)
    {
        $value = AttributeValue::findOrFail($id);

        $validated = $request->validate([
            'value' => 'sometimes|string|max:255',
            'color_code' => 'nullable|string|max:7',
        ]);

        $value->update($validated);

        return $this->success(['data' => $value->fresh()], 'Attribute value updated successfully');
    }

    public function destroy($id)
    {
        $value = AttributeValue::findOrFail($id);
        $value->delete();

        return $this->success(null, 'Attribute value deleted successfully');
    }
}
