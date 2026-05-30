package com.empresa.automation.dto.audit;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
public class AuditLogResponse {
    private Long id;
    private Long userId;
    private String userEmail;
    private String userName;
    private String action;
    private String resourceType;
    private Long resourceId;
    private String ipAddress;
    private Map<String, Object> details;
    private LocalDateTime createdAt;
}
