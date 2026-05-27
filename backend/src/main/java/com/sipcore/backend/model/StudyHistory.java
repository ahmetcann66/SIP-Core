package com.sipcore.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "study_history")
public class StudyHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long studentId;
    private String tarih;
    private String saat;
    private int sure;
    private String sinav;
    private String ders;
    private String konu;
    private int soruSayisi;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public String getTarih() { return tarih; }
    public void setTarih(String tarih) { this.tarih = tarih; }
    public String getSaat() { return saat; }
    public void setSaat(String saat) { this.saat = saat; }
    public int getSure() { return sure; }
    public void setSure(int sure) { this.sure = sure; }
    public String getSinav() { return sinav; }
    public void setSinav(String sinav) { this.sinav = sinav; }
    public String getDers() { return ders; }
    public void setDers(String ders) { this.ders = ders; }
    public String getKonu() { return konu; }
    public void setKonu(String konu) { this.konu = konu; }
    public int getSoruSayisi() { return soruSayisi; }
    public void setSoruSayisi(int soruSayisi) { this.soruSayisi = soruSayisi; }
}