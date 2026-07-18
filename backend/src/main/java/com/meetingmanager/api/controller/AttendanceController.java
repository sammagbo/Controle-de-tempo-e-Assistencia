package com.meetingmanager.api.controller;

import com.meetingmanager.api.dto.AttendanceLogResponse;
import com.meetingmanager.api.dto.AttendanceRequest;
import com.meetingmanager.api.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping
    public ResponseEntity<AttendanceLogResponse> create(@Valid @RequestBody AttendanceRequest request) {
        return ResponseEntity.ok(attendanceService.createStandalone(request));
    }

    @GetMapping
    public ResponseEntity<List<AttendanceLogResponse>> list(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime end) {
        return ResponseEntity.ok(attendanceService.listByRange(start, end));
    }
}
