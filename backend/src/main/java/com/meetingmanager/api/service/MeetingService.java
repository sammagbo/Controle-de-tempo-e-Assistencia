package com.meetingmanager.api.service;

import com.meetingmanager.api.domain.*;
import com.meetingmanager.api.dto.*;
import com.meetingmanager.api.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@Transactional
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final WeekRepository weekRepository;
    private final UserRepository userRepository;

    public MeetingService(MeetingRepository meetingRepository, WeekRepository weekRepository, UserRepository userRepository) {
        this.meetingRepository = meetingRepository;
        this.weekRepository = weekRepository;
        this.userRepository = userRepository;
    }

    public Meeting createMeeting(MeetingRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Week week = weekRepository.findById(request.weekId())
                .orElseThrow(() -> new EntityNotFoundException("Week not found"));

        Meeting meeting = new Meeting();
        meeting.setWeek(week);
        meeting.setUser(user);
        meeting.setMeetingDay("Terça");
        // A agenda é montada e salva depois, em setupMeeting (tela SetupSession)
        meeting = meetingRepository.save(meeting);
        meeting.getAgendaItems().size(); // Inicializa as coleções para evitar LazyInitializationException
        meeting.getComments().size();
        if (meeting.getAttendance() != null) meeting.getAttendance().getCount();
        return meeting;
    }

    public Meeting getActiveMeeting(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Meeting meeting = meetingRepository.findAll().stream()
                .filter(m -> m.getUser().getId().equals(user.getId()))
                .filter(m -> m.getStartedAt() != null && m.getFinishedAt() == null)
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("No active meeting found"));
        
        meeting.getAgendaItems().size(); // Inicializa as coleções para evitar LazyInitializationException
        meeting.getComments().size();
        if (meeting.getAttendance() != null) meeting.getAttendance().getCount();
        return meeting;
    }

    public Meeting updateMeeting(UUID id, MeetingUpdateRequest request, String userEmail) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Meeting not found"));

        if (!meeting.getUser().getEmail().equals(userEmail)) {
            throw new IllegalArgumentException("Not authorized to update this meeting");
        }

        if (request.startedAt() != null) meeting.setStartedAt(request.startedAt());
        if (request.finishedAt() != null) meeting.setFinishedAt(request.finishedAt());
        if (request.totalDurationSeconds() != null) meeting.setTotalDurationSeconds(request.totalDurationSeconds());
        if (request.president() != null) meeting.setPresident(request.president());

        meeting = meetingRepository.save(meeting);
        meeting.getAgendaItems().size(); // Inicializa as coleções para evitar LazyInitializationException
        meeting.getComments().size();
        if (meeting.getAttendance() != null) meeting.getAttendance().getCount();
        return meeting;
    }

    public void setupMeeting(UUID id, MeetingSetupRequest request, String userEmail) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Meeting not found"));

        if (!meeting.getUser().getEmail().equals(userEmail)) {
            throw new IllegalArgumentException("Not authorized to update this meeting");
        }

        if (request.president() != null && !request.president().isBlank()) {
            meeting.setPresident(request.president());
        }
        if (meeting.getStartedAt() == null) {
            meeting.setStartedAt(OffsetDateTime.now());
        }

        // Substitui a agenda (orphanRemoval apaga as partes antigas)
        meeting.getAgendaItems().clear();
        if (request.agendaItems() != null) {
            for (AgendaItemInput in : request.agendaItems()) {
                AgendaItem item = new AgendaItem();
                item.setMeeting(meeting);
                item.setTitle(in.title());
                item.setEstimatedMinutes(in.estimatedMinutes() != null ? in.estimatedMinutes() : 0);
                item.setActualSeconds(in.actualSeconds() != null ? in.actualSeconds() : 0);
                item.setPosition(in.position() != null ? in.position() : 0);
                item.setStatus(in.status() != null ? in.status() : "upcoming");
                item.setSection(in.section() != null ? in.section() : "abertura");
                item.setAllowsComments(Boolean.TRUE.equals(in.allowsComments()));
                item.setRequiresPostComment(Boolean.TRUE.equals(in.requiresPostComment()));
                item.setAssignedNames(in.assignedNames() != null ? in.assignedNames() : "");
                item.setSkipTiming(Boolean.TRUE.equals(in.skipTiming()));
                meeting.getAgendaItems().add(item);
            }
        }

        meetingRepository.save(meeting);
    }
}
