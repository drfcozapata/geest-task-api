USE geest_task_db;

-- Notificaciones por intento: agregar next_attempt_at y unique constraint
ALTER TABLE notifications
  ADD COLUMN next_attempt_at TIMESTAMP NULL DEFAULT NULL AFTER payload,
  ADD UNIQUE KEY uq_task_attempt (task_id, attempt);

-- Idempotency: aseguramos que status_code pueda ser 0 como placeholder
-- (no requiere cambio de schema, solo aseguramos el comportamiento)
