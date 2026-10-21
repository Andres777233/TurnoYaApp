<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class City extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'department', 'slug', 'center_latitude', 'center_longitude',
        'radius_km', 'timezone', 'is_active', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'center_latitude' => 'decimal:7',
            'center_longitude' => 'decimal:7',
            'radius_km' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function businesses()
    {
        return $this->hasMany(Business::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
