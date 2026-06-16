package com.meetingmanager.api.repository;

import com.meetingmanager.api.domain.AgendaItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface AgendaItemRepository extends JpaRepository<AgendaItem, UUID> {
}