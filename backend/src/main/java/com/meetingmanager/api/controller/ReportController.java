package com.meetingmanager.api.controller;

import com.meetingmanager.api.domain.Meeting;
import com.meetingmanager.api.domain.User;
import com.meetingmanager.api.dto.MeetingResponse;
import com.meetingmanager.api.mapper.DtoMapper;
import com.meetingmanager.api.repository.MeetingRepository;
import com.meetingmanager.api.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/v1/reports")
public class ReportController {

    private final MeetingRepository meetingRepository;
    private final UserRepository userRepository;

    public ReportController(MeetingRepository meetingRepository, UserRepository userRepository) {
        this.meetingRepository = meetingRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    @GetMapping("/history")
    public ResponseEntity<List<MeetingResponse>> getHistory(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        List<MeetingResponse> history = meetingRepository.findAll().stream()
                .filter(m -> m.getUser().getId().equals(user.getId()))
                .filter(m -> m.getFinishedAt() != null)
                .map(DtoMapper::toMeetingResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(history);
    }

    @Transactional(readOnly = true)
    @GetMapping("/meetings/{id}")
    public ResponseEntity<MeetingResponse> getMeetingReport(@PathVariable UUID id, Authentication authentication) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Meeting not found"));

        if (!meeting.getUser().getEmail().equals(authentication.getName())) {
            throw new IllegalArgumentException("Not authorized to view this meeting report");
        }

        return ResponseEntity.ok(DtoMapper.toMeetingResponse(meeting));
    }
}
