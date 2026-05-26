package com.sipcore.backend.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sipcore.backend.model.Teacher;
import com.sipcore.backend.repository.StudentRepository;
import com.sipcore.backend.repository.TeacherRepository;
import com.sipcore.backend.service.TeacherAnalyticsService;

@RestController
@RequestMapping("/teacher")
@CrossOrigin(origins = "*")
public class TeacherController {

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TeacherAnalyticsService teacherAnalyticsService;

    @PostMapping("/register")
    public ResponseEntity<?> registerTeacher(@RequestBody Teacher teacher) {
        Optional<Teacher> existingTeacher = teacherRepository.findByEmail(teacher.getEmail());
        if (existingTeacher.isPresent()) {
            return ResponseEntity.badRequest().body("Bu e-posta adresi zaten kullaniliyor!");
        }

        Optional<?> existingStudent = studentRepository.findByEmail(teacher.getEmail());
        if (existingStudent.isPresent()) {
            return ResponseEntity.badRequest().body("Bu e-posta adresi bir ogrenci tarafindan zaten kullaniliyor!");
        }

        Teacher savedTeacher = teacherRepository.save(teacher);
        return ResponseEntity.ok(savedTeacher);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginTeacher(@RequestBody Teacher loginRequest) {
        Optional<Teacher> teacherOpt = teacherRepository.findByEmail(loginRequest.getEmail());

        if (teacherOpt.isPresent()) {
            Teacher teacher = teacherOpt.get();
            if (teacher.getSifre().equals(loginRequest.getSifre())) {
                return ResponseEntity.ok(teacher);
            }
        }

        return ResponseEntity.status(401).body("Hatali e-posta veya sifre!");
    }

    @GetMapping("/class/{classCode}/dashboard")
    public ResponseEntity<?> getClassDashboard(@PathVariable String classCode) {
        try {
            return ResponseEntity.ok(teacherAnalyticsService.buildTeacherDashboard(classCode));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Sinif paneli yuklenemedi: " + e.getMessage());
        }
    }

    @PostMapping("/class/{classCode}/close")
    public ResponseEntity<?> closeClass(@PathVariable String classCode) {
        try {
            Optional<Teacher> opt = teacherRepository.findByClassCode(classCode);
            if (opt.isEmpty()) {
                return ResponseEntity.badRequest().body("Sinif bulunamadi");
            }

            Teacher teacher = opt.get();
            teacher.setClassActive(false);
            teacherRepository.save(teacher);
            return ResponseEntity.ok("Sinif kapatildi");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Sinif kapatma hatasi: " + e.getMessage());
        }
    }

    @PostMapping("/class/{classCode}/open")
    public ResponseEntity<?> openClass(@PathVariable String classCode) {
        try {
            Optional<Teacher> opt = teacherRepository.findByClassCode(classCode);
            if (opt.isEmpty()) {
                return ResponseEntity.badRequest().body("Sinif bulunamadi");
            }

            Teacher teacher = opt.get();
            teacher.setClassActive(true);
            teacherRepository.save(teacher);
            return ResponseEntity.ok("Sinif acildi");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Sinif acma hatasi: " + e.getMessage());
        }
    }
}
