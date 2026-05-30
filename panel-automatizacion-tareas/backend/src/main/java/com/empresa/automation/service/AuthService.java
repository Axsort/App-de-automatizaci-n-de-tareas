package com.empresa.automation.service;

import com.empresa.automation.audit.AuditService;
import com.empresa.automation.config.AppProperties;
import com.empresa.automation.dto.auth.AuthResponse;
import com.empresa.automation.dto.auth.ChangePasswordRequest;
import com.empresa.automation.dto.auth.ForgotPasswordRequest;
import com.empresa.automation.dto.auth.LoginRequest;
import com.empresa.automation.entity.RefreshToken;
import com.empresa.automation.entity.User;
import com.empresa.automation.exception.BusinessException;
import com.empresa.automation.repository.RefreshTokenRepository;
import com.empresa.automation.repository.UserRepository;
import com.empresa.automation.security.JwtTokenProvider;
import com.empresa.automation.security.UserPrincipal;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    public static final String REFRESH_COOKIE_NAME = "refresh_token";

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final AppProperties appProperties;
    private final AuditService auditService;

    @Transactional
    public AuthResponse login(LoginRequest request, HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        String email = normalizeEmail(request.getEmail());
        User user = userRepository.findByEmailIgnoreCaseAndNotDeleted(email)
                .orElseThrow(() -> new BusinessException("Credenciales inválidas", HttpStatus.UNAUTHORIZED));

        if (!user.getActive()) {
            throw new BusinessException("Cuenta desactivada", HttpStatus.FORBIDDEN);
        }

        if (user.isLocked()) {
            throw new BusinessException("Cuenta bloqueada temporalmente. Intente más tarde.", HttpStatus.FORBIDDEN);
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword()));
        } catch (BadCredentialsException ex) {
            handleFailedLogin(user);
            throw new BusinessException("Credenciales inválidas", HttpStatus.UNAUTHORIZED);
        }

        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        UserPrincipal principal = new UserPrincipal(user);
        String accessToken = jwtTokenProvider.generateAccessToken(principal);
        String refreshTokenValue = jwtTokenProvider.generateRefreshTokenValue();

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(hashToken(refreshTokenValue))
                .expiresAt(LocalDateTime.now().plusSeconds(jwtTokenProvider.getRefreshExpirationMs() / 1000))
                .ipAddress(httpRequest.getRemoteAddr())
                .userAgent(httpRequest.getHeader("User-Agent"))
                .build();
        refreshTokenRepository.save(refreshToken);

        setRefreshCookie(httpResponse, refreshTokenValue);

        auditService.log(user.getId(), "LOGIN", "User", user.getId(), Map.of("email", user.getEmail()));

        return buildAuthResponse(accessToken, user);
    }

    @Transactional
    public AuthResponse refresh(HttpServletRequest request, HttpServletResponse response) {
        String refreshTokenValue = extractRefreshToken(request);
        if (refreshTokenValue == null) {
            throw new BusinessException("Refresh token no encontrado", HttpStatus.UNAUTHORIZED);
        }

        RefreshToken refreshToken = refreshTokenRepository.findValidByTokenHash(hashToken(refreshTokenValue))
                .orElseThrow(() -> new BusinessException("Refresh token inválido", HttpStatus.UNAUTHORIZED));

        if (!refreshToken.isValid()) {
            throw new BusinessException("Refresh token expirado o revocado", HttpStatus.UNAUTHORIZED);
        }

        User user = refreshToken.getUser();
        if (!user.getActive() || user.isDeleted()) {
            throw new BusinessException("Usuario no activo", HttpStatus.FORBIDDEN);
        }

        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);

        UserPrincipal principal = new UserPrincipal(user);
        String newAccessToken = jwtTokenProvider.generateAccessToken(principal);
        String newRefreshValue = jwtTokenProvider.generateRefreshTokenValue();

        RefreshToken newRefresh = RefreshToken.builder()
                .user(user)
                .tokenHash(hashToken(newRefreshValue))
                .expiresAt(LocalDateTime.now().plusSeconds(jwtTokenProvider.getRefreshExpirationMs() / 1000))
                .ipAddress(request.getRemoteAddr())
                .userAgent(request.getHeader("User-Agent"))
                .build();
        refreshTokenRepository.save(newRefresh);
        setRefreshCookie(response, newRefreshValue);

        return buildAuthResponse(newAccessToken, user);
    }

    @Transactional
    public void logout(HttpServletRequest request, HttpServletResponse response, Long userId) {
        String refreshTokenValue = extractRefreshToken(request);
        if (refreshTokenValue != null) {
            refreshTokenRepository.findValidByTokenHash(hashToken(refreshTokenValue))
                    .ifPresent(rt -> {
                        rt.setRevoked(true);
                        refreshTokenRepository.save(rt);
                    });
        }
        if (userId != null) {
            refreshTokenRepository.revokeAllByUserId(userId);
            auditService.log(userId, "LOGOUT", "User", userId, null);
        }
        clearRefreshCookie(response);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findByIdAndNotDeleted(userId)
                .orElseThrow(() -> new BusinessException("Usuario no encontrado", HttpStatus.NOT_FOUND));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BusinessException("Contraseña actual incorrecta", HttpStatus.BAD_REQUEST);
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(false);
        userRepository.save(user);
        refreshTokenRepository.revokeAllByUserId(userId);

        auditService.log(userId, "PASSWORD_CHANGED", "User", userId, null);
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        // Simulated: always returns success to prevent email enumeration
        userRepository.findByEmailAndNotDeleted(request.getEmail()).ifPresent(user ->
                log.info("Password reset requested for {} (simulated)", user.getEmail()));
    }

    private void handleFailedLogin(User user) {
        int attempts = user.getFailedLoginAttempts() + 1;
        user.setFailedLoginAttempts(attempts);
        if (attempts >= appProperties.getSecurity().getMaxLoginAttempts()) {
            user.setLockedUntil(LocalDateTime.now().plusMinutes(appProperties.getSecurity().getLockDurationMinutes()));
            log.warn("Account locked for user {}", user.getEmail());
        }
        userRepository.save(user);
    }

    private AuthResponse buildAuthResponse(String accessToken, User user) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getAccessExpirationMs() / 1000)
                .user(AuthResponse.UserSummary.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .role(user.getRole())
                        .mustChangePassword(user.getMustChangePassword())
                        .build())
                .build();
    }

    private void setRefreshCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie(REFRESH_COOKIE_NAME, token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // Set true in production with HTTPS
        cookie.setPath("/api/v1/auth");
        cookie.setMaxAge((int) (jwtTokenProvider.getRefreshExpirationMs() / 1000));
        cookie.setAttribute("SameSite", "Strict");
        response.addCookie(cookie);
    }

    private void clearRefreshCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(REFRESH_COOKIE_NAME, "");
        cookie.setHttpOnly(true);
        cookie.setPath("/api/v1/auth");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }

    private String extractRefreshToken(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        for (Cookie cookie : request.getCookies()) {
            if (REFRESH_COOKIE_NAME.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    private String normalizeEmail(String email) {
        if (email == null) {
            return "";
        }
        return email.trim().toLowerCase();
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
