package com.meetingmanager.api.repository;

import com.meetingmanager.api.domain.Week;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface WeekRepository extends JpaRepository<Week, UUID> {
    List<Week> findByPeriod_IdOrderByLabelAsc(UUID periodId);
}