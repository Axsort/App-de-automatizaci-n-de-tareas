# API Reference — v1

Base URL: `http://localhost:8080/api/v1`

## Formato de respuesta

```json
{
  "success": true,
  "message": "opcional",
  "data": {},
  "timestamp": "2026-05-30T12:00:00",
  "errors": [{ "field": "email", "message": "Email inválido" }]
}
```

## Autenticación

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| POST | `/auth/login` | No | Login. Retorna access token + cookie refresh |
| POST | `/auth/refresh` | Cookie | Renovar access token |
| POST | `/auth/logout` | Bearer | Cerrar sesión y revocar tokens |
| POST | `/auth/change-password` | Bearer | Cambiar contraseña |
| POST | `/auth/forgot-password` | No | Recuperación simulada (anti-enumeración) |

### Login request

```json
{ "email": "admin@empresa.com", "password": "Admin123!" }
```

### Login response

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "tokenType": "Bearer",
    "expiresIn": 900,
    "user": {
      "id": 1,
      "email": "admin@empresa.com",
      "firstName": "Administrador",
      "lastName": "Sistema",
      "role": "ADMIN",
      "mustChangePassword": true
    }
  }
}
```

## Usuarios

| Método | Endpoint | Roles | Descripción |
|--------|----------|-------|-------------|
| GET | `/users` | ADMIN, MANAGER | Listar (paginado, filtros) |
| GET | `/users/me` | Autenticado | Perfil propio |
| GET | `/users/{id}` | ADMIN, MANAGER | Detalle |
| POST | `/users` | ADMIN | Crear usuario |
| PUT | `/users/{id}` | ADMIN | Actualizar |
| PATCH | `/users/{id}/active?active=true` | ADMIN | Activar/desactivar |
| DELETE | `/users/{id}` | ADMIN | Soft delete |

**Query params:** `search`, `role`, `active`, `page`, `size`

## Automatizaciones

| Método | Endpoint | Roles | Descripción |
|--------|----------|-------|-------------|
| GET | `/automations` | Todos | Listar |
| GET | `/automations/{id}` | Todos | Detalle |
| POST | `/automations` | ADMIN, MANAGER, OPERATOR | Crear |
| PUT | `/automations/{id}` | ADMIN, MANAGER, OPERATOR* | Actualizar |
| DELETE | `/automations/{id}` | ADMIN, MANAGER | Soft delete |
| POST | `/automations/{id}/duplicate` | ADMIN, MANAGER, OPERATOR | Duplicar |
| POST | `/automations/{id}/execute` | ADMIN, MANAGER, OPERATOR | Ejecución manual |

*OPERATOR solo puede editar automatizaciones propias.

**Query params:** `search`, `triggerType`, `active`, `page`, `size`

### Create automation

```json
{
  "name": "Notificar tarea vencida",
  "description": "Envía notificación cuando una tarea vence",
  "triggerType": "TASK_OVERDUE",
  "active": true,
  "conditions": [
    { "fieldName": "priority", "operator": "EQUALS", "fieldValue": "HIGH" }
  ],
  "actions": [
    {
      "actionType": "CREATE_NOTIFICATION",
      "parameters": { "message": "Tarea vencida", "recipient": "manager" }
    }
  ]
}
```

## Ejecuciones

| Método | Endpoint | Roles | Descripción |
|--------|----------|-------|-------------|
| GET | `/executions` | Todos | Listar historial |

**Query params:** `automationId`, `status`, `from`, `to`, `page`, `size`

## Dashboard

| Método | Endpoint | Roles | Descripción |
|--------|----------|-------|-------------|
| GET | `/dashboard` | Todos | KPIs y actividad reciente |

## Auditoría

| Método | Endpoint | Roles | Descripción |
|--------|----------|-------|-------------|
| GET | `/audit` | ADMIN | Listar logs |

**Query params:** `action`, `userId`, `from`, `to`, `search`, `page`, `size`

## Códigos HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK |
| 201 | Creado |
| 400 | Validación / error de negocio |
| 401 | No autenticado |
| 403 | Sin permisos |
| 404 | Recurso no encontrado |
| 429 | Rate limit (login) |
| 500 | Error interno (sin stack trace) |
