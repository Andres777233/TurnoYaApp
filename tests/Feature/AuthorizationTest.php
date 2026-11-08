<?php

namespace Tests\Feature;

use App\Domain\Identity\Enums\Capability;
use App\Domain\Identity\Enums\MembershipRole;
use App\Models\Business;
use App\Models\BusinessMembership;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_owners_hold_every_capability(): void
    {
        $business = Business::factory()->create();
        $owner = User::factory()->create();

        BusinessMembership::create([
            'business_id' => $business->id,
            'user_id' => $owner->id,
            'role' => MembershipRole::Owner,
            'status' => 'active',
            'can_manage_business' => false,
            'can_manage_team' => false,
            'can_view_finances' => false,
            'performs_services' => false,
        ]);

        foreach (Capability::cases() as $capability) {
            $this->assertTrue($owner->canFor($business, $capability), $capability->value);
        }
    }

    public function test_professionals_only_get_the_capabilities_that_were_granted(): void
    {
        $business = Business::factory()->create();
        $professional = User::factory()->create();

        BusinessMembership::create([
            'business_id' => $business->id,
            'user_id' => $professional->id,
            'role' => MembershipRole::Professional,
            'status' => 'active',
            'performs_services' => true,
        ]);

        $this->assertTrue($professional->canFor($business, Capability::PerformServices));
        $this->assertFalse($professional->canFor($business, Capability::ManageTeam));
        $this->assertFalse($professional->canFor($business, Capability::ViewFinances));
        $this->assertFalse($professional->canFor($business, Capability::ManageBusiness));
    }

    public function test_revoked_memberships_lose_access_immediately(): void
    {
        $business = Business::factory()->create();
        $user = User::factory()->create();

        BusinessMembership::create([
            'business_id' => $business->id,
            'user_id' => $user->id,
            'role' => MembershipRole::Admin,
            'status' => 'revoked',
            'can_manage_business' => true,
            'can_manage_team' => true,
        ]);

        $this->assertFalse($user->canFor($business, Capability::ManageBusiness));
        $this->assertFalse($user->belongsToBusiness($business));
    }

    public function test_a_user_without_membership_has_no_capabilities(): void
    {
        $business = Business::factory()->create();
        $stranger = User::factory()->create();

        $this->assertFalse($stranger->canFor($business, Capability::PerformServices));
        $this->assertSame([], $stranger->capabilitiesFor($business));
    }
}
