-- Panel de Automatización de Tareas — Schema MySQL 8.x
-- Ejecutar: mysql -u root -p < database/schema.sql

CREATE DATABASE IF NOT EXISTS task_automation_panel
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE task_automation_panel;

-- ─── Users ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    email           VARCHAR(255) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    role            ENUM('ADMIN','MANAGER','OPERATOR','VIEWER') NOT NULL DEFAULT 'VIEWER',
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
    last_login_at   DATETIME(6) NULL,
    failed_login_attempts INT NOT NULL DEFAULT 0,
    locked_until    DATETIME(6) NULL,
    created_at      DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    created_by      BIGINT NULL,
    deleted_at      DATETIME(6) NULL,
    UNIQUE KEY uk_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_active (active),
    INDEX idx_users_deleted (deleted_at)
) ENGINE=InnoDB;

-- ─── Refresh Tokens ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    token_hash      VARCHAR(255) NOT NULL,
    expires_at      DATETIME(6) NOT NULL,
    revoked         BOOLEAN NOT NULL DEFAULT FALSE,
    ip_address      VARCHAR(45) NULL,
    user_agent      VARCHAR(512) NULL,
    created_at      DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_refresh_user FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_refresh_token_hash (token_hash),
    INDEX idx_refresh_user (user_id),
    INDEX idx_refresh_expires (expires_at)
) ENGINE=InnoDB;

-- ─── Automation Rules ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS automation_rules (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(200) NOT NULL,
    description     TEXT NULL,
    trigger_type    ENUM('TASK_CREATED','TASK_OVERDUE','LOW_STOCK','ORDER_DELAYED') NOT NULL,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_by      BIGINT NOT NULL,
    created_at      DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at      DATETIME(6) NULL,
    CONSTRAINT fk_automation_creator FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_automation_trigger (trigger_type),
    INDEX idx_automation_active (active),
    INDEX idx_automation_creator (created_by),
    INDEX idx_automation_deleted (deleted_at)
) ENGINE=InnoDB;

-- ─── Automation Conditions ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS automation_conditions (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    automation_rule_id  BIGINT NOT NULL,
    field_name          VARCHAR(100) NOT NULL,
    operator            ENUM('EQUALS','NOT_EQUALS','GREATER_THAN','LESS_THAN','CONTAINS') NOT NULL,
    field_value         VARCHAR(500) NOT NULL,
    sort_order          INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_condition_rule FOREIGN KEY (automation_rule_id) REFERENCES automation_rules(id) ON DELETE CASCADE,
    INDEX idx_condition_rule (automation_rule_id)
) ENGINE=InnoDB;

-- ─── Automation Actions ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS automation_actions (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    automation_rule_id  BIGINT NOT NULL,
    action_type         ENUM('CHANGE_STATUS','ASSIGN_RESPONSIBLE','CREATE_NOTIFICATION','LOG_AUDIT_EVENT') NOT NULL,
    parameters          JSON NOT NULL,
    sort_order          INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_action_rule FOREIGN KEY (automation_rule_id) REFERENCES automation_rules(id) ON DELETE CASCADE,
    INDEX idx_action_rule (automation_rule_id)
) ENGINE=InnoDB;

-- ─── Execution Logs ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS execution_logs (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    automation_rule_id  BIGINT NOT NULL,
    status              ENUM('SUCCESS','FAILED','PARTIAL') NOT NULL,
    message             VARCHAR(1000) NULL,
    error_message       TEXT NULL,
    executed_by         BIGINT NULL,
    executed_at         DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_execution_rule FOREIGN KEY (automation_rule_id) REFERENCES automation_rules(id),
    CONSTRAINT fk_execution_user FOREIGN KEY (executed_by) REFERENCES users(id),
    INDEX idx_execution_rule (automation_rule_id),
    INDEX idx_execution_status (status),
    INDEX idx_execution_date (executed_at)
) ENGINE=InnoDB;

-- ─── Audit Logs ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NULL,
    action          VARCHAR(100) NOT NULL,
    resource_type   VARCHAR(100) NULL,
    resource_id     BIGINT NULL,
    ip_address      VARCHAR(45) NULL,
    details         JSON NULL,
    created_at      DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_action (action),
    INDEX idx_audit_created (created_at),
    INDEX idx_audit_resource (resource_type, resource_id)
) ENGINE=InnoDB;

-- ─── Seed: Admin inicial ─────────────────────────────────────────────────────
-- NO insertar admin aquí: el hash BCrypt debe generarlo el backend (DataSeeder).
-- Al iniciar Spring Boot con SEED_ENABLED=true se crea admin@empresa.com / Admin123!
