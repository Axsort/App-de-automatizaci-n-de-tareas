package com.empresa.automation.repository;

import com.empresa.automation.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    @Query("SELECT al FROM AuditLog al LEFT JOIN FETCH al.user WHERE " +
           "(:action IS NULL OR al.action = :action) " +
           "AND (:userId IS NULL OR al.user.id = :userId) " +
           "AND (:from IS NULL OR al.createdAt >= :from) " +
           "AND (:to IS NULL OR al.createdAt <= :to) " +
           "AND (:search IS NULL OR LOWER(al.action) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(al.resourceType) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<AuditLog> findAllFiltered(@Param("action") String action,
                                   @Param("userId") Long userId,
                                   @Param("from") LocalDateTime from,
                                   @Param("to") LocalDateTime to,
                                   @Param("search") String search,
                                   Pageable pageable);
}
