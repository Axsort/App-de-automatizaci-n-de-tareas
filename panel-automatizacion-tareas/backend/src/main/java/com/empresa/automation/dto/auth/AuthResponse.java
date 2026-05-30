package com.empresa.automation.dto.auth;

import com.empresa.automation.entity.enums.Role;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String accessToken;
    private String tokenType;
    private long expiresIn;
    private UserSummary user;

    @Data
    @Builder
    public static class UserSummary {
        private Long id;
        private String email;
        private String firstName;
        private String lastName;
        private Role role;
        private boolean mustChangePassword;
    }
}
