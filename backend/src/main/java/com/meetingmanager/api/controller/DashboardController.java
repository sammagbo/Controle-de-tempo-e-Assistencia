package com.meetingmanager.api.controller;

import com.meetingmanager.api.domain.Period;
import com.meetingmanager.api.repository.PeriodRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final PeriodRepository periodRepository;

    public DashboardController(PeriodRepository periodRepository) {
        this.periodRepository = periodRepository;
    }

    @GetMapping("/periods")
    public ResponseEntity<List<Period>> getAllPeriods() {
        return ResponseEntity.ok(periodRepository.findAll());
    }
}
