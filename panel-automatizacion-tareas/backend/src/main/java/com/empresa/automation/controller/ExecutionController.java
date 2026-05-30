package com.empresa.automation.controller;

import com.empresa.automation.dto.common.ApiResponse;
import com.empresa.automation.dto.common.PageResponse;
import com.empresa.automation.dto.execution.ExecutionResponse;
import com.empresa.automation.entity.enums.ExecutionStatus;
import com.empresa.automation.service.ExecutionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/executions")
@RequiredArgsConstructor
public class ExecutionController {

    private final ExecutionService executionService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ExecutionResponse>>> list(
            @RequestParam(required = false) Long automationId,
            @RequestParam(required = false) ExecutionStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "executedAt"));
        return ResponseEntity.ok(ApiResponse.ok(
                executionService.findAll(automationId, status, from, to, pageable)));
    }
}
