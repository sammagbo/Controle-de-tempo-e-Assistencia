package com.meetingmanager.api.dto;
import jakarta.validation.constraints.Min;
public record AgendaItemUpdateRequest(
    @Min(0) Integer actualSeconds,
    String status,
    String assignedNames
) {}
