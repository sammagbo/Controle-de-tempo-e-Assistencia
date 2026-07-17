package com.meetingmanager.api.mapper;

import com.meetingmanager.api.domain.*;
import com.meetingmanager.api.dto.*;

import java.util.stream.Collectors;
import java.util.Collections;
import java.util.List;

public class DtoMapper {

    public static MeetingResponse toMeetingResponse(Meeting meeting) {
        if (meeting == null) return null;

        List<AgendaItemResponse> agendaItems = meeting.getAgendaItems() != null 
            ? meeting.getAgendaItems().stream().map(DtoMapper::toAgendaItemResponse).collect(Collectors.toList()) 
            : Collections.emptyList();

        List<CommentResponse> comments = meeting.getComments() != null 
            ? meeting.getComments().stream().map(DtoMapper::toCommentResponse).collect(Collectors.toList()) 
            : Collections.emptyList();

        AttendanceResponse attendance = toAttendanceResponse(meeting.getAttendance());

        return new MeetingResponse(
            meeting.getId(),
            meeting.getWeek().getId(),
            meeting.getMeetingDay(),
            meeting.getStartedAt(),
            meeting.getFinishedAt(),
            meeting.getTotalDurationSeconds(),
            meeting.getPresident(),
            agendaItems,
            attendance,
            comments
        );
    }

    public static AgendaItemResponse toAgendaItemResponse(AgendaItem item) {
        if (item == null) return null;
        return new AgendaItemResponse(
            item.getId(),
            item.getTitle(),
            item.getEstimatedMinutes(),
            item.getActualSeconds(),
            item.getPosition(),
            item.getStatus(),
            item.getSection(),
            item.getAllowsComments(),
            item.getRequiresPostComment(),
            item.getAssignedNames(),
            item.getSkipTiming()
        );
    }

    public static CommentResponse toCommentResponse(Comment comment) {
        if (comment == null) return null;
        return new CommentResponse(
            comment.getId(),
            comment.getAgendaItem() != null ? comment.getAgendaItem().getId() : null,
            comment.getDurationSeconds(),
            comment.getCommentType()
        );
    }

    public static AttendanceResponse toAttendanceResponse(Attendance att) {
        if (att == null) return null;
        return new AttendanceResponse(
            att.getId(),
            att.getCount(),
            att.getPresencial(),
            att.getZoom()
        );
    }

    public static AttendanceLogResponse toAttendanceLogResponse(com.meetingmanager.api.domain.Attendance att) {
        if (att == null) return null;
        java.util.UUID meetingId = att.getMeeting() != null ? att.getMeeting().getId() : null;
        return new com.meetingmanager.api.dto.AttendanceLogResponse(
            att.getId(),
            meetingId,
            att.getPresencial(),
            att.getZoom(),
            att.getCount(),
            att.getCreatedAt()
        );
    }
}
