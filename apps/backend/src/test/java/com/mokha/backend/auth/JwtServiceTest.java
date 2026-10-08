package com.mokha.backend.auth;

import com.mokha.backend.profile.Profile;
import com.mokha.backend.profile.ProfileRole;
import org.junit.jupiter.api.Test;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {
    private static final String SECRET = "test-secret-with-at-least-32-bytes-long";

    @Test
    void issuesAndParsesSignedTokenWithServerAssignedRole() {
        JwtService jwtService = new JwtService(SECRET, Duration.ofMinutes(15));
        Profile profile = new Profile("client@example.test", "unused-hash", "Client", null, ProfileRole.CLIENT);

        AuthenticatedUser user = jwtService.parse(jwtService.issue(profile));

        assertThat(user.id()).isEqualTo(profile.getId());
        assertThat(user.email()).isEqualTo("client@example.test");
        assertThat(user.role()).isEqualTo(ProfileRole.CLIENT);
        assertThat(jwtService.expirationSeconds()).isEqualTo(900);
    }

    @Test
    void rejectsSigningSecretsShorterThan256Bits() {
        assertThatThrownBy(() -> new JwtService("too-short", Duration.ofMinutes(15)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("32 bytes");
    }
}