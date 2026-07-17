package com.meetingmanager.api.dto;
import java.time.OffsetDateTime;
import java.util.UUID;
public record AttendanceLogResponse(
    UUID id,
    UUID meetingId,
    Integer presencial,
    Integer zoom,
    Integer count,
    OffsetDateTime createdAt
) {}
