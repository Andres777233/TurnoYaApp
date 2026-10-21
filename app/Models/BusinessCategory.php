<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BusinessCategory extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'description', 'icon', 'sort_order', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function businesses()
    {
        return $this->hasMany(Business::class);
    }
}
