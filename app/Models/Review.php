<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'appointment_id', 'business_id', 'professional_profile_id', 'customer_id',
        'rating', 'comment', 'status', 'is_demo',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'integer',
            'is_demo' => 'boolean',
        ];
    }

    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function professional()
    {
        return $this->belongsTo(ProfessionalProfile::class, 'professional_profile_id');
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }
}
