package com.meetingmanager.api.dto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;
public record MeetingSetupRequest(
    String president,
    @NotNull List<@Valid AgendaItemInput> agendaItems
) {}
