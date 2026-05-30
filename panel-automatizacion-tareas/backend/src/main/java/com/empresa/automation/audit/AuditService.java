package com.empresa.automation.audit;

import com.empresa.automation.dto.audit.AuditLogResponse;
import com.empresa.automation.dto.common.PageResponse;
import com.empresa.automation.entity.AuditLog;
import com.empresa.automation.entity.User;
import com.empresa.automation.mapper.EntityMapper;
import com.empresa.automation.repository.AuditLogRepository;
import com.empresa.automation.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final EntityMapper entityMapper;

    @Transactional
    public void log(Long userId, String action, String resourceType, Long resourceId, Map<String, Object> details) {
        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;
        AuditLog auditLog = AuditLog.builder()
                .user(user)
                .action(action)
                .resourceType(resourceType)
                .resourceId(resourceId)
                .ipAddress(resolveClientIp())
                .details(details)
                .build();
        auditLogRepository.save(auditLog);
        log.info("AUDIT action={} userId={} resource={}:{}", action, userId, resourceType, resourceId);
    }

    @Transactional(readOnly = true)
    public PageResponse<AuditLogResponse> findAll(String action, Long userId, LocalDateTime from,
                                                   LocalDateTime to, String search, Pageable pageable) {
        Page<AuditLog> page = auditLogRepository.findAllFiltered(action, userId, from, to, search, pageable);
        return toPageResponse(page);
    }

    private PageResponse<AuditLogResponse> toPageResponse(Page<AuditLog> page) {
        return PageResponse.<AuditLogResponse>builder()
                .content(page.getContent().stream().map(entityMapper::toAuditLogResponse).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    private String resolveClientIp() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest request = attrs.getRequest();
                String xff = request.getHeader("X-Forwarded-For");
                if (xff != null && !xff.isBlank()) {
                    return xff.split(",")[0].trim();
                }
                return request.getRemoteAddr();
            }
        } catch (Exception ignored) {
        }
        return null;
    }
}
