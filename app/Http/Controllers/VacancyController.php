<?php

namespace App\Http\Controllers;

use App\Domain\Booking\Actions\CreateAppointment;
use App\Domain\Booking\Exceptions\BookingException;
use App\Models\VacancyOffer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VacancyController extends Controller
{
    /**
     * "El más rápido se lo queda": the first transaction that succeeds creates
     * the appointment; the PostgreSQL exclusion constraint is the arbiter.
     */
    public function claim(
        Request $request,
        VacancyOffer $offer,
        CreateAppointment $createAppointment,
    ): RedirectResponse {
        $user = $request->user();

        abort_unless($offer->status === 'open' && $offer->expires_at->isFuture(), 410, 'Este cupo ya no está disponible.');

        $favorite = $user->favorites()->where('business_id', $offer->business_id)->first();

        abort_unless($favorite, 403, 'Este cupo es solo para clientes del local.');

        $offer->load(['business', 'service', 'professional']);

        try {
            $appointment = DB::transaction(function () use ($user, $offer, $createAppointment) {
                $locked = VacancyOffer::query()->lockForUpdate()->find($offer->id);

                abort_unless($locked && $locked->status === 'open', 409, 'Otro cliente se quedó con este turno.');

                $appointment = $createAppointment->handle(
                    $user,
                    $offer->business,
                    $offer->service,
                    $offer->professional,
                    $offer->starts_at,
                );

                $locked->update([
                    'status' => 'claimed',
                    'claimed_by' => $user->id,
                    'claimed_at' => now(),
                ]);

                return $appointment;
            });
        } catch (BookingException $exception) {
            return redirect('/turnos')->with('error', $exception->userMessage);
        }

        return redirect()
            ->route('appointments.show', ['appointment' => $appointment->code])
            ->with('success', '¡Listo! El turno es tuyo.');
    }
}
