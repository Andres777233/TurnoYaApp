<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\PresentsBusinesses;
use App\Models\Business;
use App\Models\Favorite;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FavoriteController extends Controller
{
    use PresentsBusinesses;

    public function index(Request $request): Response
    {
        $favorites = $request->user()
            ->favorites()
            ->with(['business.category', 'business.city'])
            ->latest('created_at')
            ->get()
            ->filter(fn (Favorite $favorite) => $favorite->business?->is_published);

        return Inertia::render('favorites/index', [
            'favorites' => $favorites->map(fn (Favorite $favorite) => [
                ...$this->presentCard($favorite->business),
                'is_favorite' => true,
                'notify_on_vacancy' => $favorite->notify_on_vacancy,
            ])->values(),
        ]);
    }

    public function toggle(Request $request, Business $business): RedirectResponse
    {
        abort_unless($business->is_published, 404);

        $favorite = Favorite::query()
            ->where('user_id', $request->user()->id)
            ->where('business_id', $business->id)
            ->first();

        if ($favorite) {
            $favorite->delete();
            $business->decrement('favorites_count');

            return back()->with('success', 'Quitado de favoritos.');
        }

        Favorite::create([
            'user_id' => $request->user()->id,
            'business_id' => $business->id,
            'notify_on_vacancy' => true,
            'created_at' => now(),
        ]);

        $business->increment('favorites_count');

        return back()->with('success', 'Guardado en favoritos. Te avisamos si se libera un turno.');
    }

    public function notifications(Request $request, Business $business): RedirectResponse
    {
        $favorite = Favorite::query()
            ->where('user_id', $request->user()->id)
            ->where('business_id', $business->id)
            ->firstOrFail();

        $favorite->update(['notify_on_vacancy' => ! $favorite->notify_on_vacancy]);

        return back();
    }
}
