package com.sipcore.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String isim;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    private String sifre;
    private String teacherCode;
    
    // Eski şema uyumluluğu için
    @Column(columnDefinition = "INT DEFAULT 1")
    private int level = 1;
    
    // --- ENGLISH HUB (İNGİLİZCE) VERİLERİ ---
    private int xp = 0;
    private int engXp = 0;
    private int engLevel = 1;
    
    @Column(columnDefinition = "TEXT")
    private String ogrenilenKelimeler; 
    
    @Column(columnDefinition = "TEXT")
    private String kacirilanlar;

    // --- S.I.P. CORE (AKADEMİK) VERİLERİ ---
    private int sipXp = 0;
    private int sipLevel = 1;
    private int sipStreak = 0;
    private String sipLastDate = "";
    
    @Column(columnDefinition = "LONGTEXT")
    private String sipHistory; 
    
    @Column(columnDefinition = "TEXT")
    private String dna;

    // --- GETTER VE SETTER METODLARI ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getIsim() { return isim; }
    public void setIsim(String isim) { this.isim = isim; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getSifre() { return sifre; }
    public void setSifre(String sifre) { this.sifre = sifre; }
    
    public int getEngXp() { return engXp; }
    public void setEngXp(int engXp) { this.engXp = engXp; }
    
    public int getXp() { return xp; }
    public void setXp(int xp) { this.xp = xp; }
    
    public int getEngLevel() { return engLevel; }
    public void setEngLevel(int engLevel) { this.engLevel = engLevel; }
    
    public String getOgrenilenKelimeler() { return ogrenilenKelimeler; }
    public void setOgrenilenKelimeler(String ogrenilenKelimeler) { this.ogrenilenKelimeler = ogrenilenKelimeler; }
    
    public String getKacirilanlar() { return kacirilanlar; }
    public void setKacirilanlar(String kacirilanlar) { this.kacirilanlar = kacirilanlar; }
    
    public int getSipXp() { return sipXp; }
    public void setSipXp(int sipXp) { this.sipXp = sipXp; }
    
    public int getSipLevel() { return sipLevel; }
    public void setSipLevel(int sipLevel) { this.sipLevel = sipLevel; }
    
    public int getSipStreak() { return sipStreak; }
    public void setSipStreak(int sipStreak) { this.sipStreak = sipStreak; }
    
    public String getSipLastDate() { return sipLastDate; }
    public void setSipLastDate(String sipLastDate) { this.sipLastDate = sipLastDate; }
    
    public String getSipHistory() { return sipHistory; }
    public void setSipHistory(String sipHistory) { this.sipHistory = sipHistory; }
    
    public String getDna() { return dna; }
    public void setDna(String dna) { this.dna = dna; }
    public String getTeacherCode() { return teacherCode; }
    public void setTeacherCode(String teacherCode) { this.teacherCode = teacherCode; }
    public int getLevel() { return level; }
    public void setLevel(int level) { this.level = level; }
}