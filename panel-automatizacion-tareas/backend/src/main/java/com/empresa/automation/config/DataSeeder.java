package com.empresa.automation.config;

import com.empresa.automation.entity.User;
import com.empresa.automation.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.empresa.automation.entity.enums.Role;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AppProperties appProperties;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (!appProperties.getSeed().isEnabled()) {
            log.info("Seed deshabilitado (app.seed.enabled=false)");
            return;
        }

        String adminEmail = appProperties.getSeed().getAdminEmail();
        String adminPassword = appProperties.getSeed().getAdminPassword();

        userRepository.findByEmailIgnoreCaseAndNotDeleted(adminEmail).ifPresentOrElse(
                existing -> {
                    // Sincroniza siempre la contraseña del admin sembrado (dev/MVP)
                    existing.setPasswordHash(passwordEncoder.encode(adminPassword));
                    existing.setFailedLoginAttempts(0);
                    existing.setLockedUntil(null);
                    existing.setActive(true);
                    existing.setDeletedAt(null);
                    userRepository.save(existing);
                    log.info("=== ADMIN LISTO === email: {} | password: (valor de app.seed.admin-password) ===", adminEmail);
                },
                () -> {
                    User admin = User.builder()
                            .email(adminEmail)
                            .passwordHash(passwordEncoder.encode(adminPassword))
                            .firstName("Administrador")
                            .lastName("Sistema")
                            .role(Role.ADMIN)
                            .active(true)
                            .mustChangePassword(true)
                            .build();
                    userRepository.save(admin);
                    log.info("Admin seed user created: {}", adminEmail);
                }
        );
    }
}
