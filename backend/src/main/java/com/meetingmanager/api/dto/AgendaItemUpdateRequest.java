package com.meetingmanager.api.dto;
public record AgendaItemUpdateRequest(
    Integer actualSeconds,
    String status,
    String assignedNames
) {}