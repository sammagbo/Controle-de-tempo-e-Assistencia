package com.meetingmanager.api.repository;

import com.meetingmanager.api.domain.Period;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface PeriodRepository extends JpaRepository<Period, UUID> {
}