package com.meetingmanager.api.dto;
import java.time.OffsetDateTime;
public record MeetingUpdateRequest(
    OffsetDateTime startedAt,
    OffsetDateTime finishedAt,
    Integer totalDurationSeconds,
    String president
) {}