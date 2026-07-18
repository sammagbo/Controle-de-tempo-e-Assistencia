package com.meetingmanager.api.dto;
import jakarta.validation.constraints.Min;
import java.time.OffsetDateTime;
public record MeetingUpdateRequest(
    OffsetDateTime startedAt,
    OffsetDateTime finishedAt,
    @Min(0) Integer totalDurationSeconds,
    String president
) {}
