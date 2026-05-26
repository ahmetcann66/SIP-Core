package com.sipcore.backend.model;

import java.time.Instant;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;

@Entity
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String senderEmail;
    private String recipientEmail; // optional: direct recipient
    private String classCode; // optional: class target

    @Lob
    private String text;

    @Lob
    private String attachmentUrlsJson; // JSON array string of uploaded file URLs

    private Instant createdAt = Instant.now();

    public ChatMessage() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSenderEmail() { return senderEmail; }
    public void setSenderEmail(String senderEmail) { this.senderEmail = senderEmail; }
    public String getRecipientEmail() { return recipientEmail; }
    public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }
    public String getClassCode() { return classCode; }
    public void setClassCode(String classCode) { this.classCode = classCode; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public String getAttachmentUrlsJson() { return attachmentUrlsJson; }
    public void setAttachmentUrlsJson(String attachmentUrlsJson) { this.attachmentUrlsJson = attachmentUrlsJson; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
