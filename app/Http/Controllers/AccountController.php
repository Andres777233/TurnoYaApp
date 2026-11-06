<?php

namespace App\Http\Controllers;

use App\Domain\Booking\Enums\AppointmentStatus;
use App\Models\Appointment;
use App\Models\BusinessMembership;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        $next = Appointment::query()
            ->with(['business', 'service', 'professional'])
            ->where('customer_id', $user->id)
            ->whereIn('status', [
                AppointmentStatus::PendingPayment->value,
                AppointmentStatus::Confirmed->value,
                AppointmentStatus::AttendanceConfirmed->value,
            ])
            ->where('starts_at', '>=', now())
            ->orderBy('starts_at')
            ->first();

        $memberships = BusinessMembership::query()
            ->with('business')
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->get();

        return Inertia::render('account/index', [
            'next' => $next ? [
                'code' => $next->code,
                'service' => $next->service->name,
                'business' => $next->business->name,
                'professional' => $next->professional->display_name,
                'date' => $next->starts_at->copy()->setTimezone($next->business->timezone)
                    ->locale('es')->translatedFormat('l, d \d\e F'),
                'time' => $next->starts_at->copy()->setTimezone($next->business->timezone)->format('H:i'),
            ] : null,
            'stats' => [
                'upcoming' => Appointment::query()
                    ->where('customer_id', $user->id)
                    ->whereIn('status', [
                        AppointmentStatus::PendingPayment->value,
                        AppointmentStatus::Confirmed->value,
                        AppointmentStatus::AttendanceConfirmed->value,
                    ])
                    ->where('starts_at', '>=', now())
                    ->count(),
                'history' => Appointment::query()
                    ->where('customer_id', $user->id)
                    ->count(),
                'favorites' => $user->favorites()->count(),
            ],
            'businesses' => $memberships->map(fn (BusinessMembership $membership) => [
                'name' => $membership->business->name,
                'slug' => $membership->business->slug,
                'role' => $membership->role->label(),
                'is_demo' => $membership->business->is_demo,
            ]),
        ]);
    }
}
