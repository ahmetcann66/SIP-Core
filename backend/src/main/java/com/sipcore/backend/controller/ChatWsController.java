package com.sipcore.backend.controller;

import com.sipcore.backend.dto.ChatMessageDto;
import com.sipcore.backend.model.ChatMessage;
import com.sipcore.backend.repository.ChatMessageRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.Instant;

@Controller
public class ChatWsController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageRepository repository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ChatWsController(SimpMessagingTemplate messagingTemplate, ChatMessageRepository repository) {
        this.messagingTemplate = messagingTemplate;
        this.repository = repository;
    }

    @MessageMapping("/chat.send")
    public void sendMessage(ChatMessageDto dto) throws Exception {
        ChatMessage cm = new ChatMessage();
        cm.setSenderEmail(dto.getSenderEmail());
        cm.setRecipientEmail(dto.getRecipientEmail());
        cm.setClassCode(dto.getClassCode());
        cm.setText(dto.getText());
        if (dto.getAttachmentUrls() != null) {
            cm.setAttachmentUrlsJson(objectMapper.writeValueAsString(dto.getAttachmentUrls()));
        }
        cm.setCreatedAt(Instant.now());
        ChatMessage saved = repository.save(cm);

        String destination = "/topic/chat." + (dto.getClassCode() == null ? "global" : dto.getClassCode());
        messagingTemplate.convertAndSend(destination, saved);
    }
}
