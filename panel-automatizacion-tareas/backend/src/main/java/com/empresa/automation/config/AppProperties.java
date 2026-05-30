package com.empresa.automation.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app")
@Getter
@Setter
public class AppProperties {

    private Jwt jwt = new Jwt();
    private Cors cors = new Cors();
    private Security security = new Security();
    private Seed seed = new Seed();

    @Getter
    @Setter
    public static class Jwt {
        private String secret;
        private long accessTokenExpirationMs;
        private long refreshTokenExpirationMs;
    }

    @Getter
    @Setter
    public static class Cors {
        private String allowedOrigins;
    }

    @Getter
    @Setter
    public static class Security {
        private int bcryptStrength = 12;
        private int maxLoginAttempts = 5;
        private int lockDurationMinutes = 30;
    }

    @Getter
    @Setter
    public static class Seed {
        private String adminEmail;
        private String adminPassword;
        private boolean enabled = true;
    }
}
