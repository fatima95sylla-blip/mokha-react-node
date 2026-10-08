package com.mokha.backend.auth;

import com.mokha.backend.profile.Profile;
import com.mokha.backend.profile.ProfileRepository;
import com.mokha.backend.profile.ProfileRole;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.UUID;

@Service
public class AuthService {
    private final ProfileRepository profiles;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(ProfileRepository profiles, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.profiles = profiles;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        validateBcryptLength(request.password());
        if (profiles.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Un compte avec cet e-mail existe déjà.");
        }
        Profile profile = profiles.save(new Profile(
                email,
                passwordEncoder.encode(request.password()),
                request.fullName(),
                request.phone(),
                ProfileRole.CLIENT));
        return createResponse(profile);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        validateBcryptLength(request.password());
        Profile profile = profiles.findByEmail(normalizeEmail(request.email()))
                .filter(candidate -> passwordEncoder.matches(request.password(), candidate.getPasswordHash()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-mail ou mot de passe invalide."));
        return createResponse(profile);
    }

    @Transactional(readOnly = true)
    public ProfileResponse currentProfile(UUID profileId) {
        return profiles.findById(profileId)
                .map(ProfileResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Profil introuvable."));
    }

    private AuthResponse createResponse(Profile profile) {
        return new AuthResponse(jwtService.issue(profile), "Bearer", jwtService.expirationSeconds(), ProfileResponse.from(profile));
    }

    private static String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private static void validateBcryptLength(String password) {
        if (password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le mot de passe dépasse la limite prise en charge.");
        }
    }
}