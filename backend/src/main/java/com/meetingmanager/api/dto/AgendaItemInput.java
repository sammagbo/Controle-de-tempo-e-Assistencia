package com.meetingmanager.api.dto;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
public record AgendaItemInput(
    @NotBlank String title,
    @Min(0) Integer estimatedMinutes,
    @Min(0) Integer actualSeconds,
    @Min(1) Integer position,
    String status,
    String section,
    Boolean allowsComments,
    Boolean requiresPostComment,
    String assignedNames,
    Boolean skipTiming
) {}
