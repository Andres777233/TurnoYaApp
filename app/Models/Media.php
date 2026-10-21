<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Facades\Storage;

class Media extends Model
{
    use HasFactory;

    protected $table = 'media';

    protected $fillable = [
        'mediable_type', 'mediable_id', 'collection', 'kind', 'disk', 'path',
        'thumb_path', 'poster_path', 'width', 'height', 'duration_seconds',
        'size_bytes', 'mime', 'alt_text', 'status', 'sort_order', 'is_demo',
    ];

    protected function casts(): array
    {
        return [
            'width' => 'integer',
            'height' => 'integer',
            'duration_seconds' => 'integer',
            'size_bytes' => 'integer',
            'sort_order' => 'integer',
            'is_demo' => 'boolean',
        ];
    }

    public function mediable(): MorphTo
    {
        return $this->morphTo();
    }

    public function url(): string
    {
        return Storage::disk($this->disk)->url($this->path);
    }

    public function thumbUrl(): string
    {
        return $this->thumb_path
            ? Storage::disk($this->disk)->url($this->thumb_path)
            : $this->url();
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }
}
