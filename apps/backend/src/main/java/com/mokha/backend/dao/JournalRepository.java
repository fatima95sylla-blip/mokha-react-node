package com.mokha.backend.dao;

import com.mokha.backend.entities.JournalArticleEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface JournalRepository extends JpaRepository<JournalArticleEntity, UUID> {
    Optional<JournalArticleEntity> findBySlug(String slug);
}
