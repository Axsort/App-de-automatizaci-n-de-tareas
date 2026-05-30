# Decisiones de Seguridad

## Autenticación

### JWT dual (access + refresh)

| Aspecto | Decisión | Trade-off |
|---------|----------|-----------|
| Access token | 15 min, en memoria (frontend) | Recarga de página requiere refresh |
| Refresh token | 7 días, cookie HttpOnly | Requiere `withCredentials` y CORS con credentials |
| Almacenamiento refresh | Hash SHA-256 en BD | Token plano nunca se persiste |

**Alternativa descartada:** localStorage para ambos tokens — vulnerable a XSS.

### BCrypt

- Strength 12 (configurable)
- Password nunca en logs, DTOs de respuesta ni queries expuestas

### Account lockout

- 5 intentos fallidos → bloqueo 30 minutos
- Rate limit adicional por IP: 5 requests / 15 min en `/auth/login`

## Autorización

### Por endpoint (Spring Security)

```java
.requestMatchers("/api/v1/audit/**").hasRole("ADMIN")
.requestMatchers("/api/v1/users/**").hasAnyRole("ADMIN", "MANAGER")
```

### Por método (@PreAuthorize)

Refuerzo en controllers sensibles (users, audit).

### BOLA (Broken Object Level Authorization)

Verificación en capa de servicio:
- OPERATOR solo edita automatizaciones propias
- MANAGER no puede asignar rol ADMIN
- Usuario no puede desactivar/eliminarse a sí mismo
- Usuario no puede escalar sus propios privilegios

## Datos

- **Soft delete** en User y AutomationRule (preserva auditoría)
- **DTOs exclusivos** — entidades JPA nunca expuestas
- **Sanitización** básica de inputs (strip `<>'"`)
- **JPA parametrizado** — previene SQL injection
- **Bean Validation** en todos los request DTOs

## Manejo de errores

- `GlobalExceptionHandler` captura excepciones
- Stack traces solo en logs del servidor
- Cliente recibe mensajes genéricos en 500
- Login siempre retorna mensaje genérico (anti-enumeración)

## CORS

- Orígenes restringidos via `CORS_ORIGINS`
- `allowCredentials: true` para cookies
- Solo métodos necesarios

## Cookies

```java
cookie.setHttpOnly(true);
cookie.setSecure(true);  // En producción con HTTPS
cookie.setPath("/api/v1/auth");
cookie.setAttribute("SameSite", "Strict");
```

## Recuperación de contraseña

Simulada en MVP: siempre retorna éxito para no revelar si el email existe. Estructura lista para integrar servicio de email.

## API Keys (preparado)

Estructura de paquetes permite agregar:
- Entidad `ApiKey` con hash
- Filtro alternativo a JWT
- Scope por key

## HTTPS

Asumido en producción. Documentado en README frontend (HSTS, CSP).

## Logs de seguridad

- Login/logout auditados
- Cambios de rol auditados
- Intentos de acceso denegado en logs WARN

## Pendiente para producción

- [ ] Rotación de JWT secret
- [ ] Redis para rate limiting distribuido
- [ ] 2FA para ADMIN
- [ ] WAF / reverse proxy
- [ ] Secret management (Vault, AWS Secrets Manager)
- [ ] CSP estricto sin `unsafe-inline` en styles
