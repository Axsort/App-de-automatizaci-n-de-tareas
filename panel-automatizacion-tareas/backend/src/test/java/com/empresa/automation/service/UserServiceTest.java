package com.empresa.automation.service;

import com.empresa.automation.entity.User;
import com.empresa.automation.entity.enums.Role;
import com.empresa.automation.exception.BusinessException;
import com.empresa.automation.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private com.empresa.automation.mapper.EntityMapper entityMapper;
    @Mock private com.empresa.automation.audit.AuditService auditService;
    @Mock private com.empresa.automation.security.SecurityUtils securityUtils;

    @InjectMocks
    private UserService userService;

    private User adminUser;

    @BeforeEach
    void setUp() {
        adminUser = User.builder()
                .id(1L)
                .email("admin@test.com")
                .role(Role.ADMIN)
                .active(true)
                .build();
    }

    @Test
    void toggleActive_preventsSelfDeactivation() {
        when(userRepository.findByIdAndNotDeleted(1L)).thenReturn(Optional.of(adminUser));
        when(securityUtils.getCurrentUserId()).thenReturn(1L);

        BusinessException ex = assertThrows(BusinessException.class,
                () -> userService.toggleActive(1L, false));

        assertTrue(ex.getMessage().contains("propia cuenta"));
    }

    @Test
    void create_rejectsDuplicateEmail() {
        when(userRepository.existsByEmailAndDeletedAtIsNull("test@test.com")).thenReturn(true);

        var request = new com.empresa.automation.dto.user.UserCreateRequest();
        request.setEmail("test@test.com");
        request.setPassword("Password123!");
        request.setFirstName("Test");
        request.setLastName("User");
        request.setRole(Role.VIEWER);

        assertThrows(BusinessException.class, () -> userService.create(request));
        verify(userRepository, never()).save(any());
    }
}
