package com.meetingmanager.api.service;

import com.meetingmanager.api.domain.*;
import com.meetingmanager.api.dto.*;
import com.meetingmanager.api.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
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
        meeting.setMeetingDay("Terça"); // Poderia ser configurável
        
        // Criar estrutura padrão de Agenda Items
        meeting.setAgendaItems(createDefaultAgendaItems(meeting));

        return meetingRepository.save(meeting);
    }

    public Meeting getActiveMeeting(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
                
        // Encontrar reunião do usuário que foi iniciada mas não finalizada
        return meetingRepository.findAll().stream()
                .filter(m -> m.getUser().getId().equals(user.getId()))
                .filter(m -> m.getStartedAt() != null && m.getFinishedAt() == null)
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("No active meeting found"));
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

        return meetingRepository.save(meeting);
    }

    private List<AgendaItem> createDefaultAgendaItems(Meeting meeting) {
        // Modelo simplificado do padrão das partes da reunião
        return List.of(
            createItem(meeting, "Cântico e Oração", 5, 0, "abertura", false, false),
            createItem(meeting, "Comentários Iniciais", 1, 1, "abertura", false, false),
            createItem(meeting, "Tesouros da Palavra", 10, 2, "tesouros", true, true),
            createItem(meeting, "Joias Espirituais", 10, 3, "tesouros", false, true),
            createItem(meeting, "Leitura da Bíblia", 4, 4, "tesouros", true, false),
            createItem(meeting, "Faça Seu Melhor", 15, 5, "faca_seu_melhor", true, true),
            createItem(meeting, "Nossa Vida Cristã", 15, 6, "nossa_vida_crista", true, true),
            createItem(meeting, "Estudo de Livro", 30, 7, "nossa_vida_crista", false, true),
            createItem(meeting, "Recapitulação", 3, 8, "enceramento", false, false),
            createItem(meeting, "Cântico e Oração Final", 5, 9, "enceramento", false, false)
        );
    }

    private AgendaItem createItem(Meeting meeting, String title, int estimated, int pos, String section, boolean allowsComments, boolean requiresPostComment) {
        AgendaItem item = new AgendaItem();
        item.setMeeting(meeting);
        item.setTitle(title);
        item.setEstimatedMinutes(estimated);
        item.setPosition(pos);
        item.setSection(section);
        item.setAllowsComments(allowsComments);
        item.setRequiresPostComment(requiresPostComment);
        return item;
    }
}
