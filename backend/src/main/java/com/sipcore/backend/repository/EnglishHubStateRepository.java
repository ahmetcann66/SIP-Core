package com.sipcore.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sipcore.backend.model.EnglishHubState;

public interface EnglishHubStateRepository extends JpaRepository<EnglishHubState, Long> {
    Optional<EnglishHubState> findByStateKey(String stateKey);
}