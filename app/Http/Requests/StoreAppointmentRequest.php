<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'service_id' => ['required', 'integer', 'exists:services,id'],
            'professional_id' => ['nullable', 'integer', 'exists:professional_profiles,id'],
            'starts_at' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'service_id.required' => 'Elige un servicio.',
            'starts_at.required' => 'Elige un horario.',
            'notes.max' => 'La nota no puede superar 500 caracteres.',
        ];
    }
}
