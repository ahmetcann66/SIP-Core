package com.sipcore.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sipcore.backend.model.Student;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    // Giriş yaparken email ve şifre kontrolü için
    Optional<Student> findByEmailAndSifre(String email, String sifre);
    
    // Kayıt olurken bu email daha önce alınmış mı kontrolü için
    boolean existsByEmail(String email);
    Optional<Student> findByEmail(String email);
    List<Student> findByTeacherCode(String teacherCode);
}