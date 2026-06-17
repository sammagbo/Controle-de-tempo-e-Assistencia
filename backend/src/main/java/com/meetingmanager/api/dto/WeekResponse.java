package com.meetingmanager.api.dto;
import java.util.UUID;
public record WeekResponse(
    UUID id,
    UUID periodId,
    String label,
    String dateRange,
    String theme,
    String status
) {}
