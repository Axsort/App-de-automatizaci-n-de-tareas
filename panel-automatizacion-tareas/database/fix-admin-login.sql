USE task_automation_panel;

-- Si el login sigue en 401, borra el admin y reinicia el backend desde Eclipse.
-- El DataSeeder lo recreará con la contraseña de application.yml (Admin123! por defecto).

DELETE FROM refresh_tokens WHERE user_id IN (
  SELECT id FROM users WHERE email = 'admin@empresa.com'
);
DELETE FROM users WHERE email = 'admin@empresa.com';

-- Verifica que no quede ningún admin:
SELECT id, email, active, failed_login_attempts, locked_until, deleted_at FROM users;
