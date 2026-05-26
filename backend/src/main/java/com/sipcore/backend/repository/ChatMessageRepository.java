package com.sipcore.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sipcore.backend.model.ChatMessage;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByClassCodeOrderByCreatedAtAsc(String classCode);
    List<ChatMessage> findBySenderEmailOrRecipientEmailOrderByCreatedAtAsc(String sender, String recipient);
}
