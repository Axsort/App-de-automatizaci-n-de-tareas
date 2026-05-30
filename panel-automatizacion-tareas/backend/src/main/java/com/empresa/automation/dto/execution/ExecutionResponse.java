package com.empresa.automation.dto.execution;

import com.empresa.automation.entity.enums.ExecutionStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ExecutionResponse {
    private Long id;
    private Long automationRuleId;
    private String automationName;
    private ExecutionStatus status;
    private String message;
    private String errorMessage;
    private Long executedById;
    private String executedByName;
    private LocalDateTime executedAt;
}
