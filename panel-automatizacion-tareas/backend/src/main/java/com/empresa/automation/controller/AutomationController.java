package com.empresa.automation.controller;

import com.empresa.automation.dto.automation.AutomationCreateRequest;
import com.empresa.automation.dto.automation.AutomationResponse;
import com.empresa.automation.dto.automation.AutomationUpdateRequest;
import com.empresa.automation.dto.common.ApiResponse;
import com.empresa.automation.dto.common.PageResponse;
import com.empresa.automation.dto.dashboard.DashboardResponse;
import com.empresa.automation.entity.enums.TriggerType;
import com.empresa.automation.service.AutomationService;
import com.empresa.automation.service.DashboardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class AutomationController {

    private final AutomationService automationService;
    private final DashboardService dashboardService;

    @GetMapping("/api/v1/dashboard")
    public ResponseEntity<ApiResponse<DashboardResponse>> dashboard() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getDashboard()));
    }

    @GetMapping("/api/v1/automations")
    public ResponseEntity<ApiResponse<PageResponse<AutomationResponse>>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) TriggerType triggerType,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "updatedAt"));
        return ResponseEntity.ok(ApiResponse.ok(automationService.findAll(search, triggerType, active, pageable)));
    }

    @GetMapping("/api/v1/automations/{id}")
    public ResponseEntity<ApiResponse<AutomationResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(automationService.findById(id)));
    }

    @PostMapping("/api/v1/automations")
    public ResponseEntity<ApiResponse<AutomationResponse>> create(@Valid @RequestBody AutomationCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Automatización creada", automationService.create(request)));
    }

    @PutMapping("/api/v1/automations/{id}")
    public ResponseEntity<ApiResponse<AutomationResponse>> update(@PathVariable Long id,
                                                                  @Valid @RequestBody AutomationUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Automatización actualizada", automationService.update(id, request)));
    }

    @DeleteMapping("/api/v1/automations/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        automationService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Automatización eliminada", null));
    }

    @PostMapping("/api/v1/automations/{id}/duplicate")
    public ResponseEntity<ApiResponse<AutomationResponse>> duplicate(@PathVariable Long id) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Automatización duplicada", automationService.duplicate(id)));
    }

    @PostMapping("/api/v1/automations/{id}/execute")
    public ResponseEntity<ApiResponse<AutomationResponse>> execute(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Ejecución iniciada", automationService.execute(id)));
    }
}
