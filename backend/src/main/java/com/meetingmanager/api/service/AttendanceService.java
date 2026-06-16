package com.meetingmanager.api.service;

import com.meetingmanager.api.domain.Attendance;
import com.meetingmanager.api.domain.Meeting;
import com.meetingmanager.api.dto.AttendanceRequest;
import com.meetingmanager.api.repository.AttendanceRepository;
import com.meetingmanager.api.repository.MeetingRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

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
}
