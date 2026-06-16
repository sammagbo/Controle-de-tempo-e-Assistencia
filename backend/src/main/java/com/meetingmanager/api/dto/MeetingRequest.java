package com.meetingmanager.api.dto;
import java.util.UUID;
import java.time.OffsetDateTime;
import java.util.List;

public record MeetingRequest(UUID weekId) {}