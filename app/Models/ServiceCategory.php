<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceCategory extends Model
{
    use HasFactory;

    protected $fillable = ['business_id', 'name', 'sort_order'];

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function services()
    {
        return $this->hasMany(Service::class);
    }
}
