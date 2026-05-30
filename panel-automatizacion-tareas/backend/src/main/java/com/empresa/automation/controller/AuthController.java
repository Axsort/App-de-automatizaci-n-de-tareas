package com.empresa.automation.controller;

import com.empresa.automation.dto.auth.*;
import com.empresa.automation.dto.common.ApiResponse;
import com.empresa.automation.security.SecurityUtils;
import com.empresa.automation.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final SecurityUtils securityUtils;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request,
                                                           HttpServletRequest httpRequest,
                                                           HttpServletResponse httpResponse) {
        return ResponseEntity.ok(ApiResponse.ok("Login exitoso",
                authService.login(request, httpRequest, httpResponse)));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(HttpServletRequest request,
                                                             HttpServletResponse response) {
        return ResponseEntity.ok(ApiResponse.ok(authService.refresh(request, response)));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest request,
                                                    HttpServletResponse response) {
        Long userId = null;
        try {
            userId = securityUtils.getCurrentUserId();
        } catch (Exception ignored) {
        }
        authService.logout(request, response, userId);
        return ResponseEntity.ok(ApiResponse.ok("Sesión cerrada", null));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(securityUtils.getCurrentUserId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Contraseña actualizada", null));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.ok(
                "Si el email existe, recibirá instrucciones para restablecer su contraseña", null));
    }
}
