# Backend — Panel de Automatización de Tareas

API REST con Spring Boot 3.3 y Java 21.

## Ejecución local

```bash
# Configurar variables (ver .env.example en raíz)
export DB_URL=jdbc:mysql://localhost:3306/task_automation_panel
export DB_USERNAME=root
export DB_PASSWORD=tu_password
export JWT_SECRET=tu-clave-secreta-minimo-32-caracteres

mvn spring-boot:run
```

## Estructura de paquetes

```
com.empresa.automation/
├── config/       # Beans, CORS, seed, properties
├── security/     # JWT, filtros, rate limiting
├── controller/   # REST /api/v1/*
├── service/      # Lógica de negocio + autorización BOLA
├── repository/   # Spring Data JPA
├── entity/       # Entidades JPA
├── dto/          # Request/Response
├── mapper/       # Entity ↔ DTO
├── exception/    # Manejo global de errores
└── audit/        # Servicio de auditoría
```

## Perfiles

| Perfil | Uso |
|--------|-----|
| default | MySQL en desarrollo |
| test | H2 en memoria para tests |

## Tests

```bash
mvn test
```

Incluye:
- `JwtTokenProviderTest` — generación y validación JWT
- `UserServiceTest` — reglas de negocio de usuarios
- `AuthControllerSecurityTest` — endpoints protegidos y login inválido

## Variables de entorno

Ver `.env.example` en la raíz del proyecto.
