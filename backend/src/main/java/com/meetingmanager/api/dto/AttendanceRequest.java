package com.meetingmanager.api.dto;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
public record AttendanceRequest(
    @Min(0) @Max(99999) Integer presencial,
    @Min(0) @Max(99999) Integer zoom
) {}
