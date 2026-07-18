package com.meetingmanager.api.dto;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;
public record CommentRequest(
    @NotNull UUID meetingId,
    UUID agendaItemId,
    @Min(0) Integer durationSeconds,
    @NotBlank String commentType
) {}
