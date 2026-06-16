package com.meetingmanager.api.dto;
import java.util.UUID;
public record CommentResponse(
    UUID id,
    UUID agendaItemId,
    Integer durationSeconds,
    String commentType
) {}