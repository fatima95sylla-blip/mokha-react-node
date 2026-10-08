package com.mokha.backend.admin;

import com.mokha.backend.auth.AuthenticatedUser;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    @GetMapping("/overview")
    public Map<String, Object> overview(@AuthenticationPrincipal AuthenticatedUser user) {
        if (user == null || user.role() != com.mokha.backend.profile.ProfileRole.ADMIN) {
            throw new AccessDeniedException("Accès réservé à l'administration.");
        }
        return Map.of(
                "role", user.role().name(),
                "modulesDisponibles", List.of("authentification", "profils", "santé"),
                "modulesEnAttente", List.of("catalogue", "commandes", "sur-mesure", "clients", "services", "FAQ", "journal"),
                "message", "Les modules métier sont encore gérés par l'ancien backend et ne sont pas encore migrés dans Spring Boot.");
    }
}