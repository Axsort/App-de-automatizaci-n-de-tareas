# Arquitectura — Panel de Automatización de Tareas

## Visión general

Aplicación full-stack para PYMEs que permite definir reglas de automatización del tipo **"si ocurre X, entonces hacer Y"**, con panel administrativo, auditoría y seguridad reforzada.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React SPA)                      │
│  auth │ dashboard │ automations │ executions │ users │ audit    │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS / REST JSON
                             │ Access Token (memoria)
                             │ Refresh Token (HttpOnly Cookie)
┌────────────────────────────▼────────────────────────────────────┐
│                   Backend (Spring Boot 3.x)                      │
│  Controller → Service → Repository → MySQL                       │
│  Security Filter (JWT) │ Rate Limiter │ Audit Aspect            │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                         MySQL 8.x                                │
└─────────────────────────────────────────────────────────────────┘
```

## Backend — capas

| Capa | Responsabilidad |
|------|-----------------|
| `config` | Beans, CORS, OpenAPI, rate limiting |
| `security` | JWT, filtros, UserDetails, permisos |
| `controller` | REST endpoints versionados `/api/v1/*` |
| `service` | Lógica de negocio, autorización a nivel objeto |
| `repository` | Spring Data JPA |
| `entity` | Entidades JPA con auditoría |
| `dto` | Request/Response sin exponer entidades |
| `mapper` | MapStruct entre entity ↔ dto |
| `exception` | Manejo global, respuestas consistentes |
| `audit` | Registro de eventos de seguridad y negocio |

## Frontend — features

| Feature | Contenido |
|---------|-----------|
| `auth` | Login, logout, refresh, guards |
| `dashboard` | KPIs y actividad reciente |
| `automations` | Lista, builder por formulario, CRUD |
| `executions` | Historial de ejecuciones |
| `users` | CRUD usuarios (ADMIN/MANAGER) |
| `settings` | Perfil, cambio de contraseña |
| `shared` | Layout, componentes, hooks, API client |

## Flujo de autenticación

1. `POST /api/v1/auth/login` → access token en body + refresh token en cookie HttpOnly.
2. Access token se guarda **solo en memoria** (Zustand), nunca en localStorage.
3. Axios interceptor adjunta `Authorization: Bearer`.
4. En 401, intenta `POST /api/v1/auth/refresh` (cookie automática).
5. Si refresh falla → logout y redirect a login.

## Autorización por roles

| Recurso | ADMIN | MANAGER | OPERATOR | VIEWER |
|---------|-------|---------|----------|--------|
| Usuarios CRUD | ✓ | lectura | ✗ | ✗ |
| Automatizaciones CRUD | ✓ | ✓ | crear/editar propias | lectura |
| Ejecuciones | ✓ | ✓ | ✓ | lectura |
| Auditoría | ✓ | ✗ | ✗ | ✗ |
| Dashboard | ✓ | ✓ | ✓ | ✓ |

## Modelo de datos (resumen)

- **User** ↔ Role (enum embebido)
- **AutomationRule** → Conditions[], Actions[]
- **ExecutionLog** → AutomationRule
- **AuditLog** → User
- **RefreshToken** → User (hash almacenado, no token plano)

## Decisiones de seguridad clave

Ver `docs/SECURITY.md` para detalle completo.

- BCrypt strength 12
- Access token 15 min / Refresh 7 días
- Rate limit login: 5 intentos / 15 min por IP
- Account lock: 5 fallos → bloqueo 30 min
- BOLA: verificación de ownership en servicios
- Soft delete en User y AutomationRule
- DTOs exclusivos en API pública
