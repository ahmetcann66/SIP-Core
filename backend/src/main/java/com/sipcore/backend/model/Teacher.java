package com.sipcore.backend.model;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "teachers")
public class Teacher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String isim;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    private String sifre;
    
    private String className; // Öğretmenin belirleyeceği sınıf adı (Örn: 11-A İngilizce)
    private String classCode; // Öğrencilere dağıtacağı benzersiz kod
    private boolean classActive = true; // true = açık, false = kapalı

    // Veritabanına kayıt olmadan hemen önce otomatik olarak 6 haneli kod üretir!
    @PrePersist
    public void generateClassCode() {
        if (this.classCode == null) {
            this.classCode = "SIP-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        }
    }

    // --- GETTER VE SETTER'LAR ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getIsim() { return isim; }
    public void setIsim(String isim) { this.isim = isim; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSifre() { return sifre; }
    public void setSifre(String sifre) { this.sifre = sifre; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public String getClassCode() { return classCode; }
    public void setClassCode(String classCode) { this.classCode = classCode; }

    public boolean isClassActive() { return classActive; }
    public void setClassActive(boolean classActive) { this.classActive = classActive; }
}