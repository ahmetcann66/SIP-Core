package com.sipcore.backend;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import com.sipcore.backend.model.Student;
import com.sipcore.backend.model.Teacher;
import com.sipcore.backend.repository.StudentRepository;
import com.sipcore.backend.repository.TeacherRepository;
import java.util.Optional;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    @Bean
    public CommandLineRunner resetTestAccounts(StudentRepository studentRepo, TeacherRepository teacherRepo) {
        return args -> {
            System.out.println(">>> SIP-CORE ACIL DURUM HESAP SIFIRLAMA BASLADI <<<");

            // 1. Murat Çoban (Öğrenci)
            resetStudent(studentRepo, "muratcoban295@gmail.com", "123456", "Murat Çoban");
            
            // 2. Ahmet Can Bozkurt (Öğrenci)
            resetStudent(studentRepo, "ahmetcanbozkurt295@gmail.com", "baba6638.", "Ahmet Can Bozkurt");

            // 3. Murat Hoca (Öğretmen)
            resetTeacher(teacherRepo, "muratcoban1295@gmail.com", "123456", "Murat Hoca");

            System.out.println(">>> SIP-CORE HESAPLAR BASARIYLA SENKRONIZE EDILDI <<<");
        };
    }

    private void resetStudent(StudentRepository repo, String email, String pass, String name) {
        Optional<Student> opt = repo.findByEmail(email.toLowerCase());
        Student s = opt.orElse(new Student());
        s.setEmail(email.toLowerCase());
        s.setSifre(pass);
        s.setIsim(name);
        if (s.getEngLevel() == 0) s.setEngLevel(1);
        if (s.getSipLevel() == 0) s.setSipLevel(1);
        repo.save(s);
        System.out.println("Student Synced: " + email);
    }

    private void resetTeacher(TeacherRepository repo, String email, String pass, String name) {
        Optional<Teacher> opt = repo.findByEmail(email.toLowerCase());
        Teacher t = opt.orElse(new Teacher());
        t.setEmail(email.toLowerCase());
        t.setSifre(pass);
        t.setIsim(name);
        t.setClassActive(true);
        if (t.getClassCode() == null) t.setClassCode("SIP-HOCA");
        repo.save(t);
        System.out.println("Teacher Synced: " + email);
    }
}