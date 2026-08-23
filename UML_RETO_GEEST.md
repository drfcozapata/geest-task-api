# **UML — Diagrama ER del Reto Geest**

> Mermaid (renderizable en GitHub/GitLab) + PlantUML (opcional para diagramas visuales)

---

## Diagrama ER (Mermaid)

```mermaid
erDiagram
    USERS {
        int id PK AUTO_INCREMENT
        varchar name
        varchar last_name
        varchar email UNIQUE
        timestamp created_at
        timestamp deleted_at NULL
    }

    TASKS {
        int id PK AUTO_INCREMENT
        varchar title
        text description
        enum status "open|archived"
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at NULL
    }

    TASK_ASSIGNMENTS {
        int id PK AUTO_INCREMENT
        int task_id FK
        int user_id FK
        boolean completed
        timestamp created_at
        timestamp updated_at
    }

    NOTIFICATIONS {
        int id PK AUTO_INCREMENT
        int task_id FK
        tinyint attempt
        smallint http_status NULL
        json payload
        timestamp created_at
    }

    IDEMPOTENCY_KEYS {
        varchar key PK
        json response
        smallint status_code
        timestamp created_at
    }

    USERS ||--o{ TASK_ASSIGNMENTS : "has"
    TASKS ||--o{ TASK_ASSIGNMENTS : "contains"
    TASKS ||--o{ NOTIFICATIONS : "archived_in"
```

---

## Diagrama ER (PlantUML — para renderizado con plantuml.jar)

```plantuml
@startuml
!theme plain

entity "users" as users {
  *id : INT UNSIGNED PK AI
  *name : VARCHAR(100)
  *last_name : VARCHAR(100)
  *email : VARCHAR(255) UNIQUE
  created_at : TIMESTAMP
  deleted_at : TIMESTAMP NULL
}

entity "tasks" as tasks {
  *id : INT UNSIGNED PK AI
  *title : VARCHAR(255)
  description : TEXT NULL
  *status : ENUM('open','archived') DEFAULT 'open'
  created_at : TIMESTAMP
  updated_at : TIMESTAMP
  deleted_at : TIMESTAMP NULL
}

entity "task_assignments" as task_assignments {
  *id : INT UNSIGNED PK AI
  *task_id : INT UNSIGNED FK -> tasks.id
  *user_id : INT UNSIGNED FK -> users.id
  *completed : BOOLEAN DEFAULT FALSE
  created_at : TIMESTAMP
  updated_at : TIMESTAMP
}

entity "notifications" as notifications {
  *id : INT UNSIGNED PK AI
  *task_id : INT UNSIGNED FK -> tasks.id
  *attempt : TINYINT UNSIGNED
  http_status : SMALLINT NULL
  *payload : JSON
  created_at : TIMESTAMP
}

entity "idempotency_keys" as idempotency_keys {
  *key : VARCHAR(255) PK
  *response : JSON
  *status_code : SMALLINT
  created_at : TIMESTAMP
}

users ||--o{ task_assignments : has
tasks ||--o{ task_assignments : contains
tasks ||--o{ notifications : archived_in

@enduml
```

---

## Relaciones resumidas

| Relación | Tipo | Detalle |
|---|---|---|
| `users` → `task_assignments` | 1 a N | Un usuario puede estar asignado a N tareas |
| `tasks` → `task_assignments` | 1 a N | Una tarea puede tener N usuarios asignados |
| `tasks` → `notifications` | 1 a N | Una tarea archivada genera N intentos de notificación |
| `task_assignments.task_id + user_id` | UNIQUE KEY | Evita duplicados en asignación |
| `idempotency_keys.key` | PRIMARY KEY | Deduplicación de requests |

---

## Tipos de datos (MySQL)

| Tabla | Campo | Tipo MySQL | Restricción |
|---|---|---|---|
| `users` | id | INT UNSIGNED | PK AUTO_INCREMENT |
| `users` | name | VARCHAR(100) | NOT NULL |
| `users` | last_name | VARCHAR(100) | NOT NULL |
| `users` | email | VARCHAR(255) | NOT NULL UNIQUE |
| `users` | deleted_at | TIMESTAMP | NULL |
| `tasks` | id | INT UNSIGNED | PK AUTO_INCREMENT |
| `tasks` | title | VARCHAR(255) | NOT NULL |
| `tasks` | description | TEXT | NULL |
| `tasks` | status | ENUM('open','archived') | DEFAULT 'open' |
| `task_assignments` | completed | BOOLEAN | DEFAULT FALSE |
| `notifications` | http_status | SMALLINT | NULL (si no hubo respuesta) |
| `idempotency_keys` | key | VARCHAR(255) | PK (header idempotency-key) |
