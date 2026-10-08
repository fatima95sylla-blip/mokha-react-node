package com.mokha.backend.auth;

import com.mokha.backend.profile.Profile;
import com.mokha.backend.profile.ProfileRole;

import java.util.UUID;

public record ProfileResponse(UUID id, String email, String fullName, String phone, ProfileRole role) {
    public static ProfileResponse from(Profile profile) {
        return new ProfileResponse(
                profile.getId(),
                profile.getEmail(),
                profile.getFullName(),
                profile.getPhone(),
                profile.getRole());
    }
}