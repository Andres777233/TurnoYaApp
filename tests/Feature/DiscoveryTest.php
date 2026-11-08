<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\BusinessCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class DiscoveryTest extends TestCase
{
    use RefreshDatabase;

    public function test_landing_page_lists_published_businesses_only(): void
    {
        $published = Business::factory()->create(['name' => 'Casa Abierta']);
        Business::factory()->unpublished()->create(['name' => 'Casa Cerrada']);

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('welcome')
                ->has('featured', 1)
                ->where('featured.0.name', $published->name)
                ->where('featured.0.is_demo', false)
            );
    }

    public function test_search_filters_by_category(): void
    {
        $barbers = BusinessCategory::factory()->create(['slug' => 'barberias', 'name' => 'Barberías']);
        $nails = BusinessCategory::factory()->create(['slug' => 'unas', 'name' => 'Uñas']);

        Business::factory()->create(['name' => 'Barbería Uno', 'business_category_id' => $barbers->id]);
        Business::factory()->create(['name' => 'Estudio Dos', 'business_category_id' => $nails->id]);

        $this->get('/descubrir?categoria=barberias')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('discover/index')
                ->has('results.data', 1)
                ->where('results.data.0.name', 'Barbería Uno')
            );
    }

    public function test_search_filters_by_neighbourhood(): void
    {
        Business::factory()->create(['name' => 'Centro', 'neighborhood' => 'Centro Histórico']);
        Business::factory()->create(['name' => 'Norte', 'neighborhood' => 'La Esmeralda']);

        $this->get('/descubrir?zona='.urlencode('La Esmeralda'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('results.data', 1)
                ->where('results.data.0.name', 'Norte')
            );
    }

    public function test_unpublished_business_profile_is_not_public(): void
    {
        $business = Business::factory()->unpublished()->create();

        $this->get("/negocios/{$business->slug}")->assertNotFound();
    }

    public function test_published_business_profile_is_public(): void
    {
        $business = Business::factory()->create();

        $this->get("/negocios/{$business->slug}")
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('businesses/show')
                ->where('business.slug', $business->slug)
            );
    }
}
