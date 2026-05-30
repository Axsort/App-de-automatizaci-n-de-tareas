package com.empresa.automation.mapper;

import com.empresa.automation.dto.automation.AutomationResponse;
import com.empresa.automation.dto.audit.AuditLogResponse;
import com.empresa.automation.dto.execution.ExecutionResponse;
import com.empresa.automation.dto.user.UserResponse;
import com.empresa.automation.entity.*;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class EntityMapper {

    public UserResponse toUserResponse(User user) {
        if (user == null) return null;
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .role(user.getRole())
                .active(user.getActive())
                .mustChangePassword(user.getMustChangePassword())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    public AutomationResponse toAutomationResponse(AutomationRule rule) {
        if (rule == null) return null;
        return AutomationResponse.builder()
                .id(rule.getId())
                .name(rule.getName())
                .description(rule.getDescription())
                .triggerType(rule.getTriggerType())
                .active(rule.getActive())
                .createdById(rule.getCreator() != null ? rule.getCreator().getId() : null)
                .createdByName(rule.getCreator() != null ? rule.getCreator().getFullName() : null)
                .conditions(rule.getConditions() != null ?
                        rule.getConditions().stream().map(this::toConditionResponse).collect(Collectors.toList()) :
                        Collections.emptyList())
                .actions(rule.getActions() != null ?
                        rule.getActions().stream().map(this::toActionResponse).collect(Collectors.toList()) :
                        Collections.emptyList())
                .createdAt(rule.getCreatedAt())
                .updatedAt(rule.getUpdatedAt())
                .build();
    }

    private AutomationResponse.ConditionResponse toConditionResponse(AutomationCondition c) {
        return AutomationResponse.ConditionResponse.builder()
                .id(c.getId())
                .fieldName(c.getFieldName())
                .operator(c.getOperator())
                .fieldValue(c.getFieldValue())
                .sortOrder(c.getSortOrder())
                .build();
    }

    private AutomationResponse.ActionResponse toActionResponse(AutomationAction a) {
        return AutomationResponse.ActionResponse.builder()
                .id(a.getId())
                .actionType(a.getActionType())
                .parameters(a.getParameters())
                .sortOrder(a.getSortOrder())
                .build();
    }

    public ExecutionResponse toExecutionResponse(ExecutionLog log) {
        if (log == null) return null;
        return ExecutionResponse.builder()
                .id(log.getId())
                .automationRuleId(log.getAutomationRule().getId())
                .automationName(log.getAutomationRule().getName())
                .status(log.getStatus())
                .message(log.getMessage())
                .errorMessage(log.getErrorMessage())
                .executedById(log.getExecutedBy() != null ? log.getExecutedBy().getId() : null)
                .executedByName(log.getExecutedBy() != null ? log.getExecutedBy().getFullName() : "Sistema")
                .executedAt(log.getExecutedAt())
                .build();
    }

    public AuditLogResponse toAuditLogResponse(AuditLog log) {
        if (log == null) return null;
        return AuditLogResponse.builder()
                .id(log.getId())
                .userId(log.getUser() != null ? log.getUser().getId() : null)
                .userEmail(log.getUser() != null ? log.getUser().getEmail() : null)
                .userName(log.getUser() != null ? log.getUser().getFullName() : "Sistema")
                .action(log.getAction())
                .resourceType(log.getResourceType())
                .resourceId(log.getResourceId())
                .ipAddress(log.getIpAddress())
                .details(log.getDetails())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
