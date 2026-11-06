<?php

namespace App\Http\Controllers;

use App\Models\ProfessionalProfile;
use App\Models\TipPaymentMethod;
use Inertia\Inertia;
use Inertia\Response;

class TipController extends Controller
{
    public function __invoke(ProfessionalProfile $professional): Response
    {
        abort_unless($professional->is_public && $professional->business->is_published, 404);

        $professional->load('business');

        return Inertia::render('tips/show', [
            'professional' => [
                'name' => $professional->display_name,
                'slug' => $professional->slug,
                'headline' => $professional->headline,
                'avatar' => $professional->avatar_path ? asset('storage/'.$professional->avatar_path) : null,
                'is_demo' => $professional->is_demo,
            ],
            'business' => [
                'name' => $professional->business->name,
                'slug' => $professional->business->slug,
            ],
            'methods' => TipPaymentMethod::query()
                ->where('professional_profile_id', $professional->id)
                ->where('is_visible', true)
                ->orderBy('sort_order')
                ->get()
                ->map(fn (TipPaymentMethod $method) => [
                    'id' => $method->id,
                    'type' => $method->type,
                    'type_label' => $method->typeLabel(),
                    'account_value' => $method->account_value,
                    'account_holder' => $method->account_holder,
                    'qr' => $method->qrUrl(),
                    'link' => $method->payment_link,
                    'instructions' => $method->instructions,
                ]),
        ]);
    }
}
