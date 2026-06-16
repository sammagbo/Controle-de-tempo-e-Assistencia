package com.meetingmanager.api.dto;
import java.util.UUID;
import java.time.OffsetDateTime;
import java.util.List;

public record MeetingResponse(
    UUID id,
    UUID weekId,
    String meetingDay,
    OffsetDateTime startedAt,
    OffsetDateTime finishedAt,
    Integer totalDurationSeconds,
    String president,
    List<AgendaItemResponse> agendaItems,
    AttendanceResponse attendance,
    List<CommentResponse> comments
) {}