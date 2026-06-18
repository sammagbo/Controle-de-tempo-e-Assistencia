package com.meetingmanager.api.controller;

import com.meetingmanager.api.domain.Meeting;
import com.meetingmanager.api.dto.*;
import com.meetingmanager.api.mapper.DtoMapper;
import com.meetingmanager.api.service.AttendanceService;
import com.meetingmanager.api.service.MeetingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/meetings")
public class MeetingController {

    private final MeetingService meetingService;
    private final AttendanceService attendanceService;

    public MeetingController(MeetingService meetingService, AttendanceService attendanceService) {
        this.meetingService = meetingService;
        this.attendanceService = attendanceService;
    }

    @PostMapping
    public ResponseEntity<MeetingResponse> createMeeting(@RequestBody MeetingRequest request, Authentication authentication) {
        Meeting meeting = meetingService.createMeeting(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(DtoMapper.toMeetingResponse(meeting));
    }

    @GetMapping("/active")
    public ResponseEntity<MeetingResponse> getActiveMeeting(Authentication authentication) {
        Meeting meeting = meetingService.getActiveMeeting(authentication.getName());
        return ResponseEntity.ok(DtoMapper.toMeetingResponse(meeting));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MeetingResponse> updateMeeting(@PathVariable UUID id, @RequestBody MeetingUpdateRequest request, Authentication authentication) {
        Meeting meeting = meetingService.updateMeeting(id, request, authentication.getName());
        return ResponseEntity.ok(DtoMapper.toMeetingResponse(meeting));
    }

    @PutMapping("/{id}/agenda")
    public ResponseEntity<Void> setupAgenda(@PathVariable UUID id, @RequestBody MeetingSetupRequest request, Authentication authentication) {
        meetingService.setupMeeting(id, request, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/attendance")
    public ResponseEntity<AttendanceResponse> updateAttendance(@PathVariable UUID id, @RequestBody AttendanceRequest request) {
        return ResponseEntity.ok(DtoMapper.toAttendanceResponse(attendanceService.updateAttendance(id, request)));
    }
}
