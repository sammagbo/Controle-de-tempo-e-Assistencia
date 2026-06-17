package com.meetingmanager.api.controller;

import com.meetingmanager.api.domain.Period;
import com.meetingmanager.api.dto.WeekResponse;
import com.meetingmanager.api.repository.PeriodRepository;
import com.meetingmanager.api.repository.WeekRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final PeriodRepository periodRepository;
    private final WeekRepository weekRepository;

    public DashboardController(PeriodRepository periodRepository, WeekRepository weekRepository) {
        this.periodRepository = periodRepository;
        this.weekRepository = weekRepository;
    }

    @GetMapping("/periods")
    public ResponseEntity<List<Period>> getAllPeriods() {
        return ResponseEntity.ok(periodRepository.findAll());
    }

    @GetMapping("/weeks")
    public ResponseEntity<List<WeekResponse>> getWeeks(@RequestParam("periodId") UUID periodId) {
        List<WeekResponse> weeks = weekRepository.findByPeriod_IdOrderByLabelAsc(periodId).stream()
            .map(w -> new WeekResponse(w.getId(), periodId, w.getLabel(), w.getDateRange(), w.getTheme(), w.getStatus()))
            .toList();
        return ResponseEntity.ok(weeks);
    }
}
