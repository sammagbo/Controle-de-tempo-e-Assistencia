package com.meetingmanager.api.controller;

import com.meetingmanager.api.dto.AgendaItemResponse;
import com.meetingmanager.api.dto.AgendaItemUpdateRequest;
import com.meetingmanager.api.mapper.DtoMapper;
import com.meetingmanager.api.service.AgendaItemService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/agenda-items")
public class AgendaItemController {

    private final AgendaItemService agendaItemService;

    public AgendaItemController(AgendaItemService agendaItemService) {
        this.agendaItemService = agendaItemService;
    }

    @PutMapping("/{id}")
    public ResponseEntity<AgendaItemResponse> updateAgendaItem(@PathVariable UUID id, @Valid @RequestBody AgendaItemUpdateRequest request) {
        return ResponseEntity.ok(DtoMapper.toAgendaItemResponse(agendaItemService.updateAgendaItem(id, request)));
    }
}
