<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePublicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        $isDraft = $this->boolean('save_as_draft');

        return [
            'title' => 'required|string',
            'body' => $isDraft ? 'nullable|string' : 'required|string',
            'category' => 'required|string',
            'writer_ids' => 'required|array',
            'writer_ids.*' => 'exists:users,id',
            'image' => 'nullable|image|max:51200',
            'byline' => 'nullable|string',
            'date_published' => 'nullable|date',
            'save_as_draft' => 'nullable|boolean',
        ];
    }
}
