package com.empresa.automation.service;

import com.empresa.automation.dto.dashboard.DashboardResponse;
import com.empresa.automation.dto.execution.ExecutionResponse;
import com.empresa.automation.entity.ExecutionLog;
import com.empresa.automation.mapper.EntityMapper;
import com.empresa.automation.repository.AuditLogRepository;
import com.empresa.automation.repository.AutomationRuleRepository;
import com.empresa.automation.repository.ExecutionLogRepository;
import com.empresa.automation.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final AutomationRuleRepository automationRuleRepository;
    private final ExecutionLogRepository executionLogRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final EntityMapper entityMapper;

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();

        long activeAutomations = automationRuleRepository.countActiveAutomations();
        long todayExecutions = executionLogRepository.countTodayExecutions(startOfDay);
        long activeUsers = userRepository.countActiveUsers();

        var recentFailures = executionLogRepository.findRecentFailures(PageRequest.of(0, 5));
        long todayFailures = recentFailures.stream()
                .filter(e -> e.getExecutedAt().isAfter(startOfDay))
                .count();

        var recentActivity = auditLogRepository.findAllFiltered(null, null, null, null, null,
                PageRequest.of(0, 10));

        return DashboardResponse.builder()
                .activeAutomations(activeAutomations)
                .todayExecutions(todayExecutions)
                .activeUsers(activeUsers)
                .todayFailures(todayFailures)
                .recentFailures(recentFailures.stream().map(entityMapper::toExecutionResponse).toList())
                .recentActivity(recentActivity.getContent().stream().map(entityMapper::toAuditLogResponse).toList())
                .build();
    }
}
