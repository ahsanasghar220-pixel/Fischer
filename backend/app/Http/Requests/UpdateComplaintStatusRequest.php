<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateComplaintStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status'           => 'required|in:open,assigned,in_progress,resolved,closed',
            'resolution_notes' => 'nullable|string|max:3000',
        ];
    }
}
