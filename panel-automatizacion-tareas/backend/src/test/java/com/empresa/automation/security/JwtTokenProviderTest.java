package com.empresa.automation.security;

import com.empresa.automation.config.AppProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        AppProperties props = new AppProperties();
        AppProperties.Jwt jwt = new AppProperties.Jwt();
        jwt.setSecret("test-secret-key-minimum-32-characters-long");
        jwt.setAccessTokenExpirationMs(900000);
        jwt.setRefreshTokenExpirationMs(604800000);
        props.setJwt(jwt);
        jwtTokenProvider = new JwtTokenProvider(props);
    }

    @Test
    void generateAndValidateAccessToken() {
        UserPrincipal principal = new UserPrincipal(
                com.empresa.automation.entity.User.builder()
                        .id(1L)
                        .email("test@test.com")
                        .passwordHash("hash")
                        .firstName("Test")
                        .lastName("User")
                        .role(com.empresa.automation.entity.enums.Role.ADMIN)
                        .active(true)
                        .build()
        );

        String token = jwtTokenProvider.generateAccessToken(principal);
        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));
        assertEquals(1L, jwtTokenProvider.getUserIdFromToken(token));
    }

    @Test
    void rejectsInvalidToken() {
        assertFalse(jwtTokenProvider.validateToken("invalid.token.here"));
    }
}
