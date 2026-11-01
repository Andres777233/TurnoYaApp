<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\BusinessController;
use App\Http\Controllers\DemoController;
use App\Http\Controllers\DiscoverController;
use App\Http\Controllers\ExploreController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\LegalController;
use App\Http\Controllers\MapController;
use App\Http\Controllers\PanelController;
use App\Http\Controllers\ProfessionalController;
use App\Http\Controllers\TipController;
use App\Http\Controllers\VacancyController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Experiencia funcional: la app abre en Explorar, no en una landing.
Route::get('/', ExploreController::class)->name('home');
Route::get('/mapa', MapController::class)->name('map');
Route::get('/descubrir', DiscoverController::class)->name('discover');
Route::get('/acerca', fn () => Inertia::render('about'))->name('about');
Route::get('/legal/{document}', [LegalController::class, 'show'])->name('legal.show');

Route::get('/negocios/{business:slug}', [BusinessController::class, 'show'])->name('businesses.show');
Route::get('/negocios/{business:slug}/reservar', [BookingController::class, 'show'])->name('booking.show');
Route::get('/negocios/{business:slug}/disponibilidad', [BookingController::class, 'availability'])->name('booking.availability');
Route::get('/profesionales/{professional:slug}', [ProfessionalController::class, 'show'])->name('professionals.show');
Route::get('/propina/{professional:slug}', TipController::class)->name('tips.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('/negocios/{business:slug}/reservar', [BookingController::class, 'store'])->name('booking.store');

    Route::get('/favoritos', [FavoriteController::class, 'index'])->name('favorites.index');
    Route::post('/favoritos/{business}/alternar', [FavoriteController::class, 'toggle'])->name('favorites.toggle');
    Route::post('/favoritos/{business}/avisos', [FavoriteController::class, 'notifications'])->name('favorites.notifications');

    Route::get('/turnos', [AppointmentController::class, 'index'])->name('appointments.index');
    Route::get('/reservas/{appointment:code}', [AppointmentController::class, 'show'])->name('appointments.show');
    Route::post('/reservas/{appointment:code}/cancelar', [AppointmentController::class, 'cancel'])->name('appointments.cancel');
    Route::post('/reservas/{appointment:code}/confirmar', [AppointmentController::class, 'confirm'])->name('appointments.confirm');

    Route::post('/cupos/{offer}/reclamar', [VacancyController::class, 'claim'])->name('vacancy.claim');

    Route::get('/dashboard', AccountController::class)->name('dashboard');

    Route::prefix('panel')->name('panel.')->group(function () {
        Route::get('/agenda', [PanelController::class, 'agenda'])->name('agenda');
        Route::get('/perfil', [PanelController::class, 'perfil'])->name('perfil');
        Route::get('/propinas', [PanelController::class, 'propinas'])->name('propinas');
        Route::get('/negocio', [PanelController::class, 'negocio'])->name('negocio');
        Route::get('/equipo', [PanelController::class, 'equipo'])->name('equipo');
        Route::get('/ingresos', [PanelController::class, 'ingresos'])->name('ingresos');
        Route::post('/citas/{appointment:code}/atender', [PanelController::class, 'complete'])->name('complete');
        Route::post('/propinas/{method}/visibilidad', [PanelController::class, 'toggleTip'])->name('tips.toggle');
    });
});

// Modo de prueba: solo existe cuando APP_ENV=local (config app.demo_mode).
Route::prefix('_demo')->name('demo.')->group(function () {
    Route::post('/rol', [DemoController::class, 'switchRole'])->name('role');
    Route::post('/recordatorio', [DemoController::class, 'reminder'])->name('reminder');
    Route::post('/cupo', [DemoController::class, 'vacancy'])->name('vacancy');
});

require __DIR__.'/settings.php';
