package com.meetingmanager.api.domain;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "agenda_items")
public class AgendaItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id", nullable = false)
    private Meeting meeting;

    @Column(nullable = false)
    private String title;

    @Column(name = "estimated_minutes", nullable = false)
    private Integer estimatedMinutes;

    @Column(name = "actual_seconds")
    private Integer actualSeconds = 0;

    @Column(nullable = false)
    private Integer position;

    private String status = "upcoming";

    @Column(nullable = false)
    private String section = "abertura";

    @Column(name = "allows_comments")
    private Boolean allowsComments = false;

    @Column(name = "requires_post_comment")
    private Boolean requiresPostComment = false;

    @Column(name = "assigned_names")
    private String assignedNames = "";

    @Column(name = "skip_timing")
    private Boolean skipTiming = false;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Meeting getMeeting() { return meeting; }
    public void setMeeting(Meeting meeting) { this.meeting = meeting; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Integer getEstimatedMinutes() { return estimatedMinutes; }
    public void setEstimatedMinutes(Integer estimatedMinutes) { this.estimatedMinutes = estimatedMinutes; }

    public Integer getActualSeconds() { return actualSeconds; }
    public void setActualSeconds(Integer actualSeconds) { this.actualSeconds = actualSeconds; }

    public Integer getPosition() { return position; }
    public void setPosition(Integer position) { this.position = position; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }

    public Boolean getAllowsComments() { return allowsComments; }
    public void setAllowsComments(Boolean allowsComments) { this.allowsComments = allowsComments; }

    public Boolean getRequiresPostComment() { return requiresPostComment; }
    public void setRequiresPostComment(Boolean requiresPostComment) { this.requiresPostComment = requiresPostComment; }

    public String getAssignedNames() { return assignedNames; }
    public void setAssignedNames(String assignedNames) { this.assignedNames = assignedNames; }

    public Boolean getSkipTiming() { return skipTiming; }
    public void setSkipTiming(Boolean skipTiming) { this.skipTiming = skipTiming; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
