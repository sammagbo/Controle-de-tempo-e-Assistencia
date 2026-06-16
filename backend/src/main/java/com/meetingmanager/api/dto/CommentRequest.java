package com.meetingmanager.api.dto;
import java.util.UUID;
public record CommentRequest(
    UUID meetingId,
    UUID agendaItemId,
    Integer durationSeconds,
    String commentType
) {}