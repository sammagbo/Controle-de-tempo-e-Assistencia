package com.meetingmanager.api.dto;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record MeetingRequest(@NotNull UUID weekId) {}
