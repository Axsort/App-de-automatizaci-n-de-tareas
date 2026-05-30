package com.empresa.automation.service;

import com.empresa.automation.audit.AuditService;
import com.empresa.automation.dto.common.PageResponse;
import com.empresa.automation.dto.user.UserCreateRequest;
import com.empresa.automation.dto.user.UserResponse;
import com.empresa.automation.dto.user.UserUpdateRequest;
import com.empresa.automation.entity.User;
import com.empresa.automation.entity.enums.Role;
import com.empresa.automation.exception.BusinessException;
import com.empresa.automation.exception.ForbiddenException;
import com.empresa.automation.exception.ResourceNotFoundException;
import com.empresa.automation.mapper.EntityMapper;
import com.empresa.automation.repository.UserRepository;
import com.empresa.automation.security.SecurityUtils;
import com.empresa.automation.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EntityMapper entityMapper;
    private final AuditService auditService;
    private final SecurityUtils securityUtils;

    @Transactional(readOnly = true)
    public PageResponse<UserResponse> findAll(String search, Role role, Boolean active, Pageable pageable) {
        Page<User> page = userRepository.findAllFiltered(search, role, active, pageable);
        return toPageResponse(page);
    }

    @Transactional(readOnly = true)
    public UserResponse findById(Long id) {
        User user = getUserOrThrow(id);
        return entityMapper.toUserResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getProfile(Long userId) {
        return findById(userId);
    }

    @Transactional
    public UserResponse create(UserCreateRequest request) {
        if (userRepository.existsByEmailAndDeletedAtIsNull(request.getEmail())) {
            throw new BusinessException("El email ya está registrado");
        }

        validateRoleAssignment(request.getRole());

        User user = User.builder()
                .email(request.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(sanitize(request.getFirstName()))
                .lastName(sanitize(request.getLastName()))
                .role(request.getRole())
                .active(true)
                .mustChangePassword(true)
                .createdBy(securityUtils.getCurrentUserId())
                .build();

        user = userRepository.save(user);
        auditService.log(securityUtils.getCurrentUserId(), "USER_CREATED", "User", user.getId(),
                Map.of("email", user.getEmail(), "role", user.getRole().name()));

        return entityMapper.toUserResponse(user);
    }

    @Transactional
    public UserResponse update(Long id, UserUpdateRequest request) {
        User user = getUserOrThrow(id);
        preventSelfRoleEscalation(id, request.getRole());

        if (!user.getEmail().equalsIgnoreCase(request.getEmail()) &&
                userRepository.existsByEmailAndDeletedAtIsNull(request.getEmail())) {
            throw new BusinessException("El email ya está registrado");
        }

        Role oldRole = user.getRole();
        user.setEmail(request.getEmail().toLowerCase().trim());
        user.setFirstName(sanitize(request.getFirstName()));
        user.setLastName(sanitize(request.getLastName()));

        if (request.getRole() != null && !request.getRole().equals(oldRole)) {
            validateRoleAssignment(request.getRole());
            user.setRole(request.getRole());
            auditService.log(securityUtils.getCurrentUserId(), "ROLE_CHANGED", "User", id,
                    Map.of("oldRole", oldRole.name(), "newRole", request.getRole().name()));
        }

        user = userRepository.save(user);
        auditService.log(securityUtils.getCurrentUserId(), "USER_UPDATED", "User", id, null);
        return entityMapper.toUserResponse(user);
    }

    @Transactional
    public UserResponse toggleActive(Long id, boolean active) {
        User user = getUserOrThrow(id);
        if (user.getId().equals(securityUtils.getCurrentUserId()) && !active) {
            throw new BusinessException("No puede desactivar su propia cuenta");
        }
        user.setActive(active);
        user = userRepository.save(user);
        auditService.log(securityUtils.getCurrentUserId(), active ? "USER_ACTIVATED" : "USER_DEACTIVATED",
                "User", id, null);
        return entityMapper.toUserResponse(user);
    }

    @Transactional
    public void delete(Long id) {
        User user = getUserOrThrow(id);
        if (user.getId().equals(securityUtils.getCurrentUserId())) {
            throw new BusinessException("No puede eliminar su propia cuenta");
        }
        user.setDeletedAt(LocalDateTime.now());
        user.setActive(false);
        userRepository.save(user);
        auditService.log(securityUtils.getCurrentUserId(), "USER_DELETED", "User", id, null);
    }

    private User getUserOrThrow(Long id) {
        return userRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }

    private void validateRoleAssignment(Role role) {
        UserPrincipal current = securityUtils.getCurrentUser();
        if (current.getRole() == UserPrincipal.Role.MANAGER && role == Role.ADMIN) {
            throw new ForbiddenException("No puede asignar el rol ADMIN");
        }
    }

    private void preventSelfRoleEscalation(Long targetId, Role newRole) {
        if (targetId.equals(securityUtils.getCurrentUserId()) && newRole != null) {
            UserPrincipal current = securityUtils.getCurrentUser();
            if (newRole.ordinal() < current.getRole().ordinal()) {
                throw new ForbiddenException("No puede escalar sus propios privilegios");
            }
        }
    }

    private String sanitize(String input) {
        if (input == null) return null;
        return input.trim().replaceAll("[<>\"']", "");
    }

    private PageResponse<UserResponse> toPageResponse(Page<User> page) {
        return PageResponse.<UserResponse>builder()
                .content(page.getContent().stream().map(entityMapper::toUserResponse).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }
}
