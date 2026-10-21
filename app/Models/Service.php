<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Service extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'business_id', 'service_category_id', 'name', 'slug', 'description',
        'duration_minutes', 'buffer_minutes', 'price_cents', 'is_active', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'duration_minutes' => 'integer',
            'buffer_minutes' => 'integer',
            'price_cents' => 'integer',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function category()
    {
        return $this->belongsTo(ServiceCategory::class, 'service_category_id');
    }

    public function professionals()
    {
        return $this->belongsToMany(ProfessionalProfile::class, 'professional_service')
            ->withPivot(['price_cents', 'duration_minutes', 'is_active'])
            ->withTimestamps();
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
