package com.meetingmanager.api.dto;
import java.util.UUID;
public record AttendanceResponse(
    UUID id,
    Integer count,
    Integer presencial,
    Integer zoom
) {}