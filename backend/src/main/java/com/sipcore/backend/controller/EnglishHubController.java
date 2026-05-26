package com.sipcore.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sipcore.backend.dto.EnglishHubStateDto;
import com.sipcore.backend.service.EnglishHubStateService;

@RestController
@RequestMapping("/api/english-hub")
@CrossOrigin(origins = "*")
public class EnglishHubController {

    @Autowired
    private EnglishHubStateService englishHubStateService;

    @GetMapping("/state")
    public ResponseEntity<?> getState() {
        return ResponseEntity.ok(englishHubStateService.loadState());
    }

    @PutMapping("/state")
    public ResponseEntity<?> saveState(@RequestBody EnglishHubStateDto state) {
        return ResponseEntity.ok(englishHubStateService.saveState(state));
    }
}