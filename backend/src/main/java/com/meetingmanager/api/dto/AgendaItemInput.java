package com.meetingmanager.api.dto;
public record AgendaItemInput(
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
