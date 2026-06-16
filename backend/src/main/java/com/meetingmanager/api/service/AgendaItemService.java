package com.meetingmanager.api.service;

import com.meetingmanager.api.domain.AgendaItem;
import com.meetingmanager.api.dto.AgendaItemUpdateRequest;
import com.meetingmanager.api.repository.AgendaItemRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
public class AgendaItemService {

    private final AgendaItemRepository agendaItemRepository;

    public AgendaItemService(AgendaItemRepository agendaItemRepository) {
        this.agendaItemRepository = agendaItemRepository;
    }

    public AgendaItem updateAgendaItem(UUID id, AgendaItemUpdateRequest request) {
        AgendaItem item = agendaItemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("AgendaItem not found"));

        if (request.actualSeconds() != null) item.setActualSeconds(request.actualSeconds());
        if (request.status() != null) item.setStatus(request.status());
        if (request.assignedNames() != null) item.setAssignedNames(request.assignedNames());

        return agendaItemRepository.save(item);
    }
}
