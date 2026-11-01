<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class LegalController extends Controller
{
    private const DOCUMENTS = [
        'privacidad' => [
            'title' => 'Política de privacidad',
            'intro' => 'Cómo tratamos tus datos personales en TurnoYa.',
        ],
        'terminos' => [
            'title' => 'Términos de uso',
            'intro' => 'Condiciones para usar la plataforma y reservar citas.',
        ],
        'datos' => [
            'title' => 'Tratamiento de datos personales',
            'intro' => 'Autorización y derechos bajo la Ley 1581 de 2012.',
        ],
    ];

    public function show(string $document): Response
    {
        abort_unless(isset(self::DOCUMENTS[$document]), 404);

        return Inertia::render('legal/show', [
            'document' => $document,
            'title' => self::DOCUMENTS[$document]['title'],
            'intro' => self::DOCUMENTS[$document]['intro'],
        ]);
    }
}
