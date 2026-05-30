# Frontend — Panel de Automatización de Tareas

SPA React con TypeScript, Vite y Tailwind CSS.

## Ejecución local

```bash
npm install
npm run dev
```

El proxy de Vite redirige `/api` a `http://localhost:8080`.

## Estructura

```
src/
├── features/
│   ├── auth/          # Login, store de autenticación
│   ├── dashboard/     # KPIs y actividad
│   ├── automations/   # Lista y builder de reglas
│   ├── executions/    # Historial
│   ├── users/         # CRUD usuarios
│   ├── audit/         # Vista de auditoría
│   └── settings/      # Perfil y contraseña
└── shared/
    ├── components/    # Layout, Button, Card, guards
    ├── hooks/         # Theme store
    ├── services/      # Axios + interceptors
    ├── types/         # Tipos TypeScript
    └── utils/         # Helpers
```

## Estrategia de tokens

| Token | Almacenamiento | Justificación |
|-------|----------------|---------------|
| Access token | Memoria (Zustand) | No persiste en disco; reduce riesgo XSS |
| Refresh token | Cookie HttpOnly | Inaccesible desde JavaScript |

**Trade-off:** Al recargar la página se pierde el access token. El interceptor intenta refresh automático vía cookie. Si falla, redirige a login.

## Scripts

```bash
npm run dev       # Desarrollo
npm run build     # Build producción
npm run test      # Tests Vitest
npm run preview   # Preview del build
```

## Rutas

| Ruta | Roles |
|------|-------|
| `/login` | Público |
| `/` | Todos autenticados |
| `/automations` | Todos |
| `/executions` | Todos |
| `/users` | ADMIN, MANAGER |
| `/audit` | ADMIN |
| `/profile` | Todos |
| `/403`, `/404` | Público |

## Tests

```bash
npm run test
```

Incluye tests del store de autenticación (`hasRole`, logout).

## Headers de seguridad (despliegue)

Configurar en el servidor web / CDN:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.tudominio.com
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains
```
