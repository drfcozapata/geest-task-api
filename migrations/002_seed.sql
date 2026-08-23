-- Geest Task Database Seeder
-- Datos fake en español de México
-- Ejecutar: mysql -u root -p geest_task_db < migrations/002_seed.sql

USE geest_task_db;

-- Limpiar datos existentes
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE idempotency_keys;
TRUNCATE TABLE notifications;
TRUNCATE TABLE task_assignments;
TRUNCATE TABLE tasks;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- USERS (10 usuarios mexicanos)
-- ============================================
INSERT INTO users (name, last_name, email, created_at) VALUES
('María', 'García López', 'maria.garcia@correo.com', NOW()),
('Juan', 'Hernández Ruiz', 'juan.hernandez@correo.com', NOW()),
('Ana', 'Martínez Sánchez', 'ana.martinez@correo.com', NOW()),
('Carlos', 'Rodríguez Fernández', 'carlos.rodriguez@correo.com', NOW()),
('Laura', 'López García', 'laura.lopez@correo.com', NOW()),
('Miguel', 'Torres Ramírez', 'miguel.torres@correo.com', NOW()),
('Sofía', 'Díaz Morales', 'sofia.diaz@correo.com', NOW()),
('Fernando', 'Vargas Orozco', 'fer.vargas@correo.com', NOW()),
('Valentina', 'Moreno Castillo', 'valentina.moreno@correo.com', NOW()),
('Roberto', 'Jiménez Aguilar', 'roberto.jimenez@correo.com', NOW());

-- ============================================
-- TASKS (5-15 tareas por usuario, total ~100)
-- ============================================
INSERT INTO tasks (title, description, status, created_at, updated_at) VALUES
-- Tareas de María (user 1) - 8 tareas
('Diseñar mockups del dashboard', 'Crear los mockups en Figma para el panel principal', 'archived', DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_SUB(NOW(), INTERVAL 25 DAY)),
('Configurar entorno de desarrollo', 'Instalar Docker, Node.js y configurar la BD local', 'archived', DATE_SUB(NOW(), INTERVAL 28 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY)),
('Revisar documentación de la API', 'Validar que la documentación Swagger esté actualizada', 'open', DATE_SUB(NOW(), INTERVAL 15 DAY), NOW()),
('Crear endpoint de autenticación', 'Implementar login con JWT', 'open', DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),
('Optimizar consultas SQL', 'Revisar queries lentas en el dashboard', 'open', DATE_SUB(NOW(), INTERVAL 5 DAY), NOW()),
('Implementar cache Redis', 'Agregar cache para consultas frecuentes', 'open', DATE_SUB(NOW(), INTERVAL 3 DAY), NOW()),
('Escribir tests de integración', 'Tests para los endpoints críticos', 'open', DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
('Code review del módulo de pagos', 'Revisar PR #42 del sistema de pagos', 'open', DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),

-- Tareas de Juan (user 2) - 10 tareas
('Migrar base de datos a PostgreSQL', 'Planificar migración desde MySQL', 'archived', DATE_SUB(NOW(), INTERVAL 35 DAY), DATE_SUB(NOW(), INTERVAL 28 DAY)),
('Implementar sistema de notificaciones', 'Notificaciones push y por email', 'archived', DATE_SUB(NOW(), INTERVAL 32 DAY), DATE_SUB(NOW(), INTERVAL 22 DAY)),
('Crear dashboard de métricas', 'Panel con gráficas de uso del sistema', 'archived', DATE_SUB(NOW(), INTERVAL 25 DAY), DATE_SUB(NOW(), INTERVAL 18 DAY)),
('Configurar CI/CD con GitHub Actions', 'Pipeline de build, test y deploy', 'archived', DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY)),
('Refactorizar módulo de usuarios', 'Mejorar la estructura del código', 'open', DATE_SUB(NOW(), INTERVAL 12 DAY), NOW()),
('Implementar paginación', 'Agregar paginación a todos los endpoints GET', 'open', DATE_SUB(NOW(), INTERVAL 8 DAY), NOW()),
('Crear endpoint de reportes', 'API para generar reportes en PDF', 'open', DATE_SUB(NOW(), INTERVAL 5 DAY), NOW()),
('Configurar logging centralizado', 'Implementar ELK stack o similar', 'open', DATE_SUB(NOW(), INTERVAL 3 DAY), NOW()),
('Revisar seguridad de endpoints', 'Auditar permisos y rate limiting', 'open', DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
('Documentar proceso de deploy', 'Guía paso a paso para nuevos desarrolladores', 'open', DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),

-- Tareas de Ana (user 3) - 7 tareas
('Diseñar flujo de checkout', 'Wireframes del proceso de compra', 'archived', DATE_SUB(NOW(), INTERVAL 40 DAY), DATE_SUB(NOW(), INTERVAL 30 DAY)),
('Implementar carrito de compras', 'Carrito con persistencia en BD', 'archived', DATE_SUB(NOW(), INTERVAL 35 DAY), DATE_SUB(NOW(), INTERVAL 25 DAY)),
('Crear sistema de valoraciones', 'Los usuarios pueden calificar productos', 'open', DATE_SUB(NOW(), INTERVAL 18 DAY), NOW()),
('Integrar pasarela de pagos', 'Conectar con Stripe o Conekta', 'open', DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),
('Implementar búsqueda avanzada', 'Filtros por categoría, precio, etc.', 'open', DATE_SUB(NOW(), INTERVAL 5 DAY), NOW()),
('Crear módulo de cupones', 'Sistema de descuentos y promociones', 'open', DATE_SUB(NOW(), INTERVAL 3 DAY), NOW()),
('Optimizar imágenes de productos', 'Implementar lazy loading y compresión', 'open', DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),

-- Tareas de Carlos (user 4) - 12 tareas
('Configurar monitoreo con Datadog', 'Métricas de rendimiento y alertas', 'archived', DATE_SUB(NOW(), INTERVAL 45 DAY), DATE_SUB(NOW(), INTERVAL 35 DAY)),
('Implementar CDN para assets', 'Configurar CloudFront o similar', 'archived', DATE_SUB(NOW(), INTERVAL 42 DAY), DATE_SUB(NOW(), INTERVAL 32 DAY)),
('Crear microservicio de archivos', 'Servicio para upload y gestión de archivos', 'archived', DATE_SUB(NOW(), INTERVAL 38 DAY), DATE_SUB(NOW(), INTERVAL 28 DAY)),
('Migrar a TypeScript', 'Convertir el proyecto principal a TS', 'archived', DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY)),
('Implementar WebSocket', 'Tiempo real para chat y notificaciones', 'archived', DATE_SUB(NOW(), INTERVAL 25 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY)),
('Configurar Docker Compose', 'Ambiente completo con servicios', 'archived', DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 12 DAY)),
('Crear API gateway', 'Proxy reverso y routing', 'open', DATE_SUB(NOW(), INTERVAL 15 DAY), NOW()),
('Implementar circuit breaker', 'Patrón de resiliencia para servicios externos', 'open', DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),
('Configurar load balancer', 'Distribución de tráfico entre instancias', 'open', DATE_SUB(NOW(), INTERVAL 7 DAY), NOW()),
('Implementar cola de mensajes', 'RabbitMQ o Redis Streams', 'open', DATE_SUB(NOW(), INTERVAL 4 DAY), NOW()),
('Crear health check endpoint', 'Endpoint para verificar estado del servicio', 'open', DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
('Documentar arquitectura', 'Diagrama de componentes y flujo de datos', 'open', DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),

-- Tareas de Laura (user 5) - 6 tareas
('Implementar autenticación OAuth', 'Login con Google y Facebook', 'archived', DATE_SUB(NOW(), INTERVAL 28 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY)),
('Crear sistema de roles y permisos', 'RBAC para el panel de administración', 'archived', DATE_SUB(NOW(), INTERVAL 22 DAY), DATE_SUB(NOW(), INTERVAL 14 DAY)),
('Implementar dos factores (2FA)', 'Autenticación增强 de seguridad', 'open', DATE_SUB(NOW(), INTERVAL 16 DAY), NOW()),
('Crear dashboard de admin', 'Panel de control para administradores', 'open', DATE_SUB(NOW(), INTERVAL 8 DAY), NOW()),
('Implementar auditoría de acciones', 'Log de quién hizo qué y cuándo', 'open', DATE_SUB(NOW(), INTERVAL 4 DAY), NOW()),
('Configurar backup automático', 'Backups diarios de la base de datos', 'open', DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),

-- Tareas de Miguel (user 6) - 9 tareas
('Implementar tests E2E con Playwright', 'Tests end-to-end del flujo principal', 'archived', DATE_SUB(NOW(), INTERVAL 33 DAY), DATE_SUB(NOW(), INTERVAL 24 DAY)),
('Configurar Jest con coverage', 'Mínimo 80% de cobertura', 'archived', DATE_SUB(NOW(), INTERVAL 28 DAY), DATE_SUB(NOW(), INTERVAL 18 DAY)),
('Crear fixtures de testing', 'Datos de prueba reutilizables', 'archived', DATE_SUB(NOW(), INTERVAL 22 DAY), DATE_SUB(NOW(), INTERVAL 14 DAY)),
('Implementar mock server', 'Servidor mock para tests aislados', 'open', DATE_SUB(NOW(), INTERVAL 14 DAY), NOW()),
('Escribir tests de rendimiento', 'Pruebas de carga con k6 o Artillery', 'open', DATE_SUB(NOW(), INTERVAL 9 DAY), NOW()),
('Configurar test en CI', 'Ejecutar tests en cada PR', 'open', DATE_SUB(NOW(), INTERVAL 6 DAY), NOW()),
('Crear test de regresión', 'Suite para funcionalidad crítica', 'open', DATE_SUB(NOW(), INTERVAL 4 DAY), NOW()),
('Implementar visual regression', 'Comparar screenshots entre versiones', 'open', DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
('Documentar estrategia de testing', 'Guía de mejores prácticas', 'open', DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),

-- Tareas de Sofía (user 7) - 11 tareas
('Diseñar sistema de templates', 'Templates reutilizables para emails', 'archived', DATE_SUB(NOW(), INTERVAL 38 DAY), DATE_SUB(NOW(), INTERVAL 28 DAY)),
('Implementar envío de emails', 'Integración con SendGrid o SES', 'archived', DATE_SUB(NOW(), INTERVAL 34 DAY), DATE_SUB(NOW(), INTERVAL 24 DAY)),
('Crear editor de emails', 'Editor visual tipo drag and drop', 'archived', DATE_SUB(NOW(), INTERVAL 28 DAY), DATE_SUB(NOW(), INTERVAL 18 DAY)),
('Implementar analytics de emails', 'Tracking de aperturas y clics', 'open', DATE_SUB(NOW(), INTERVAL 18 DAY), NOW()),
('Crear template de bienvenida', 'Email automático al registrarse', 'open', DATE_SUB(NOW(), INTERVAL 12 DAY), NOW()),
('Implementar newsletters', 'Envío masivo con segmentación', 'open', DATE_SUB(NOW(), INTERVAL 8 DAY), NOW()),
('Crear template de recuperación', 'Email para recuperar contraseña', 'open', DATE_SUB(NOW(), INTERVAL 5 DAY), NOW()),
('Implementar cola de envío', 'Queue para emails masivos', 'open', DATE_SUB(NOW(), INTERVAL 4 DAY), NOW()),
('Configurar dominio de envío', 'SPF, DKIM, DMARC', 'open', DATE_SUB(NOW(), INTERVAL 3 DAY), NOW()),
('Crear dashboard de métricas', 'Estadísticas de envíos', 'open', DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
('Documentar API de emails', 'Guía para otros desarrolladores', 'open', DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),

-- Tareas de Fernando (user 8) - 5 tareas
('Implementar WebSocket server', 'Servidor para comunicación en tiempo real', 'archived', DATE_SUB(NOW(), INTERVAL 42 DAY), DATE_SUB(NOW(), INTERVAL 32 DAY)),
('Crear sistema de chat', 'Chat en tiempo real entre usuarios', 'archived', DATE_SUB(NOW(), INTERVAL 36 DAY), DATE_SUB(NOW(), INTERVAL 26 DAY)),
('Implementar typing indicators', 'Indicador de "escribiendo..."', 'open', DATE_SUB(NOW(), INTERVAL 20 DAY), NOW()),
('Crear sistema de mensajes offline', 'Cola de mensajes cuando no hay conexión', 'open', DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),
('Implementar push notifications', 'Notificaciones push del navegador', 'open', DATE_SUB(NOW(), INTERVAL 5 DAY), NOW()),

-- Tareas de Valentina (user 9) - 13 tareas
('Implementar módulo de reportes', 'Generación de reportes en PDF y Excel', 'archived', DATE_SUB(NOW(), INTERVAL 40 DAY), DATE_SUB(NOW(), INTERVAL 30 DAY)),
('Crear gráficas con Chart.js', 'Visualización de datos del dashboard', 'archived', DATE_SUB(NOW(), INTERVAL 36 DAY), DATE_SUB(NOW(), INTERVAL 26 DAY)),
('Implementar exportación CSV', 'Exportar datos tabulares', 'archived', DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY)),
('Crear reporte de ventas', 'Reporte mensual con filtros', 'archived', DATE_SUB(NOW(), INTERVAL 24 DAY), DATE_SUB(NOW(), INTERVAL 16 DAY)),
('Implementar programación de reportes', 'Envío automático por email', 'open', DATE_SUB(NOW(), INTERVAL 16 DAY), NOW()),
('Crear dashboard ejecutivo', 'Resumen para directivos', 'open', DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),
('Implementar drill-down', 'Navegación detallada en gráficas', 'open', DATE_SUB(NOW(), INTERVAL 7 DAY), NOW()),
('Crear template de reportes', 'Plantillas reutilizables', 'open', DATE_SUB(NOW(), INTERVAL 5 DAY), NOW()),
('Implementar comparativas', 'Comparar períodos', 'open', DATE_SUB(NOW(), INTERVAL 4 DAY), NOW()),
('Configurar cache de reportes', 'Redis para reportes frecuentes', 'open', DATE_SUB(NOW(), INTERVAL 3 DAY), NOW()),
('Implementar alertas', 'Notificaciones cuando hay anomalies', 'open', DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
('Crear API de reportes', 'Endpoints para reportes programáticos', 'open', DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
('Documentar módulo de reportes', 'Guía de uso y API', 'open', DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),

-- Tareas de Roberto (user 10) - 8 tareas
('Implementar validación de formularios', 'Validación client y server side', 'archived', DATE_SUB(NOW(), INTERVAL 32 DAY), DATE_SUB(NOW(), INTERVAL 22 DAY)),
('Crear componente de tabla', 'Tabla reutilizable con sorting y filtros', 'archived', DATE_SUB(NOW(), INTERVAL 26 DAY), DATE_SUB(NOW(), INTERVAL 16 DAY)),
('Implementar formularios multi-paso', 'Wizard para formularios largos', 'open', DATE_SUB(NOW(), INTERVAL 18 DAY), NOW()),
('Crear librería de componentes', 'Componentes UI compartidos', 'open', DATE_SUB(NOW(), INTERVAL 12 DAY), NOW()),
('Implementar dark mode', 'Tema oscuro para la aplicación', 'open', DATE_SUB(NOW(), INTERVAL 7 DAY), NOW()),
('Crear sistema de notificaciones UI', 'Toasts y banners in-app', 'open', DATE_SUB(NOW(), INTERVAL 4 DAY), NOW()),
('Implementar accesibilidad', 'WCAG 2.1 AA compliance', 'open', DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
('Documentar librería de componentes', 'Storybook o documentación similar', 'open', DATE_SUB(NOW(), INTERVAL 1 DAY), NOW());

-- ============================================
-- TASK_ASSIGNMENTS (asignar usuarios a tareas)
-- ============================================
INSERT INTO task_assignments (task_id, user_id, completed, created_at, updated_at) VALUES
-- María (user 1) - sus 8 tareas
(1, 1, TRUE, DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_SUB(NOW(), INTERVAL 25 DAY)),
(2, 1, TRUE, DATE_SUB(NOW(), INTERVAL 28 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY)),
(3, 1, FALSE, DATE_SUB(NOW(), INTERVAL 15 DAY), NOW()),
(4, 1, FALSE, DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),
(5, 1, FALSE, DATE_SUB(NOW(), INTERVAL 5 DAY), NOW()),
(6, 1, FALSE, DATE_SUB(NOW(), INTERVAL 3 DAY), NOW()),
(7, 1, FALSE, DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
(8, 1, FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),

-- Juan (user 2) - sus 10 tareas
(9, 2, TRUE, DATE_SUB(NOW(), INTERVAL 35 DAY), DATE_SUB(NOW(), INTERVAL 28 DAY)),
(10, 2, TRUE, DATE_SUB(NOW(), INTERVAL 32 DAY), DATE_SUB(NOW(), INTERVAL 22 DAY)),
(11, 2, TRUE, DATE_SUB(NOW(), INTERVAL 25 DAY), DATE_SUB(NOW(), INTERVAL 18 DAY)),
(12, 2, TRUE, DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY)),
(13, 2, FALSE, DATE_SUB(NOW(), INTERVAL 12 DAY), NOW()),
(14, 2, FALSE, DATE_SUB(NOW(), INTERVAL 8 DAY), NOW()),
(15, 2, FALSE, DATE_SUB(NOW(), INTERVAL 5 DAY), NOW()),
(16, 2, FALSE, DATE_SUB(NOW(), INTERVAL 3 DAY), NOW()),
(17, 2, FALSE, DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
(18, 2, FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),

-- Ana (user 3) - sus 7 tareas
(19, 3, TRUE, DATE_SUB(NOW(), INTERVAL 40 DAY), DATE_SUB(NOW(), INTERVAL 30 DAY)),
(20, 3, TRUE, DATE_SUB(NOW(), INTERVAL 35 DAY), DATE_SUB(NOW(), INTERVAL 25 DAY)),
(21, 3, FALSE, DATE_SUB(NOW(), INTERVAL 18 DAY), NOW()),
(22, 3, FALSE, DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),
(23, 3, FALSE, DATE_SUB(NOW(), INTERVAL 5 DAY), NOW()),
(24, 3, FALSE, DATE_SUB(NOW(), INTERVAL 3 DAY), NOW()),
(25, 3, FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),

-- Carlos (user 4) - sus 12 tareas
(26, 4, TRUE, DATE_SUB(NOW(), INTERVAL 45 DAY), DATE_SUB(NOW(), INTERVAL 35 DAY)),
(27, 4, TRUE, DATE_SUB(NOW(), INTERVAL 42 DAY), DATE_SUB(NOW(), INTERVAL 32 DAY)),
(28, 4, TRUE, DATE_SUB(NOW(), INTERVAL 38 DAY), DATE_SUB(NOW(), INTERVAL 28 DAY)),
(29, 4, TRUE, DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY)),
(30, 4, TRUE, DATE_SUB(NOW(), INTERVAL 25 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY)),
(31, 4, TRUE, DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 12 DAY)),
(32, 4, FALSE, DATE_SUB(NOW(), INTERVAL 15 DAY), NOW()),
(33, 4, FALSE, DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),
(34, 4, FALSE, DATE_SUB(NOW(), INTERVAL 7 DAY), NOW()),
(35, 4, FALSE, DATE_SUB(NOW(), INTERVAL 4 DAY), NOW()),
(36, 4, FALSE, DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
(37, 4, FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),

-- Laura (user 5) - sus 6 tareas
(38, 5, TRUE, DATE_SUB(NOW(), INTERVAL 28 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY)),
(39, 5, TRUE, DATE_SUB(NOW(), INTERVAL 22 DAY), DATE_SUB(NOW(), INTERVAL 14 DAY)),
(40, 5, FALSE, DATE_SUB(NOW(), INTERVAL 16 DAY), NOW()),
(41, 5, FALSE, DATE_SUB(NOW(), INTERVAL 8 DAY), NOW()),
(42, 5, FALSE, DATE_SUB(NOW(), INTERVAL 4 DAY), NOW()),
(43, 5, FALSE, DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),

-- Miguel (user 6) - sus 9 tareas
(44, 6, TRUE, DATE_SUB(NOW(), INTERVAL 33 DAY), DATE_SUB(NOW(), INTERVAL 24 DAY)),
(45, 6, TRUE, DATE_SUB(NOW(), INTERVAL 28 DAY), DATE_SUB(NOW(), INTERVAL 18 DAY)),
(46, 6, TRUE, DATE_SUB(NOW(), INTERVAL 22 DAY), DATE_SUB(NOW(), INTERVAL 14 DAY)),
(47, 6, FALSE, DATE_SUB(NOW(), INTERVAL 14 DAY), NOW()),
(48, 6, FALSE, DATE_SUB(NOW(), INTERVAL 9 DAY), NOW()),
(49, 6, FALSE, DATE_SUB(NOW(), INTERVAL 6 DAY), NOW()),
(50, 6, FALSE, DATE_SUB(NOW(), INTERVAL 4 DAY), NOW()),
(51, 6, FALSE, DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
(52, 6, FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),

-- Sofía (user 7) - sus 11 tareas
(53, 7, TRUE, DATE_SUB(NOW(), INTERVAL 38 DAY), DATE_SUB(NOW(), INTERVAL 28 DAY)),
(54, 7, TRUE, DATE_SUB(NOW(), INTERVAL 34 DAY), DATE_SUB(NOW(), INTERVAL 24 DAY)),
(55, 7, TRUE, DATE_SUB(NOW(), INTERVAL 28 DAY), DATE_SUB(NOW(), INTERVAL 18 DAY)),
(56, 7, FALSE, DATE_SUB(NOW(), INTERVAL 18 DAY), NOW()),
(57, 7, FALSE, DATE_SUB(NOW(), INTERVAL 12 DAY), NOW()),
(58, 7, FALSE, DATE_SUB(NOW(), INTERVAL 8 DAY), NOW()),
(59, 7, FALSE, DATE_SUB(NOW(), INTERVAL 5 DAY), NOW()),
(60, 7, FALSE, DATE_SUB(NOW(), INTERVAL 4 DAY), NOW()),
(61, 7, FALSE, DATE_SUB(NOW(), INTERVAL 3 DAY), NOW()),
(62, 7, FALSE, DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
(63, 7, FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),

-- Fernando (user 8) - sus 5 tareas
(64, 8, TRUE, DATE_SUB(NOW(), INTERVAL 42 DAY), DATE_SUB(NOW(), INTERVAL 32 DAY)),
(65, 8, TRUE, DATE_SUB(NOW(), INTERVAL 36 DAY), DATE_SUB(NOW(), INTERVAL 26 DAY)),
(66, 8, FALSE, DATE_SUB(NOW(), INTERVAL 20 DAY), NOW()),
(67, 8, FALSE, DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),
(68, 8, FALSE, DATE_SUB(NOW(), INTERVAL 5 DAY), NOW()),

-- Valentina (user 9) - sus 13 tareas
(69, 9, TRUE, DATE_SUB(NOW(), INTERVAL 40 DAY), DATE_SUB(NOW(), INTERVAL 30 DAY)),
(70, 9, TRUE, DATE_SUB(NOW(), INTERVAL 36 DAY), DATE_SUB(NOW(), INTERVAL 26 DAY)),
(71, 9, TRUE, DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY)),
(72, 9, TRUE, DATE_SUB(NOW(), INTERVAL 24 DAY), DATE_SUB(NOW(), INTERVAL 16 DAY)),
(73, 9, FALSE, DATE_SUB(NOW(), INTERVAL 16 DAY), NOW()),
(74, 9, FALSE, DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),
(75, 9, FALSE, DATE_SUB(NOW(), INTERVAL 7 DAY), NOW()),
(76, 9, FALSE, DATE_SUB(NOW(), INTERVAL 5 DAY), NOW()),
(77, 9, FALSE, DATE_SUB(NOW(), INTERVAL 4 DAY), NOW()),
(78, 9, FALSE, DATE_SUB(NOW(), INTERVAL 3 DAY), NOW()),
(79, 9, FALSE, DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
(80, 9, FALSE, DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
(81, 9, FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),

-- Roberto (user 10) - sus 8 tareas
(82, 10, TRUE, DATE_SUB(NOW(), INTERVAL 32 DAY), DATE_SUB(NOW(), INTERVAL 22 DAY)),
(83, 10, TRUE, DATE_SUB(NOW(), INTERVAL 26 DAY), DATE_SUB(NOW(), INTERVAL 16 DAY)),
(84, 10, FALSE, DATE_SUB(NOW(), INTERVAL 18 DAY), NOW()),
(85, 10, FALSE, DATE_SUB(NOW(), INTERVAL 12 DAY), NOW()),
(86, 10, FALSE, DATE_SUB(NOW(), INTERVAL 7 DAY), NOW()),
(87, 10, FALSE, DATE_SUB(NOW(), INTERVAL 4 DAY), NOW()),
(88, 10, FALSE, DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
(89, 10, FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),

-- Asignaciones cruzadas (algunos usuarios en tareas de otros)
(1, 2, TRUE, DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_SUB(NOW(), INTERVAL 25 DAY)),  -- Juan en tarea de María
(3, 3, FALSE, DATE_SUB(NOW(), INTERVAL 15 DAY), NOW()),  -- Ana en tarea de María
(9, 1, TRUE, DATE_SUB(NOW(), INTERVAL 35 DAY), DATE_SUB(NOW(), INTERVAL 28 DAY)),  -- María en tarea de Juan
(13, 5, FALSE, DATE_SUB(NOW(), INTERVAL 12 DAY), NOW()),  -- Laura en tarea de Juan
(26, 6, TRUE, DATE_SUB(NOW(), INTERVAL 45 DAY), DATE_SUB(NOW(), INTERVAL 35 DAY)),  -- Miguel en tarea de Carlos
(32, 7, FALSE, DATE_SUB(NOW(), INTERVAL 15 DAY), NOW()),  -- Sofía en tarea de Carlos
(44, 8, TRUE, DATE_SUB(NOW(), INTERVAL 33 DAY), DATE_SUB(NOW(), INTERVAL 24 DAY)),  -- Fernando en tarea de Miguel
(53, 9, TRUE, DATE_SUB(NOW(), INTERVAL 38 DAY), DATE_SUB(NOW(), INTERVAL 28 DAY)),  -- Valentina en tarea de Sofía
(69, 10, TRUE, DATE_SUB(NOW(), INTERVAL 40 DAY), DATE_SUB(NOW(), INTERVAL 30 DAY));  -- Roberto en tarea de Valentina

-- ============================================
-- NOTIFICATIONS (para tareas archivadas)
-- ============================================
INSERT INTO notifications (task_id, attempt, http_status, payload, created_at) VALUES
-- Tarea 1 (archivada)
(1, 1, 200, '{"taskId": 1, "title": "Diseñar mockups del dashboard", "archivedAt": "2025-07-29T20:00:00Z"}', DATE_SUB(NOW(), INTERVAL 25 DAY)),
-- Tarea 2 (archivada)
(2, 1, 200, '{"taskId": 2, "title": "Configurar entorno de desarrollo", "archivedAt": "2025-08-03T20:00:00Z"}', DATE_SUB(NOW(), INTERVAL 20 DAY)),
-- Tarea 9 (archivada) - falló primer intento
(9, 1, 500, '{"taskId": 9, "title": "Migrar base de datos a PostgreSQL", "archivedAt": "2025-07-26T20:00:00Z"}', DATE_SUB(NOW(), INTERVAL 28 DAY)),
(9, 2, 200, '{"taskId": 9, "title": "Migrar base de datos a PostgreSQL", "archivedAt": "2025-07-26T20:00:00Z"}', DATE_SUB(NOW(), INTERVAL 28 DAY) + INTERVAL 1 SECOND),
-- Tarea 10 (archivada)
(10, 1, 200, '{"taskId": 10, "title": "Implementar sistema de notificaciones", "archivedAt": "2025-08-01T20:00:00Z"}', DATE_SUB(NOW(), INTERVAL 22 DAY)),
-- Tarea 19 (archivada) - falló dos intentos
(19, 1, 500, '{"taskId": 19, "title": "Diseñar flujo de checkout", "archivedAt": "2025-07-24T20:00:00Z"}', DATE_SUB(NOW(), INTERVAL 30 DAY)),
(19, 2, 503, '{"taskId": 19, "title": "Diseñar flujo de checkout", "archivedAt": "2025-07-24T20:00:00Z"}', DATE_SUB(NOW(), INTERVAL 30 DAY) + INTERVAL 3 SECOND),
(19, 3, 200, '{"taskId": 19, "title": "Diseñar flujo de checkout", "archivedAt": "2025-07-24T20:00:00Z"}', DATE_SUB(NOW(), INTERVAL 30 DAY) + INTERVAL 13 SECOND),
-- Tarea 26 (archivada)
(26, 1, 200, '{"taskId": 26, "title": "Configurar monitoreo con Datadog", "archivedAt": "2025-07-19T20:00:00Z"}', DATE_SUB(NOW(), INTERVAL 35 DAY)),
-- Tarea 38 (archivada)
(38, 1, 200, '{"taskId": 38, "title": "Implementar autenticación OAuth", "archivedAt": "2025-08-05T20:00:00Z"}', DATE_SUB(NOW(), INTERVAL 20 DAY)),
-- Tarea 44 (archivada)
(44, 1, 200, '{"taskId": 44, "title": "Implementar tests E2E con Playwright", "archivedAt": "2025-07-30T20:00:00Z"}', DATE_SUB(NOW(), INTERVAL 24 DAY)),
-- Tarea 53 (archivada)
(53, 1, 200, '{"taskId": 53, "title": "Diseñar sistema de templates", "archivedAt": "2025-07-26T20:00:00Z"}', DATE_SUB(NOW(), INTERVAL 28 DAY)),
-- Tarea 64 (archivada)
(64, 1, 200, '{"taskId": 64, "title": "Implementar WebSocket server", "archivedAt": "2025-07-22T20:00:00Z"}', DATE_SUB(NOW(), INTERVAL 32 DAY)),
-- Tarea 69 (archivada)
(69, 1, 200, '{"taskId": 69, "title": "Implementar módulo de reportes", "archivedAt": "2025-07-24T20:00:00Z"}', DATE_SUB(NOW(), INTERVAL 30 DAY)),
-- Tarea 82 (archivada)
(82, 1, 200, '{"taskId": 82, "title": "Implementar validación de formularios", "archivedAt": "2025-08-01T20:00:00Z"}', DATE_SUB(NOW(), INTERVAL 22 DAY));

-- ============================================
-- IDEMPOTENCY_KEYS (algunas keys de ejemplo)
-- ============================================
INSERT INTO idempotency_keys (`key`, response, status_code, created_at) VALUES
('idem-create-user-001', '{"id":1,"name":"María","lastName":"García López","email":"maria.garcia@correo.com","createdAt":"2025-07-24T20:00:00Z"}', 201, DATE_SUB(NOW(), INTERVAL 30 DAY)),
('idem-create-user-002', '{"id":2,"name":"Juan","lastName":"Hernández Ruiz","email":"juan.hernandez@correo.com","createdAt":"2025-07-24T20:00:00Z"}', 201, DATE_SUB(NOW(), INTERVAL 30 DAY)),
('idem-create-task-001', '{"id":1,"title":"Diseñar mockups del dashboard","description":"Crear los mockups en Figma para el panel principal","status":"open","createdAt":"2025-07-24T20:00:00Z"}', 201, DATE_SUB(NOW(), INTERVAL 30 DAY)),
('idem-assign-task-001', '{"message":"Task assigned successfully"}', 200, DATE_SUB(NOW(), INTERVAL 30 DAY)),
('idem-complete-task-001', '{"message":"Task completion recorded"}', 200, DATE_SUB(NOW(), INTERVAL 25 DAY));
