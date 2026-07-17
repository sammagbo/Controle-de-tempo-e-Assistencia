package com.meetingmanager.api.service;

import com.meetingmanager.api.domain.Attendance;
import com.meetingmanager.api.domain.Meeting;
import com.meetingmanager.api.dto.AttendanceLogResponse;
import com.meetingmanager.api.dto.AttendanceRequest;
import com.meetingmanager.api.mapper.DtoMapper;
import com.meetingmanager.api.repository.AttendanceRepository;
import com.meetingmanager.api.repository.MeetingRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final MeetingRepository meetingRepository;

    public AttendanceService(AttendanceRepository attendanceRepository, MeetingRepository meetingRepository) {
        this.attendanceRepository = attendanceRepository;
        this.meetingRepository = meetingRepository;
    }

    public Attendance updateAttendance(UUID meetingId, AttendanceRequest request) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new EntityNotFoundException("Meeting not found"));

        Attendance attendance = meeting.getAttendance();
        if (attendance == null) {
            attendance = new Attendance();
            attendance.setMeeting(meeting);
        }

        if (request.presencial() != null) attendance.setPresencial(request.presencial());
        if (request.zoom() != null) attendance.setZoom(request.zoom());
        attendance.setCount(attendance.getPresencial() + attendance.getZoom());

        return attendanceRepository.save(attendance);
    }

    public AttendanceLogResponse createStandalone(AttendanceRequest request) {
        Attendance attendance = new Attendance();
        attendance.setMeeting(null);
        attendance.setPresencial(request.presencial() != null ? request.presencial() : 0);
        attendance.setZoom(request.zoom() != null ? request.zoom() : 0);
        attendance.setCount(attendance.getPresencial() + attendance.getZoom());
        Attendance saved = attendanceRepository.save(attendance);
        return DtoMapper.toAttendanceLogResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<AttendanceLogResponse> listByRange(OffsetDateTime start, OffsetDateTime end) {
        return attendanceRepository
            .findByCreatedAtGreaterThanEqualAndCreatedAtLessThanOrderByCreatedAtDesc(start, end)
            .stream()
            .map(DtoMapper::toAttendanceLogResponse)
            .collect(Collectors.toList());
    }
}
