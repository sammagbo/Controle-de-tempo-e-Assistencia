package com.meetingmanager.api.dto;
public record AttendanceRequest(
    Integer presencial,
    Integer zoom
) {}