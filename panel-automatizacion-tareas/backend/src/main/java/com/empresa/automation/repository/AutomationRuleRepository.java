package com.empresa.automation.repository;

import com.empresa.automation.entity.AutomationRule;
import com.empresa.automation.entity.enums.TriggerType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AutomationRuleRepository extends JpaRepository<AutomationRule, Long> {

    @EntityGraph(attributePaths = {"conditions", "actions", "creator"})
    @Query("SELECT ar FROM AutomationRule ar WHERE ar.id = :id AND ar.deletedAt IS NULL")
    Optional<AutomationRule> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT ar FROM AutomationRule ar WHERE ar.deletedAt IS NULL AND " +
           "(:search IS NULL OR LOWER(ar.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(ar.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:triggerType IS NULL OR ar.triggerType = :triggerType) " +
           "AND (:active IS NULL OR ar.active = :active)")
    Page<AutomationRule> findAllFiltered(@Param("search") String search,
                                         @Param("triggerType") TriggerType triggerType,
                                         @Param("active") Boolean active,
                                         Pageable pageable);

    @Query("SELECT COUNT(ar) FROM AutomationRule ar WHERE ar.deletedAt IS NULL AND ar.active = true")
    long countActiveAutomations();
}
