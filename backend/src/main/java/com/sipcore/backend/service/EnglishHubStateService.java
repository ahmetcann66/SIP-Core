package com.sipcore.backend.service;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sipcore.backend.dto.EnglishHubStateDto;
import com.sipcore.backend.model.EnglishHubState;
import com.sipcore.backend.repository.EnglishHubStateRepository;

@Service
public class EnglishHubStateService {

    private static final String WORDS_KEY = "WORDS";
    private static final String NOTES_KEY = "NOTES";
    private static final String CURRICULUM_KEY = "CURRICULUM";

    @Autowired
    private EnglishHubStateRepository repository;

    @Autowired
    private ObjectMapper objectMapper;

    public EnglishHubStateDto loadState() {
        EnglishHubStateDto dto = new EnglishHubStateDto();
        dto.setWords(readWords());
        dto.setNotes(readNotes());
        dto.setCurriculum(readCurriculum());
        return dto;
    }

    public EnglishHubStateDto saveState(EnglishHubStateDto state) {
        EnglishHubStateDto safeState = state == null ? new EnglishHubStateDto() : state;
        writePayload(WORDS_KEY, safeState.getWords());
        writePayload(NOTES_KEY, safeState.getNotes());
        writePayload(CURRICULUM_KEY, safeState.getCurriculum());
        return loadState();
    }

    private LinkedHashMap<String, List<EnglishHubStateDto.WordItemDto>> readWords() {
        return readPayload(WORDS_KEY, new TypeReference<LinkedHashMap<String, List<EnglishHubStateDto.WordItemDto>>>() {});
    }

    private LinkedHashMap<String, String> readNotes() {
        return readPayload(NOTES_KEY, new TypeReference<LinkedHashMap<String, String>>() {});
    }

    private LinkedHashMap<String, Map<String, List<String>>> readCurriculum() {
        return readPayload(CURRICULUM_KEY, new TypeReference<LinkedHashMap<String, Map<String, List<String>>>>() {});
    }

    private <T> T readPayload(String key, TypeReference<T> typeReference) {
        return repository.findByStateKey(key)
            .map(item -> {
                try {
                    T value = objectMapper.readValue(item.getPayloadJson(), typeReference);
                    return value == null ? emptyValue(typeReference) : value;
                } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
                    return emptyValue(typeReference);
                }
            })
            .orElseGet(() -> emptyValue(typeReference));
    }

    @SuppressWarnings("unchecked")
    private <T> T emptyValue(TypeReference<T> typeReference) {
        String typeName = typeReference.getType().getTypeName();
        if (typeName.contains("WordItemDto")) {
            return (T) new LinkedHashMap<String, List<EnglishHubStateDto.WordItemDto>>();
        }
        if (typeName.contains("Map<java.lang.String, java.lang.String>")) {
            return (T) new LinkedHashMap<String, String>();
        }
        return (T) new LinkedHashMap<String, Map<String, List<String>>>();
    }

    private void writePayload(String key, Object payload) {
        try {
            EnglishHubState entity = repository.findByStateKey(key).orElseGet(EnglishHubState::new);
            entity.setStateKey(key);
            entity.setPayloadJson(objectMapper.writeValueAsString(payload == null ? new LinkedHashMap<>() : payload));
            entity.setUpdatedAt(Instant.now());
            repository.save(entity);
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            throw new IllegalStateException("English Hub verisi kaydedilemedi: " + e.getMessage(), e);
        }
    }
}