package com.meetingmanager.api.service;

import com.meetingmanager.api.domain.AgendaItem;
import com.meetingmanager.api.domain.Comment;
import com.meetingmanager.api.domain.Meeting;
import com.meetingmanager.api.dto.CommentRequest;
import com.meetingmanager.api.repository.AgendaItemRepository;
import com.meetingmanager.api.repository.CommentRepository;
import com.meetingmanager.api.repository.MeetingRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CommentService {

    private final CommentRepository commentRepository;
    private final MeetingRepository meetingRepository;
    private final AgendaItemRepository agendaItemRepository;

    public CommentService(CommentRepository commentRepository, MeetingRepository meetingRepository, AgendaItemRepository agendaItemRepository) {
        this.commentRepository = commentRepository;
        this.meetingRepository = meetingRepository;
        this.agendaItemRepository = agendaItemRepository;
    }

    public Comment createComment(CommentRequest request) {
        Meeting meeting = meetingRepository.findById(request.meetingId())
                .orElseThrow(() -> new EntityNotFoundException("Meeting not found"));

        AgendaItem agendaItem = null;
        if (request.agendaItemId() != null) {
            agendaItem = agendaItemRepository.findById(request.agendaItemId())
                    .orElseThrow(() -> new EntityNotFoundException("AgendaItem not found"));
        }

        Comment comment = new Comment();
        comment.setMeeting(meeting);
        comment.setAgendaItem(agendaItem);
        comment.setDurationSeconds(request.durationSeconds());
        comment.setCommentType(request.commentType());

        return commentRepository.save(comment);
    }
}
