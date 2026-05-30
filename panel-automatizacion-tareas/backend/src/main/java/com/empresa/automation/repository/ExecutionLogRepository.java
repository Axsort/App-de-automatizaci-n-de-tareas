package com.empresa.automation.repository;

import com.empresa.automation.entity.ExecutionLog;
import com.empresa.automation.entity.enums.ExecutionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ExecutionLogRepository extends JpaRepository<ExecutionLog, Long> {

    @Query("SELECT el FROM ExecutionLog el JOIN FETCH el.automationRule ar WHERE " +
           "(:automationId IS NULL OR ar.id = :automationId) " +
           "AND (:status IS NULL OR el.status = :status) " +
           "AND (:from IS NULL OR el.executedAt >= :from) " +
           "AND (:to IS NULL OR el.executedAt <= :to)")
    Page<ExecutionLog> findAllFiltered(@Param("automationId") Long automationId,
                                       @Param("status") ExecutionStatus status,
                                       @Param("from") LocalDateTime from,
                                       @Param("to") LocalDateTime to,
                                       Pageable pageable);

    @Query("SELECT COUNT(el) FROM ExecutionLog el WHERE el.executedAt >= :startOfDay")
    long countTodayExecutions(@Param("startOfDay") LocalDateTime startOfDay);

    @Query("SELECT el FROM ExecutionLog el JOIN FETCH el.automationRule WHERE el.status = 'FAILED' ORDER BY el.executedAt DESC")
    List<ExecutionLog> findRecentFailures(Pageable pageable);
}
