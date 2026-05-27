package com.sipcore.backend.controller;

import java.io.File;
import java.io.FileOutputStream;
import java.net.URLEncoder;
import java.nio.file.Files;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.sipcore.backend.model.ChatMessage;
import com.sipcore.backend.repository.ChatMessageRepository;

import jakarta.mail.internet.MimeMessage;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    private final File uploadDir = new File("backend-uploads");

    @Autowired
    private ChatMessageRepository chatRepo;

    @Autowired
    private JavaMailSender mailSender;

    public ChatController() {
        if (!uploadDir.exists()) uploadDir.mkdirs();
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            String original = StringUtils.cleanPath(file.getOriginalFilename());
            String stamp = DateTimeFormatter.ofPattern("yyyyMMddHHmmss").withZone(ZoneOffset.UTC).format(java.time.Instant.now());
            String safeName = URLEncoder.encode(stamp + "_" + original, "UTF-8");
            File out = new File(uploadDir, safeName);
            try (FileOutputStream fos = new FileOutputStream(out)) {
                fos.write(file.getBytes());
            }
            String url = "/api/chat/file/" + safeName;
            return ResponseEntity.ok(Map.of("url", url, "name", original));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/file/")
    public ResponseEntity<?> listFiles() {
        String[] names = uploadDir.list();
        return ResponseEntity.ok(names == null ? new String[0] : names);
    }

    @GetMapping("/file/{name}")
    public ResponseEntity<?> serveFile(@PathVariable String name) {
        try {
            File f = new File(uploadDir, name);
            if (!f.exists()) return ResponseEntity.status(404).body("Not found");
            String contentType = Files.probeContentType(f.toPath());
            byte[] data = Files.readAllBytes(f.toPath());
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + name + "\"")
                .contentType(contentType == null ? MediaType.APPLICATION_OCTET_STREAM : MediaType.parseMediaType(contentType))
                .body(data);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PostMapping("/message")
    public ResponseEntity<?> postMessage(@RequestBody ChatMessage msg) {
        msg.setCreatedAt(java.time.Instant.now());
        ChatMessage saved = chatRepo.save(msg);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/messages")
    public ResponseEntity<?> getMessages(@RequestParam(required = false) String classCode, @RequestParam(required = false) String participant) {
        try {
            if (classCode != null && !classCode.isBlank()) {
                List<ChatMessage> list = chatRepo.findByClassCodeOrderByCreatedAtAsc(classCode);
                return ResponseEntity.ok(list);
            }
            if (participant != null && !participant.isBlank()) {
                List<ChatMessage> list = chatRepo.findBySenderEmailOrRecipientEmailOrderByCreatedAtAsc(participant, participant);
                return ResponseEntity.ok(list);
            }
            List<ChatMessage> all = chatRepo.findAll();
            return ResponseEntity.ok(all);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PostMapping("/send-email")
    public ResponseEntity<?> sendEmail(@RequestBody Map<String, Object> payload) {
        try {
            String to = (String) payload.get("to");
            String subject = (String) payload.getOrDefault("subject", "SIP Core Mesaj");
            String body = (String) payload.getOrDefault("body", "");
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true);
            // attachments can be provided as list of file urls relative to /api/chat/file/{name}
            Object attaches = payload.get("attachments");
            if (attaches instanceof List) {
                @SuppressWarnings("unchecked")
                List<Object> list = (List<Object>) attaches;
                for (Object o : list) {
                    String url = String.valueOf(o);
                    if (url.startsWith("/api/chat/file/")) {
                        String name = url.substring(url.lastIndexOf('/') + 1);
                        File f = new File(uploadDir, name);
                        if (f.exists()) helper.addAttachment(f.getName(), f);
                    }
                }
            }
            mailSender.send(message);
            return ResponseEntity.ok(Map.of("status", "sent"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }
}
