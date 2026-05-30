package com.empresa.automation.dto.automation;

import com.empresa.automation.entity.enums.ActionType;
import com.empresa.automation.entity.enums.ConditionOperator;
import com.empresa.automation.entity.enums.TriggerType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class AutomationCreateRequest {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 200)
    private String name;

    @Size(max = 2000)
    private String description;

    @NotNull(message = "El trigger es obligatorio")
    private TriggerType triggerType;

    private Boolean active = true;

    @Valid
    private List<ConditionRequest> conditions;

    @NotEmpty(message = "Debe incluir al menos una acción")
    @Valid
    private List<ActionRequest> actions;

    @Data
    public static class ConditionRequest {
        @NotBlank
        @Size(max = 100)
        private String fieldName;

        @NotNull
        private ConditionOperator operator;

        @NotBlank
        @Size(max = 500)
        private String fieldValue;

        private Integer sortOrder;
    }

    @Data
    public static class ActionRequest {
        @NotNull
        private ActionType actionType;

        @NotNull
        private Map<String, Object> parameters;

        private Integer sortOrder;
    }
}
