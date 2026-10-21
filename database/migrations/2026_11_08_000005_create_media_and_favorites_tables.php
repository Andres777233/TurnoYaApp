<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->morphs('mediable');

            $table->string('collection', 30);
            $table->string('kind', 10)->default('image');

            $table->string('disk', 40)->default('public');
            $table->string('path');
            $table->string('thumb_path')->nullable();
            $table->string('poster_path')->nullable();

            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->unsignedSmallInteger('duration_seconds')->nullable();
            $table->unsignedBigInteger('size_bytes')->nullable();
            $table->string('mime', 100)->nullable();
            $table->string('alt_text', 255)->nullable();

            $table->string('status', 20)->default('approved');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_demo')->default(false);

            $table->timestampsTz();

            $table->index(['mediable_type', 'mediable_id', 'collection', 'sort_order'], 'media_owner_collection_idx');
        });

        Schema::create('favorites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('business_id')->constrained()->cascadeOnDelete();
            $table->boolean('notify_on_vacancy')->default(true);
            $table->timestampTz('created_at')->useCurrent();

            $table->unique(['user_id', 'business_id']);
            $table->index(['business_id', 'notify_on_vacancy']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('favorites');
        Schema::dropIfExists('media');
    }
};
