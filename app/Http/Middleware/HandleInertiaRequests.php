<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();
        $roleView = 'cliente';
        $businessSlug = null;

        if ($user) {
            $membership = $user->memberships()
                ->where('status', 'active')
                ->orderByRaw("CASE role WHEN 'owner' THEN 0 WHEN 'admin' THEN 1 ELSE 2 END")
                ->first();

            if ($membership) {
                $businessSlug = $membership->business?->slug;

                if ($membership->role->value === 'owner') {
                    $roleView = $membership->performs_services ? 'dueno_barbero' : 'dueno_admin';
                } elseif ($membership->role->value === 'admin') {
                    $roleView = 'dueno_admin';
                } else {
                    $roleView = 'barbero';
                }
            }
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user,
                'role_view' => $roleView,
                'business_slug' => $businessSlug,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'demoMode' => (bool) config('app.demo_mode'),
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
