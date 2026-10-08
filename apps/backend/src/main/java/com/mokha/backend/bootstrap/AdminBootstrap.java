package com.mokha.backend.bootstrap;

import com.mokha.backend.profile.Profile;
import com.mokha.backend.profile.ProfileRepository;
import com.mokha.backend.profile.ProfileRole;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.Locale;

@Component
public class AdminBootstrap implements ApplicationRunner {
    private final ProfileRepository profiles;
    private final PasswordEncoder passwordEncoder;
    private final String email;
    private final String password;

    public AdminBootstrap(
            ProfileRepository profiles,
            PasswordEncoder passwordEncoder,
            @Value("${app.bootstrap-admin.email:}") String email,
            @Value("${app.bootstrap-admin.password:}") String password) {
        this.profiles = profiles;
        this.passwordEncoder = passwordEncoder;
        this.email = email.trim().toLowerCase(Locale.ROOT);
        this.password = password;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (email.isBlank() && password.isBlank()) {
            return;
        }
        if (email.isBlank() || password.isBlank()) {
            throw new IllegalStateException("ADMIN_BOOTSTRAP_EMAIL et ADMIN_BOOTSTRAP_PASSWORD doivent être définis ensemble.");
        }
        validatePassword(password);
        var existing = profiles.findByEmail(email);
        if (existing.isPresent()) {
            if (existing.get().getRole() != ProfileRole.ADMIN) {
                throw new IllegalStateException("L'e-mail de bootstrap existe déjà avec le rôle CLIENT; aucun rôle n'a été modifié.");
            }
            return;
        }
        profiles.save(new Profile(email, passwordEncoder.encode(password), null, null, ProfileRole.ADMIN));
    }

    private static void validatePassword(String value) {
        int bytes = value.getBytes(StandardCharsets.UTF_8).length;
        if (value.length() < 8 || bytes > 72) {
            throw new IllegalStateException("Le mot de passe admin doit avoir au moins 8 caractères et au plus 72 octets UTF-8.");
        }
    }
}