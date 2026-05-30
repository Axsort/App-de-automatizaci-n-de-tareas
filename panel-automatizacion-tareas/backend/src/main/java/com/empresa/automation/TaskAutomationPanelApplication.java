package com.empresa.automation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
@org.springframework.boot.context.properties.EnableConfigurationProperties(com.empresa.automation.config.AppProperties.class)
public class TaskAutomationPanelApplication {

    public static void main(String[] args) {
        SpringApplication.run(TaskAutomationPanelApplication.class, args);
    }
}
