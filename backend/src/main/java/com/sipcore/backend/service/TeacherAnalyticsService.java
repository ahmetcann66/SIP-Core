package com.sipcore.backend.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.sipcore.backend.model.Student;
import com.sipcore.backend.model.StudyHistory;
import com.sipcore.backend.model.Teacher;
import com.sipcore.backend.repository.StudentRepository;
import com.sipcore.backend.repository.StudyHistoryRepository;
import com.sipcore.backend.repository.TeacherRepository;

import jakarta.mail.internet.MimeMessage;

@Service
public class TeacherAnalyticsService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private StudyHistoryRepository studyHistoryRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private JavaMailSender mailSender;

    public Student assignStudentToClass(Long studentId, String classCode) {
        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new IllegalArgumentException("Ogrenci bulunamadi!"));

        Teacher teacher = teacherRepository.findByClassCode(classCode)
            .orElseThrow(() -> new IllegalArgumentException("Sınıf kodu bulunamadı!"));

        String existingCode = student.getTeacherCode();
        if (existingCode != null && !existingCode.isBlank() && !existingCode.equals(classCode)) {
            throw new IllegalArgumentException("Bu öğrenci zaten başka bir sınıfa kayıtlı!");
        }

        student.setTeacherCode(teacher.getClassCode());
        return studentRepository.save(student);
    }

    public Map<String, Object> buildTeacherDashboard(String classCode) {
        Teacher teacher = teacherRepository.findByClassCode(classCode)
            .orElseThrow(() -> new IllegalArgumentException("Sınıf bulunamadı!"));

        List<Map<String, Object>> students = buildStudentStats(classCode);

        Map<String, Object> dashboard = new LinkedHashMap<>();
        dashboard.put("teacher", teacher);
        dashboard.put("className", teacher.getClassName());
        dashboard.put("classCode", teacher.getClassCode());
        dashboard.put("studentCount", students.size());
        dashboard.put("students", students);
        dashboard.put("topStudents", students.stream().limit(3).collect(Collectors.toList()));
        return dashboard;
    }

    public List<Map<String, Object>> buildStudentStats(String classCode) {
        List<Student> students = studentRepository.findByTeacherCode(classCode);
        if (students.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> studentIds = students.stream().map(Student::getId).toList();
        List<StudyHistory> histories = studyHistoryRepository.findByStudentIdInOrderByIdDesc(studentIds);

        Map<Long, List<StudyHistory>> historiesByStudent = histories.stream()
            .collect(Collectors.groupingBy(StudyHistory::getStudentId, LinkedHashMap::new, Collectors.toList()));

        List<Map<String, Object>> stats = new ArrayList<>();
        for (Student student : students) {
            List<StudyHistory> studentHistories = historiesByStudent.getOrDefault(student.getId(), Collections.emptyList());
            int totalStudyMinutes = studentHistories.stream().mapToInt(StudyHistory::getSure).sum();
            int activityCount = studentHistories.size();
            String latestActivity = studentHistories.isEmpty() ? "Henüz kayıt yok" : formatHistory(studentHistories.get(0));
            String recentTopics = studentHistories.stream()
                .limit(3)
                .map(this::formatHistory)
                .collect(Collectors.joining(" | "));

            int successScore = calculateSuccessScore(student, totalStudyMinutes, activityCount);

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", student.getId());
            row.put("isim", student.getIsim());
            row.put("email", student.getEmail());
            row.put("teacherCode", student.getTeacherCode());
            row.put("toplamCalismaSuresiDakika", totalStudyMinutes);
            row.put("calismaKaydiSayisi", activityCount);
            row.put("sonCalisma", latestActivity);
            row.put("sonKonular", recentTopics);
            row.put("basariPuani", successScore);
            stats.add(row);
        }

        stats.sort((left, right) -> Integer.compare(
            ((Number) right.get("basariPuani")).intValue(),
            ((Number) left.get("basariPuani")).intValue()
        ));
        return stats;
    }

    public List<Map<String, Object>> buildTopStudents(String classCode, int limit) {
        return buildStudentStats(classCode).stream().limit(limit).collect(Collectors.toList());
    }

    public void sendWeeklyTeacherReports() {
        List<Teacher> teachers = teacherRepository.findAll();
        for (Teacher teacher : teachers) {
            if (teacher.getEmail() == null || !teacher.getEmail().contains("@")) {
                continue;
            }

            List<Map<String, Object>> topStudents = buildTopStudents(teacher.getClassCode(), 3);
            if (topStudents.isEmpty()) {
                continue;
            }

            String subject = "S.I.P. Core - " + safeClassName(teacher) + " Haftalık Sınıf Raporu";
            String html = buildTeacherReportHtml(teacher, topStudents);
            sendHtmlEmail(teacher.getEmail(), subject, html);
        }
    }

    private int calculateSuccessScore(Student student, int totalStudyMinutes, int activityCount) {
        return totalStudyMinutes + student.getSipXp() + student.getEngXp() + (student.getSipLevel() * 10) + (student.getEngLevel() * 10) + (student.getSipStreak() * 5) + activityCount;
    }

    private String formatHistory(StudyHistory history) {
        String ders = history.getDers() == null || history.getDers().isBlank() ? "Ders yok" : history.getDers();
        String konu = history.getKonu() == null || history.getKonu().isBlank() ? "Konu yok" : history.getKonu();
        String tarih = history.getTarih() == null || history.getTarih().isBlank() ? "Tarih yok" : history.getTarih();
        String sure = history.getSure() > 0 ? history.getSure() + " dk" : "Süre yok";
        return tarih + " - " + ders + " / " + konu + " / " + sure;
    }

    private String buildTeacherReportHtml(Teacher teacher, List<Map<String, Object>> topStudents) {
        StringBuilder html = new StringBuilder();
        html.append("<div style='font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;background:#f3f4f6;padding:30px;'>");
        html.append("<div style='max-width:760px;margin:0 auto;background:#fff;border-radius:18px;padding:36px;box-shadow:0 8px 24px rgba(15,23,42,0.08);'>");
        html.append("<h1 style='margin:0;color:#1d4ed8;'>S.I.P. Core</h1>");
        html.append("<p style='margin:8px 0 20px 0;color:#475569;font-size:18px;'>Haftalık öğretmen sınıf raporu</p>");
        html.append("<div style='background:#eff6ff;border:1px solid #bfdbfe;padding:16px 18px;border-radius:12px;margin-bottom:24px;'>");
        html.append("<strong>Sınıf:</strong> ").append(escapeHtml(safeClassName(teacher))).append("<br>");
        html.append("<strong>Sınıf Kodu:</strong> ").append(escapeHtml(teacher.getClassCode())).append("<br>");
        html.append("<strong>Öğretmen:</strong> ").append(escapeHtml(teacher.getIsim())).append("</div>");

        html.append("<table style='width:100%;border-collapse:collapse;'>");
        html.append("<thead><tr>");
        html.append(tableHeadCell("#"));
        html.append(tableHeadCell("Ad Soyad"));
        html.append(tableHeadCell("E-posta"));
        html.append(tableHeadCell("Çalışma"));
        html.append(tableHeadCell("Başarı"));
        html.append("</tr></thead><tbody>");

        for (int i = 0; i < topStudents.size(); i++) {
            Map<String, Object> student = topStudents.get(i);
            html.append("<tr style='border-top:1px solid #e5e7eb;'>");
            html.append(tableBodyCell(String.valueOf(i + 1)));
            html.append(tableBodyCell(student.get("isim")));
            html.append(tableBodyCell(student.get("email")));
            html.append(tableBodyCell(student.get("toplamCalismaSuresiDakika") + " dk / " + student.get("calismaKaydiSayisi") + " kayıt"));
            html.append(tableBodyCell(student.get("basariPuani") + " puan"));
            html.append("</tr>");
        }

        html.append("</tbody></table>");
        html.append("<p style='margin-top:24px;color:#64748b;font-size:13px;'>Bu rapor sınıftaki en yüksek başarı puanına göre sıralanmıştır.</p>");
        html.append("</div></div>");
        return html.toString();
    }

    private String tableHeadCell(String text) {
        return "<th style='text-align:left;padding:12px 10px;background:#f8fafc;color:#334155;font-size:13px;border-bottom:1px solid #e2e8f0;'>" + escapeHtml(text) + "</th>";
    }

    private String tableBodyCell(Object value) {
        return "<td style='padding:12px 10px;color:#0f172a;font-size:14px;vertical-align:top;'>" + escapeHtml(value == null ? "" : String.valueOf(value)) + "</td>";
    }

    private String safeClassName(Teacher teacher) {
        return teacher.getClassName() == null || teacher.getClassName().isBlank() ? "Sınıfı Olmayan Öğretmen" : teacher.getClassName();
    }

    private String escapeHtml(String value) {
        return value == null ? "" : value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;").replace("'", "&#39;");
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom("sipcore.noreply@gmail.com");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("HTML Mail Gönderilemedi (" + to + "): " + e.getMessage());
        }
    }
}