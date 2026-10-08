package com.mokha.backend.dao;

import com.mokha.backend.entities.ContactMessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ContactMessageRepository extends JpaRepository<ContactMessageEntity, UUID> {
}
