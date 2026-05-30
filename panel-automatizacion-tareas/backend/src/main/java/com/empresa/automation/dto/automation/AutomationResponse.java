package com.empresa.automation.dto.automation;

import com.empresa.automation.entity.enums.ActionType;
import com.empresa.automation.entity.enums.ConditionOperator;
import com.empresa.automation.entity.enums.TriggerType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class AutomationResponse {
    private Long id;
    private String name;
    private String description;
    private TriggerType triggerType;
    private boolean active;
    private Long createdById;
    private String createdByName;
    private List<ConditionResponse> conditions;
    private List<ActionResponse> actions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    public static class ConditionResponse {
        private Long id;
        private String fieldName;
        private ConditionOperator operator;
        private String fieldValue;
        private Integer sortOrder;
    }

    @Data
    @Builder
    public static class ActionResponse {
        private Long id;
        private ActionType actionType;
        private Map<String, Object> parameters;
        private Integer sortOrder;
    }
}
