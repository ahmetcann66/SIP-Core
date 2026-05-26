package com.sipcore.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sipcore.backend.model.StudyHistory;

public interface StudyHistoryRepository extends JpaRepository<StudyHistory, Long> {
    List<StudyHistory> findByStudentIdOrderByIdDesc(Long studentId);
    List<StudyHistory> findByStudentIdInOrderByIdDesc(List<Long> studentIds);
}