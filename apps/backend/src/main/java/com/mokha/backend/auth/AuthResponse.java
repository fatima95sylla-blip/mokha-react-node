package com.mokha.backend.auth;

public record AuthResponse(String accessToken, String tokenType, long expiresIn, ProfileResponse profile) {
}