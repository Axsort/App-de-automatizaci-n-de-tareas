package com.empresa.automation.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {

    public UserPrincipal getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return principal;
        }
        throw new com.empresa.automation.exception.BusinessException("Usuario no autenticado",
                org.springframework.http.HttpStatus.UNAUTHORIZED);
    }

    public Long getCurrentUserId() {
        return getCurrentUser().getId();
    }

    public boolean isAdmin() {
        return getCurrentUser().getRole() == UserPrincipal.Role.ADMIN;
    }

    public boolean isManagerOrAbove() {
        UserPrincipal.Role role = getCurrentUser().getRole();
        return role == UserPrincipal.Role.ADMIN || role == UserPrincipal.Role.MANAGER;
    }
}
