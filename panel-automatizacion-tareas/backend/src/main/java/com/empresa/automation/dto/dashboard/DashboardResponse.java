package com.empresa.automation.dto.dashboard;

import com.empresa.automation.dto.audit.AuditLogResponse;
import com.empresa.automation.dto.execution.ExecutionResponse;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class DashboardResponse {
    private long activeAutomations;
    private long todayExecutions;
    private long activeUsers;
    private long todayFailures;
    private List<ExecutionResponse> recentFailures;
    private List<AuditLogResponse> recentActivity;
}
