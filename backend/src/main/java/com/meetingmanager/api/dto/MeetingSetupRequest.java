package com.meetingmanager.api.dto;
import java.util.List;
public record MeetingSetupRequest(
    String president,
    List<AgendaItemInput> agendaItems
) {}
