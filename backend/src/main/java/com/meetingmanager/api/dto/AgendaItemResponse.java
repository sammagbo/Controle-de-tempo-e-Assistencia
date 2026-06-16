package com.meetingmanager.api.dto;
import java.util.UUID;
public record AgendaItemResponse(
    UUID id,
    String title,
    Integer estimatedMinutes,
    Integer actualSeconds,
    Integer position,
    String status,
    String section,
    Boolean allowsComments,
    Boolean requiresPostComment,
    String assignedNames,
    Boolean skipTiming
) {}