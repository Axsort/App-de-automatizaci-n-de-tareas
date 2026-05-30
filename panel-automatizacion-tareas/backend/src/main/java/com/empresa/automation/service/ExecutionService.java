package com.empresa.automation.service;

import com.empresa.automation.dto.common.PageResponse;
import com.empresa.automation.dto.execution.ExecutionResponse;
import com.empresa.automation.entity.AutomationRule;
import com.empresa.automation.entity.ExecutionLog;
import com.empresa.automation.entity.User;
import com.empresa.automation.entity.enums.ExecutionStatus;
import com.empresa.automation.mapper.EntityMapper;
import com.empresa.automation.repository.ExecutionLogRepository;
import com.empresa.automation.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ExecutionService {

    private final ExecutionLogRepository executionLogRepository;
    private final UserRepository userRepository;
    private final EntityMapper entityMapper;

    @Transactional(readOnly = true)
    public PageResponse<ExecutionResponse> findAll(Long automationId, ExecutionStatus status,
                                                    LocalDateTime from, LocalDateTime to, Pageable pageable) {
        Page<ExecutionLog> page = executionLogRepository.findAllFiltered(automationId, status, from, to, pageable);
        return PageResponse.<ExecutionResponse>builder()
                .content(page.getContent().stream().map(entityMapper::toExecutionResponse).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    @Transactional
    public ExecutionLog logExecution(AutomationRule rule, ExecutionStatus status, String message,
                                     String errorMessage, Long executedById) {
        User executedBy = executedById != null ?
                userRepository.findById(executedById).orElse(null) : null;

        ExecutionLog log = ExecutionLog.builder()
                .automationRule(rule)
                .status(status)
                .message(message)
                .errorMessage(errorMessage)
                .executedBy(executedBy)
                .executedAt(LocalDateTime.now())
                .build();

        return executionLogRepository.save(log);
    }
}
