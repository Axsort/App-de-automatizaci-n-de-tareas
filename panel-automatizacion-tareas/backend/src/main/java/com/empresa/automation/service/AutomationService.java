package com.empresa.automation.service;

import com.empresa.automation.audit.AuditService;
import com.empresa.automation.dto.automation.AutomationCreateRequest;
import com.empresa.automation.dto.automation.AutomationResponse;
import com.empresa.automation.dto.automation.AutomationUpdateRequest;
import com.empresa.automation.dto.common.PageResponse;
import com.empresa.automation.entity.*;
import com.empresa.automation.entity.enums.ActionType;
import com.empresa.automation.entity.enums.ExecutionStatus;
import com.empresa.automation.entity.enums.TriggerType;
import com.empresa.automation.exception.ForbiddenException;
import com.empresa.automation.exception.ResourceNotFoundException;
import com.empresa.automation.mapper.EntityMapper;
import com.empresa.automation.repository.AutomationRuleRepository;
import com.empresa.automation.repository.UserRepository;
import com.empresa.automation.security.SecurityUtils;
import com.empresa.automation.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class AutomationService {

    private final AutomationRuleRepository automationRuleRepository;
    private final UserRepository userRepository;
    private final EntityMapper entityMapper;
    private final AuditService auditService;
    private final SecurityUtils securityUtils;
    private final ExecutionService executionService;

    @Transactional(readOnly = true)
    public PageResponse<AutomationResponse> findAll(String search, TriggerType triggerType,
                                                     Boolean active, Pageable pageable) {
        Page<AutomationRule> page = automationRuleRepository.findAllFiltered(search, triggerType, active, pageable);
        return toPageResponse(page);
    }

    @Transactional(readOnly = true)
    public AutomationResponse findById(Long id) {
        AutomationRule rule = getRuleOrThrow(id);
        checkReadAccess(rule);
        return entityMapper.toAutomationResponse(rule);
    }

    @Transactional
    public AutomationResponse create(AutomationCreateRequest request) {
        User creator = userRepository.findByIdAndNotDeleted(securityUtils.getCurrentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        AutomationRule rule = AutomationRule.builder()
                .name(sanitize(request.getName()))
                .description(sanitize(request.getDescription()))
                .triggerType(request.getTriggerType())
                .active(request.getActive() != null ? request.getActive() : true)
                .creator(creator)
                .build();

        rule.setConditions(mapConditions(request.getConditions()));
        rule.setActions(mapActions(request.getActions()));

        rule = automationRuleRepository.save(rule);
        auditService.log(creator.getId(), "AUTOMATION_CREATED", "AutomationRule", rule.getId(),
                Map.of("name", rule.getName()));

        return entityMapper.toAutomationResponse(rule);
    }

    @Transactional
    public AutomationResponse update(Long id, AutomationUpdateRequest request) {
        AutomationRule rule = getRuleOrThrow(id);
        checkWriteAccess(rule);

        rule.setName(sanitize(request.getName()));
        rule.setDescription(sanitize(request.getDescription()));
        rule.setTriggerType(request.getTriggerType());
        if (request.getActive() != null) {
            rule.setActive(request.getActive());
        }
        rule.setConditions(mapConditions(request.getConditions()));
        rule.setActions(mapActions(request.getActions()));

        rule = automationRuleRepository.save(rule);
        auditService.log(securityUtils.getCurrentUserId(), "AUTOMATION_UPDATED", "AutomationRule", id, null);

        return entityMapper.toAutomationResponse(rule);
    }

    @Transactional
    public void delete(Long id) {
        AutomationRule rule = getRuleOrThrow(id);
        if (!securityUtils.isManagerOrAbove()) {
            throw new ForbiddenException("No tiene permisos para eliminar automatizaciones");
        }
        rule.setDeletedAt(LocalDateTime.now());
        rule.setActive(false);
        automationRuleRepository.save(rule);
        auditService.log(securityUtils.getCurrentUserId(), "AUTOMATION_DELETED", "AutomationRule", id, null);
    }

    @Transactional
    public AutomationResponse duplicate(Long id) {
        AutomationRule original = getRuleOrThrow(id);
        checkReadAccess(original);

        AutomationCreateRequest copyRequest = new AutomationCreateRequest();
        copyRequest.setName(original.getName() + " (copia)");
        copyRequest.setDescription(original.getDescription());
        copyRequest.setTriggerType(original.getTriggerType());
        copyRequest.setActive(false);

        copyRequest.setConditions(original.getConditions().stream().map(c -> {
            AutomationCreateRequest.ConditionRequest cr = new AutomationCreateRequest.ConditionRequest();
            cr.setFieldName(c.getFieldName());
            cr.setOperator(c.getOperator());
            cr.setFieldValue(c.getFieldValue());
            cr.setSortOrder(c.getSortOrder());
            return cr;
        }).toList());

        copyRequest.setActions(original.getActions().stream().map(a -> {
            AutomationCreateRequest.ActionRequest ar = new AutomationCreateRequest.ActionRequest();
            ar.setActionType(a.getActionType());
            ar.setParameters(a.getParameters());
            ar.setSortOrder(a.getSortOrder());
            return ar;
        }).toList());

        return create(copyRequest);
    }

    @Transactional
    public AutomationResponse execute(Long id) {
        AutomationRule rule = getRuleOrThrow(id);
        checkReadAccess(rule);

        try {
            for (AutomationAction action : rule.getActions()) {
                simulateAction(action);
            }
            executionService.logExecution(rule, ExecutionStatus.SUCCESS,
                    "Ejecución manual completada", null, securityUtils.getCurrentUserId());
        } catch (Exception ex) {
            executionService.logExecution(rule, ExecutionStatus.FAILED,
                    "Ejecución manual fallida", ex.getMessage(), securityUtils.getCurrentUserId());
            throw ex;
        }

        return entityMapper.toAutomationResponse(rule);
    }

    private void simulateAction(AutomationAction action) {
        if (action.getActionType() == ActionType.LOG_AUDIT_EVENT) {
            auditService.log(securityUtils.getCurrentUserId(), "AUTOMATION_ACTION",
                    "AutomationRule", action.getAutomationRule().getId(), action.getParameters());
        }
    }

    private AutomationRule getRuleOrThrow(Long id) {
        return automationRuleRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Automatización no encontrada"));
    }

    private void checkReadAccess(AutomationRule rule) {
        UserPrincipal current = securityUtils.getCurrentUser();
        if (current.getRole() == UserPrincipal.Role.VIEWER) {
            return;
        }
        if (current.getRole() == UserPrincipal.Role.OPERATOR &&
                !rule.getCreator().getId().equals(current.getId()) &&
                !securityUtils.isManagerOrAbove()) {
            // Operators can read all but only edit own - read is allowed for all
        }
    }

    private void checkWriteAccess(AutomationRule rule) {
        UserPrincipal current = securityUtils.getCurrentUser();
        if (securityUtils.isManagerOrAbove()) {
            return;
        }
        if (current.getRole() == UserPrincipal.Role.OPERATOR &&
                rule.getCreator().getId().equals(current.getId())) {
            return;
        }
        throw new ForbiddenException("No tiene permisos para modificar esta automatización");
    }

    private List<AutomationCondition> mapConditions(List<AutomationCreateRequest.ConditionRequest> requests) {
        if (requests == null) return new ArrayList<>();
        return IntStream.range(0, requests.size())
                .mapToObj(i -> {
                    AutomationCreateRequest.ConditionRequest r = requests.get(i);
                    return AutomationCondition.builder()
                            .fieldName(sanitize(r.getFieldName()))
                            .operator(r.getOperator())
                            .fieldValue(sanitize(r.getFieldValue()))
                            .sortOrder(r.getSortOrder() != null ? r.getSortOrder() : i)
                            .build();
                }).toList();
    }

    private List<AutomationAction> mapActions(List<AutomationCreateRequest.ActionRequest> requests) {
        return IntStream.range(0, requests.size())
                .mapToObj(i -> {
                    AutomationCreateRequest.ActionRequest r = requests.get(i);
                    return AutomationAction.builder()
                            .actionType(r.getActionType())
                            .parameters(r.getParameters())
                            .sortOrder(r.getSortOrder() != null ? r.getSortOrder() : i)
                            .build();
                }).toList();
    }

    private String sanitize(String input) {
        if (input == null) return null;
        return input.trim().replaceAll("[<>\"']", "");
    }

    private PageResponse<AutomationResponse> toPageResponse(Page<AutomationRule> page) {
        return PageResponse.<AutomationResponse>builder()
                .content(page.getContent().stream().map(entityMapper::toAutomationResponse).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }
}
