# Panel de Automatización de Tareas

Plataforma web full-stack para PYMEs que permite crear flujos de automatización del tipo **"si ocurre X, entonces hacer Y"**, con panel administrativo, gestión de usuarios, auditoría y seguridad reforzada.

## Stack

| Capa | Tecnologías |
|------|-------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Zustand, React Hook Form, Zod, Axios |
| Backend | Java 21, Spring Boot 3.3, Spring Security, JPA, MySQL |
| Auth | JWT (access) + HttpOnly Cookie (refresh) |

## Inicio rápido

### Prerrequisitos

- Java 21+
- Maven 3.9+
- Node.js 20+
- MySQL 8.x

### 1. Base de datos

```bash
mysql -u root -p < database/schema.sql
```

### 2. Backend

```bash
cd backend
cp ../.env.example .env   # Ajustar variables
mvn spring-boot:run
```

API disponible en `http://localhost:8080`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App disponible en `http://localhost:5173`

## Credenciales iniciales

| Campo | Valor |
|-------|-------|
| Email | `admin@empresa.com` |
| Password | `Admin123!` |

> El admin sembrado tiene `mustChangePassword=true`. Debe cambiar la contraseña en el primer login.

## Estructura del proyecto

```
panel-automatizacion-tareas/
├── backend/          # API Spring Boot
├── frontend/         # SPA React
├── database/         # Schema SQL + seeds
├── docs/             # Arquitectura, API, seguridad
└── README.md
```

## Funcionalidades MVP

- Autenticación JWT con refresh token en cookie HttpOnly
- CRUD de usuarios con roles (ADMIN, MANAGER, OPERATOR, VIEWER)
- Constructor de automatizaciones por formulario
- Historial de ejecuciones
- Dashboard con KPIs
- Auditoría completa (solo ADMIN)
- Modo claro/oscuro

## Documentación

- [Arquitectura](docs/ARCHITECTURE.md)
- [API Endpoints](docs/API.md)
- [Seguridad](docs/SECURITY.md)
- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)
- [Mejoras futuras](docs/FUTURE_IMPROVEMENTS.md)

## Tests

```bash
# Backend
cd backend && mvn test

# Frontend
cd frontend && npm run test
```

## Licencia

Proyecto de portafolio — uso educativo y demostrativo.
