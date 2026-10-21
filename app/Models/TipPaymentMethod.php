<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TipPaymentMethod extends Model
{
    protected $fillable = [
        'professional_profile_id', 'type', 'label', 'account_holder',
        'account_value', 'qr_path', 'payment_link', 'instructions',
        'is_visible', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_visible' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function professional()
    {
        return $this->belongsTo(ProfessionalProfile::class, 'professional_profile_id');
    }

    public function qrUrl(): ?string
    {
        return $this->qr_path ? asset('storage/'.$this->qr_path) : null;
    }

    public function typeLabel(): string
    {
        return match ($this->type) {
            'nequi' => 'Nequi',
            'bancolombia' => 'Bancolombia',
            'daviplata' => 'Daviplata',
            'nu' => 'Nu',
            default => 'Link de pago',
        };
    }
}
