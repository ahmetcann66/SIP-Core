package com.sipcore.backend.dto;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class EnglishHubStateDto {

    private Map<String, List<WordItemDto>> words = new LinkedHashMap<>();
    private Map<String, String> notes = new LinkedHashMap<>();
    private Map<String, Map<String, List<String>>> curriculum = new LinkedHashMap<>();

    public Map<String, List<WordItemDto>> getWords() {
        return words;
    }

    public void setWords(Map<String, List<WordItemDto>> words) {
        this.words = words;
    }

    public Map<String, String> getNotes() {
        return notes;
    }

    public void setNotes(Map<String, String> notes) {
        this.notes = notes;
    }

    public Map<String, Map<String, List<String>>> getCurriculum() {
        return curriculum;
    }

    public void setCurriculum(Map<String, Map<String, List<String>>> curriculum) {
        this.curriculum = curriculum;
    }

    public static class WordItemDto {
        private String ana;
        private String turkce;
        private List<String> tabu = new ArrayList<>();

        public String getAna() {
            return ana;
        }

        public void setAna(String ana) {
            this.ana = ana;
        }

        public String getTurkce() {
            return turkce;
        }

        public void setTurkce(String turkce) {
            this.turkce = turkce;
        }

        public List<String> getTabu() {
            return tabu;
        }

        public void setTabu(List<String> tabu) {
            this.tabu = tabu;
        }
    }
}