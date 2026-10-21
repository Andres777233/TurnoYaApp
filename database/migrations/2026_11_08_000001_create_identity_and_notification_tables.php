<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone', 30)->nullable()->after('email');
            $table->string('document_type', 10)->nullable()->after('phone');
            $table->text('document_number')->nullable()->after('document_type');
            $table->date('birth_date')->nullable()->after('document_number');
            $table->string('avatar_path')->nullable()->after('birth_date');
            $table->boolean('is_platform_admin')->default(false)->after('avatar_path');
            $table->boolean('is_active')->default(true)->after('is_platform_admin');
            $table->timestampTz('last_login_at')->nullable()->after('is_active');
            $table->softDeletesTz();
        });

        Schema::create('notification_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->boolean('in_app_enabled')->default(true);
            $table->boolean('email_enabled')->default(true);
            $table->boolean('push_enabled')->default(true);
            $table->boolean('reminders_enabled')->default(true);
            $table->boolean('vacancy_alerts_enabled')->default(true);
            $table->boolean('marketing_enabled')->default(false);
            $table->time('quiet_hours_start')->nullable();
            $table->time('quiet_hours_end')->nullable();
            $table->timestampsTz();
        });

        Schema::create('notification_deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('business_id')->nullable();
            $table->unsignedBigInteger('appointment_id')->nullable();
            $table->string('channel', 20);
            $table->string('type', 60);
            $table->string('dedupe_key', 191)->unique();
            $table->timestampTz('sent_at')->nullable();
            $table->timestampTz('failed_at')->nullable();
            $table->text('error')->nullable();
            $table->timestampsTz();

            $table->index(['user_id', 'type']);
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('actor_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedBigInteger('business_id')->nullable();
            $table->string('action', 80);
            $table->nullableMorphs('subject');
            $table->jsonb('metadata')->nullable();
            $table->string('ip', 45)->nullable();
            $table->string('user_agent', 255)->nullable();
            $table->timestampTz('created_at')->useCurrent();

            $table->index(['business_id', 'created_at']);
            $table->index(['action', 'created_at']);
        });

        Schema::create('idempotency_keys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('key', 191);
            $table->string('route', 191);
            $table->char('request_hash', 64);
            $table->unsignedSmallInteger('response_status')->nullable();
            $table->jsonb('response_body')->nullable();
            $table->timestampTz('expires_at');
            $table->timestampsTz();

            $table->unique(['user_id', 'key', 'route']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('idempotency_keys');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('notification_deliveries');
        Schema::dropIfExists('notification_preferences');

        Schema::table('users', function (Blueprint $table) {
            $table->dropSoftDeletesTz();
            $table->dropColumn([
                'phone', 'document_type', 'document_number', 'birth_date',
                'avatar_path', 'is_platform_admin', 'is_active', 'last_login_at',
            ]);
        });
    }
};
