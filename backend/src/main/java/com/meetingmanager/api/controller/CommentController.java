package com.meetingmanager.api.controller;

import com.meetingmanager.api.dto.CommentRequest;
import com.meetingmanager.api.dto.CommentResponse;
import com.meetingmanager.api.mapper.DtoMapper;
import com.meetingmanager.api.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping
    public ResponseEntity<CommentResponse> createComment(@Valid @RequestBody CommentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(DtoMapper.toCommentResponse(commentService.createComment(request)));
    }
}
