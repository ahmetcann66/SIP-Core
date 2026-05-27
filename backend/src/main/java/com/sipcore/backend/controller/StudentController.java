package com.sipcore.backend.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sipcore.backend.model.Student;
import com.sipcore.backend.model.StudyHistory;
import com.sipcore.backend.repository.StudentRepository;
import com.sipcore.backend.repository.StudyHistoryRepository;
import com.sipcore.backend.repository.TeacherRepository;
import com.sipcore.backend.service.TeacherAnalyticsService;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/students")
public class StudentController {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private StudyHistoryRepository studyHistoryRepository;
    
    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private TeacherAnalyticsService teacherAnalyticsService;

    public static class JoinClassRequest {
        private Long studentId;
        private String classCode;

        public Long getStudentId() { return studentId; }
        public void setStudentId(Long studentId) { this.studentId = studentId; }
        public String getClassCode() { return classCode; }
        public void setClassCode(String classCode) { this.classCode = classCode; }
    }

    public static class JoinClassByEmailRequest {
        private String email;
        private String classCode;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getClassCode() { return classCode; }
        public void setClassCode(String classCode) { this.classCode = classCode; }
    }

    // KAYIT
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Student student) {
        try {
            if (studentRepository.existsByEmail(student.getEmail())) {
                return ResponseEntity.badRequest().body("Bu e-posta adresi zaten kullaniliyor!");
            }
            // Öğretmen tablosunda da kontrol et
            if (teacherRepository.findByEmail(student.getEmail()).isPresent()) {
                return ResponseEntity.badRequest().body("Bu e-posta adresi bir öğretmen tarafından zaten kullaniliyor!");
            }
            Student saved = studentRepository.save(student);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Kayıt hatası: " + e.getMessage());
        }
    }

    // GIRIS
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Student student) {
        try {
            System.out.println("DEBUG StudentController.login payload -> email='" + student.getEmail() + "' sifre='" + student.getSifre() + "'");
        } catch (Exception e) {
            System.out.println("DEBUG StudentController.login: failed to read payload: " + e.getMessage());
        }
        Optional<Student> found = studentRepository.findByEmailAndSifre(student.getEmail(), student.getSifre());
        if (found.isPresent()) {
            return ResponseEntity.ok(found.get());
        } else {
            return ResponseEntity.badRequest().body("E-posta veya sifre hatali!");
        }
    }

    // SINIFA KATIL
    @PostMapping("/join-class")
    public ResponseEntity<?> joinClass(@RequestBody JoinClassRequest request) {
        try {
            Student updated = teacherAnalyticsService.assignStudentToClass(request.getStudentId(), request.getClassCode());
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Sınıfa katılma hatası: " + e.getMessage());
        }
    }

    @PostMapping("/join-class-by-email")
    public ResponseEntity<?> joinClassByEmail(@RequestBody JoinClassByEmailRequest request) {
        try {
            if (request.getEmail() == null || request.getEmail().isBlank()) {
                return ResponseEntity.badRequest().body("E-posta zorunlu");
            }
            if (request.getClassCode() == null || request.getClassCode().isBlank()) {
                return ResponseEntity.badRequest().body("Sınıf kodu zorunlu");
            }

            Optional<Student> studentOpt = studentRepository.findByEmail(request.getEmail().trim().toLowerCase());
            if (studentOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Öğrenci bulunamadı");
            }

            Student updated = teacherAnalyticsService.assignStudentToClass(
                studentOpt.get().getId(),
                request.getClassCode().trim().toUpperCase()
            );
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Sınıfa katılma hatası: " + e.getMessage());
        }
    }

    // INGILIZCE XP & LEVEL GUNCELLE
    @PostMapping("/update-eng")
    public ResponseEntity<?> updateEng(@RequestBody Student update) {
        Optional<Student> opt = studentRepository.findById(update.getId());
        if (opt.isEmpty()) return ResponseEntity.badRequest().body("Ogrenci bulunamadi!");
        Student s = opt.get();
        
        s.setEngXp(update.getEngXp());
        s.setEngLevel(update.getEngLevel());
        
        // YENİ EKLENEN KISIM: Kelimeleri de veritabanına yazıyoruz!
        s.setOgrenilenKelimeler(update.getOgrenilenKelimeler());
        s.setKacirilanlar(update.getKacirilanlar());
        
        studentRepository.save(s);
        return ResponseEntity.ok(s);
    }
    // SIP XP, LEVEL, STREAK GUNCELLE
    @PostMapping("/update-sip")
    public ResponseEntity<?> updateSip(@RequestBody Student update) {
        Optional<Student> opt = studentRepository.findById(update.getId());
        if (opt.isEmpty()) return ResponseEntity.badRequest().body("Ogrenci bulunamadi!");
        Student s = opt.get();
        s.setSipXp(update.getSipXp());
        s.setSipLevel(update.getSipLevel());
        s.setSipStreak(update.getSipStreak());
        s.setSipLastDate(update.getSipLastDate());
        studentRepository.save(s);
        return ResponseEntity.ok(s);
    }

    // CALISMA GECMISI KAYDET
    @PostMapping("/save-history")
    public ResponseEntity<?> saveHistory(@RequestBody StudyHistory history) {
        StudyHistory saved = studyHistoryRepository.save(history);
        return ResponseEntity.ok(saved);
    }

    // CALISMA GECMISI GETIR
    @GetMapping("/history/{studentId}")
    public ResponseEntity<?> getHistory(@PathVariable Long studentId) {
        List<StudyHistory> list = studyHistoryRepository.findByStudentIdOrderByIdDesc(studentId);
        return ResponseEntity.ok(list);
    }

    // GENERIC UPDATE - frontend may call PUT /update/{id} with mixed payload
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateStudent(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Optional<Student> opt = studentRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.badRequest().body("Ogrenci bulunamadi!");
        try {
            Student s = opt.get();

            // numeric helpers
            Object o;
            o = payload.get("engXp"); if (o != null) s.setEngXp(((Number)o).intValue());
            o = payload.get("engLevel"); if (o != null) s.setEngLevel(((Number)o).intValue());
            o = payload.get("sipXp"); if (o != null) s.setSipXp(((Number)o).intValue());
            o = payload.get("sipLevel"); if (o != null) s.setSipLevel(((Number)o).intValue());
            o = payload.get("sipStreak"); if (o != null) s.setSipStreak(((Number)o).intValue());
            o = payload.get("sipLastDate"); if (o != null) s.setSipLastDate(String.valueOf(o));

            // stringified lists
            o = payload.get("ogrenilenKelimeler"); if (o != null) s.setOgrenilenKelimeler(String.valueOf(o));
            o = payload.get("kacirilanlar"); if (o != null) s.setKacirilanlar(String.valueOf(o));
            o = payload.get("sipHistory"); if (o != null) s.setSipHistory(String.valueOf(o));
            o = payload.get("dna"); if (o != null) s.setDna(String.valueOf(o));

            // also accept eng/kayit fields directly
            o = payload.get("isim"); if (o != null) s.setIsim(String.valueOf(o));

            studentRepository.save(s);
            return ResponseEntity.ok(s);
        } catch (ClassCastException cce) {
            return ResponseEntity.badRequest().body("Payload tipleri hatali: " + cce.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Guncelleme hatasi: " + e.getMessage());
        }
    }
}