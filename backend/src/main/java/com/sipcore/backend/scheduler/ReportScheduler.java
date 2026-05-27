package com.sipcore.backend.scheduler;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.sipcore.backend.service.TeacherAnalyticsService;

@Component
@EnableScheduling
public class ReportScheduler {

    @Autowired
    private TeacherAnalyticsService teacherAnalyticsService;

    // Her Pazartesi saat 10:00'da çalışır
    @Scheduled(cron = "0 0 10 * * MON")     
    public void sendWeeklyReports() {
        teacherAnalyticsService.sendWeeklyTeacherReports();
    }
}