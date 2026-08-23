# Geest Task API

API REST para gestión de tareas para empresas, desarrollada con Node.js, Express, TypeScript y MySQL.

## Características

- CRUD completo de usuarios y tareas
- Asignación de múltiples usuarios a tareas
- Marcado de completado por usuario
- Archivado automático de tareas cuando todos los usuarios completan
- Notificaciones con reintentos exponenciales
- Idempotencia en endpoints POST
- Soft delete para preservar histórico
- Documentación Swagger/OpenAPI

## Stack Tecnológico

- **Runtime:** Node.js
- **Framework:** Express + TypeScript
- **Base de datos:** MySQL
- **Documentación:** Swagger UI + OpenAPI 3.0.3
- **Testing:** Jest + Supertest
- **Logger:** Winston

## Instalación

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/geest-task-api.git
cd geest-task-api

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de MySQL

# Crear base de datos y tablas
mysql -u root -p < migrations/001_initial_schema.sql

# Compilar TypeScript
npm run build

# Iniciar servidor
npm start
```

## Variables de Entorno

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=geest_task_db
NOTIFY_URL=https://httpbin.org/post
NODE_ENV=development
```

## Endpoints

### Usuarios

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/v1/users | Crear usuario |
| GET | /api/v1/users | Listar usuarios |
| GET | /api/v1/users/:idUser/tasks | Tareas del usuario |
| DELETE | /api/v1/users/:idUser | Eliminar usuario (soft delete) |

### Tareas

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/v1/tasks | Crear tarea |
| GET | /api/v1/tasks | Listar tareas |
| GET | /api/v1/tasks/:idTask | Detalle de tarea |
| POST | /api/v1/tasks/:idTask/assign | Asignar usuarios |
| POST | /api/v1/tasks/:idTask/complete | Marcar completada |
| GET | /api/v1/tasks/:idTask/notifications | Notificaciones |
| DELETE | /api/v1/tasks/:idTask | Eliminar tarea (soft delete) |

### Documentación

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /docs | Swagger UI |
| GET | /docs.json | OpenAPI JSON |

### Utilidades

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /health | Health check |

## Idempotencia

Todos los endpoints POST aceptan el header `Idempotency-Key`. Si se envía dos veces la misma key con el mismo body, la operación se ejecuta una sola vez y ambas respuestas son idénticas.

## Testing

```bash
# Ejecutar tests
npm test

# Ejecutar tests en modo watch
npm run test:watch
```

## Deploy

### Opciones recomendadas (gratuitas)

1. **Railway.app** - Despliegue automático desde GitHub con MySQL integrado
2. **Render.com** - Free tier con base de datos
3. **Fly.io** - Free tier

### Deploy en Railway

1. Crear cuenta en Railway
2. Conectar repositorio de GitHub
3. Agregar plugin MySQL
4. Configurar variables de entorno
5. Deploy automático

## Decisiones Técnicas

1. **Soft delete:** Se utiliza `deleted_at` nullable para preservar el histórico de datos
2. **Idempotencia:** Implementada con tabla `idempotency_keys` y `SELECT ... FOR UPDATE`
3. **Notificaciones:** Worker asíncrono con reintentos exponenciales (1s, 3s, 10s)
4. **Archivado exactly-once:** Transacción con lock optimista

## Supuestos

1. No hay autenticación (no requerido por el reto)
2. El `description` en tasks es opcional
3. El estado inicial es `open`, solo cambia a `archived`
4. Un usuario no puede completar una tarea a la que no está asignado
5. `NOTIFY_URL` es configurable vía variable de entorno

## Licencia

ISC
