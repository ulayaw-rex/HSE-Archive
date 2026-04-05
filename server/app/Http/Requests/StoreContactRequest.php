<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // public form
    }

    public function rules(): array
    {
        return [
            'name' => 'nullable|string|max:255',
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string',
            'email' => [
                'required',
                'email:rfc,dns',
                function ($attribute, $value, $fail) {
                    $blockedDomains = [
                        'tempmail.com', '10minutemail.com', 'mailinator.com',
                        'throwawaymail.com', 'yopmail.com', 'guerrillamail.com',
                    ];
                    $domain = substr(strrchr($value, "@"), 1);
                    if (in_array($domain, $blockedDomains)) {
                        $fail('Please use a permanent email address.');
                    }
                },
            ],
        ];
    }
}
