import dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(__dirname, '../../.env') });
import { getPool } from '../config/database';
import { logger } from '../utils/logger';

const SEED_DATA = {
  users: [
    ['María', 'García López', 'maria.garcia@correo.com'],
    ['Juan', 'Hernández Ruiz', 'juan.hernandez@correo.com'],
    ['Ana', 'Martínez Sánchez', 'ana.martinez@correo.com'],
    ['Carlos', 'Rodríguez Fernández', 'carlos.rodriguez@correo.com'],
    ['Laura', 'López García', 'laura.lopez@correo.com'],
    ['Miguel', 'Torres Ramírez', 'miguel.torres@correo.com'],
    ['Sofía', 'Díaz Morales', 'sofia.diaz@correo.com'],
    ['Fernando', 'Vargas Orozco', 'fer.vargas@correo.com'],
    ['Valentina', 'Moreno Castillo', 'valentina.moreno@correo.com'],
    ['Roberto', 'Jiménez Aguilar', 'roberto.jimenez@correo.com'],
  ],
  tasks: [
    ['Diseñar mockups del dashboard', 'Crear los mockups en Figma para el panel principal', 'archived'],
    ['Configurar entorno de desarrollo', 'Instalar Docker, Node.js y configurar la BD local', 'archived'],
    ['Revisar documentación de la API', 'Validar que la documentación Swagger esté actualizada', 'open'],
    ['Crear endpoint de autenticación', 'Implementar login con JWT', 'open'],
    ['Optimizar consultas SQL', 'Revisar queries lentas en el dashboard', 'open'],
    ['Implementar cache Redis', 'Agregar cache para consultas frecuentes', 'open'],
    ['Escribir tests de integración', 'Tests para los endpoints críticos', 'open'],
    ['Code review del módulo de pagos', 'Revisar PR #42 del sistema de pagos', 'open'],
    ['Migrar base de datos a PostgreSQL', 'Planificar migración desde MySQL', 'archived'],
    ['Implementar sistema de notificaciones', 'Notificaciones push y por email', 'archived'],
    ['Crear dashboard de métricas', 'Panel con gráficas de uso del sistema', 'archived'],
    ['Configurar CI/CD con GitHub Actions', 'Pipeline de build, test y deploy', 'archived'],
    ['Refactorizar módulo de usuarios', 'Mejorar la estructura del código', 'open'],
    ['Implementar paginación', 'Agregar paginación a todos los endpoints GET', 'open'],
    ['Crear endpoint de reportes', 'API para generar reportes en PDF', 'open'],
    ['Configurar logging centralizado', 'Implementar ELK stack o similar', 'open'],
    ['Revisar seguridad de endpoints', 'Auditar permisos y rate limiting', 'open'],
    ['Documentar proceso de deploy', 'Guía paso a paso para nuevos desarrolladores', 'open'],
    ['Diseñar flujo de checkout', 'Wireframes del proceso de compra', 'archived'],
    ['Implementar carrito de compras', 'Carrito con persistencia en BD', 'archived'],
    ['Crear sistema de valoraciones', 'Los usuarios pueden calificar productos', 'open'],
    ['Integrar pasarela de pagos', 'Conectar con Stripe o Conekta', 'open'],
    ['Implementar búsqueda avanzada', 'Filtros por categoría, precio, etc.', 'open'],
    ['Crear módulo de cupones', 'Sistema de descuentos y promociones', 'open'],
    ['Optimizar imágenes de productos', 'Implementar lazy loading y compresión', 'open'],
    ['Configurar monitoreo con Datadog', 'Métricas de rendimiento y alertas', 'archived'],
    ['Implementar CDN para assets', 'Configurar CloudFront o similar', 'archived'],
    ['Crear microservicio de archivos', 'Servicio para upload y gestión de archivos', 'archived'],
    ['Migrar a TypeScript', 'Convertir el proyecto principal a TS', 'archived'],
    ['Implementar WebSocket', 'Tiempo real para chat y notificaciones', 'archived'],
    ['Configurar Docker Compose', 'Ambiente completo con servicios', 'archived'],
    ['Crear API gateway', 'Proxy reverso y routing', 'open'],
    ['Implementar circuit breaker', 'Patrón de resiliencia para servicios externos', 'open'],
    ['Configurar load balancer', 'Distribución de tráfico entre instancias', 'open'],
    ['Implementar cola de mensajes', 'RabbitMQ o Redis Streams', 'open'],
    ['Crear health check endpoint', 'Endpoint para verificar estado del servicio', 'open'],
    ['Documentar arquitectura', 'Diagrama de componentes y flujo de datos', 'open'],
    ['Implementar autenticación OAuth', 'Login con Google y Facebook', 'archived'],
    ['Crear sistema de roles y permisos', 'RBAC para el panel de administración', 'archived'],
    ['Implementar dos factores (2FA)', 'Autenticación reforzada de seguridad', 'open'],
    ['Crear dashboard de admin', 'Panel de control para administradores', 'open'],
    ['Implementar auditoría de acciones', 'Log de quién hizo qué y cuándo', 'open'],
    ['Configurar backup automático', 'Backups diarios de la base de datos', 'open'],
    ['Implementar tests E2E con Playwright', 'Tests end-to-end del flujo principal', 'archived'],
    ['Configurar Jest con coverage', 'Mínimo 80% de cobertura', 'archived'],
    ['Crear fixtures de testing', 'Datos de prueba reutilizables', 'archived'],
    ['Implementar mock server', 'Servidor mock para tests aislados', 'open'],
    ['Escribir tests de rendimiento', 'Pruebas de carga con k6 o Artillery', 'open'],
    ['Configurar test en CI', 'Ejecutar tests en cada PR', 'open'],
    ['Crear test de regresión', 'Suite para funcionalidad crítica', 'open'],
    ['Implementar visual regression', 'Comparar screenshots entre versiones', 'open'],
    ['Documentar estrategia de testing', 'Guía de mejores prácticas', 'open'],
    ['Diseñar sistema de templates', 'Templates reutilizables para emails', 'archived'],
    ['Implementar envío de emails', 'Integración con SendGrid o SES', 'archived'],
    ['Crear editor de emails', 'Editor visual tipo drag and drop', 'archived'],
    ['Implementar analytics de emails', 'Tracking de aperturas y clics', 'open'],
    ['Crear template de bienvenida', 'Email automático al registrarse', 'open'],
    ['Implementar newsletters', 'Envío masivo con segmentación', 'open'],
    ['Crear template de recuperación', 'Email para recuperar contraseña', 'open'],
    ['Implementar cola de envío', 'Queue para emails masivos', 'open'],
    ['Configurar dominio de envío', 'SPF, DKIM, DMARC', 'open'],
    ['Crear dashboard de métricas email', 'Estadísticas de envíos', 'open'],
    ['Documentar API de emails', 'Guía para otros desarrolladores', 'open'],
    ['Implementar WebSocket server', 'Servidor para comunicación en tiempo real', 'archived'],
    ['Crear sistema de chat', 'Chat en tiempo real entre usuarios', 'archived'],
    ['Implementar typing indicators', 'Indicador de "escribiendo..."', 'open'],
    ['Crear sistema de mensajes offline', 'Cola de mensajes cuando no hay conexión', 'open'],
    ['Implementar push notifications', 'Notificaciones push del navegador', 'open'],
    ['Implementar módulo de reportes', 'Generación de reportes en PDF y Excel', 'archived'],
    ['Crear gráficas con Chart.js', 'Visualización de datos del dashboard', 'archived'],
    ['Implementar exportación CSV', 'Exportar datos tabulares', 'archived'],
    ['Crear reporte de ventas', 'Reporte mensual con filtros', 'archived'],
    ['Implementar programación de reportes', 'Envío automático por email', 'open'],
    ['Crear dashboard ejecutivo', 'Resumen para directivos', 'open'],
    ['Implementar drill-down', 'Navegación detallada en gráficas', 'open'],
    ['Crear template de reportes', 'Plantillas reutilizables', 'open'],
    ['Implementar comparativas', 'Comparar períodos', 'open'],
    ['Configurar cache de reportes', 'Redis para reportes frecuentes', 'open'],
    ['Implementar alertas', 'Notificaciones cuando hay anomalías', 'open'],
    ['Crear API de reportes', 'Endpoints para reportes programáticos', 'open'],
    ['Documentar módulo de reportes', 'Guía de uso y API', 'open'],
    ['Implementar validación de formularios', 'Validación client y server side', 'archived'],
    ['Crear componente de tabla', 'Tabla reutilizable con sorting y filtros', 'archived'],
    ['Implementar formularios multi-paso', 'Wizard para formularios largos', 'open'],
    ['Crear librería de componentes', 'Componentes UI compartidos', 'open'],
    ['Implementar dark mode', 'Tema oscuro para la aplicación', 'open'],
    ['Crear sistema de notificaciones UI', 'Toasts y banners in-app', 'open'],
    ['Implementar accesibilidad', 'WCAG 2.1 AA compliance', 'open'],
    ['Documentar librería de componentes', 'Storybook o documentación similar', 'open'],
  ],
  assignments: [
    [1, 1, true], [2, 1, true], [3, 1, false], [4, 1, false], [5, 1, false],
    [6, 1, false], [7, 1, false], [8, 1, false],
    [9, 2, true], [10, 2, true], [11, 2, true], [12, 2, true], [13, 2, false],
    [14, 2, false], [15, 2, false], [16, 2, false], [17, 2, false], [18, 2, false],
    [19, 3, true], [20, 3, true], [21, 3, false], [22, 3, false], [23, 3, false],
    [24, 3, false], [25, 3, false],
    [26, 4, true], [27, 4, true], [28, 4, true], [29, 4, true], [30, 4, true],
    [31, 4, true], [32, 4, false], [33, 4, false], [34, 4, false], [35, 4, false],
    [36, 4, false], [37, 4, false],
    [38, 5, true], [39, 5, true], [40, 5, false], [41, 5, false], [42, 5, false],
    [43, 5, false],
    [44, 6, true], [45, 6, true], [46, 6, true], [47, 6, false], [48, 6, false],
    [49, 6, false], [50, 6, false], [51, 6, false], [52, 6, false],
    [53, 7, true], [54, 7, true], [55, 7, true], [56, 7, false], [57, 7, false],
    [58, 7, false], [59, 7, false], [60, 7, false], [61, 7, false], [62, 7, false],
    [63, 7, false],
    [64, 8, true], [65, 8, true], [66, 8, false], [67, 8, false], [68, 8, false],
    [69, 9, true], [70, 9, true], [71, 9, true], [72, 9, true], [73, 9, false],
    [74, 9, false], [75, 9, false], [76, 9, false], [77, 9, false], [78, 9, false],
    [79, 9, false], [80, 9, false], [81, 9, false],
    [82, 10, true], [83, 10, true], [84, 10, false], [85, 10, false], [86, 10, false],
    [87, 10, false], [88, 10, false], [89, 10, false],
    [1, 2, true], [3, 3, false], [9, 1, true], [13, 5, false], [26, 6, true],
    [32, 7, false], [44, 8, true], [53, 9, true], [69, 10, true],
  ],
};

async function checkAndSeed(force: boolean = false): Promise<boolean> {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL');
    const count = (rows as any[])[0].count;

    if (count >= 10 && !force) {
      logger.info(`Database already has ${count} users - skipping seed`);
      connection.release();
      return false;
    }

    if (force) {
      logger.info('Force seed requested - clearing and re-seeding...');
    } else {
      logger.info(`Database has only ${count} users - running seed...`);
    }

    await connection.beginTransaction();

    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE idempotency_keys');
    await connection.query('TRUNCATE TABLE notifications');
    await connection.query('TRUNCATE TABLE task_assignments');
    await connection.query('TRUNCATE TABLE tasks');
    await connection.query('TRUNCATE TABLE users');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    for (const [name, lastName, email] of SEED_DATA.users) {
      await connection.query(
        'INSERT INTO users (name, last_name, email, created_at) VALUES (?, ?, ?, NOW())',
        [name, lastName, email]
      );
    }
    logger.info(`Inserted ${SEED_DATA.users.length} users`);

    const taskValues = SEED_DATA.tasks.map(([title, description, status]) =>
      [title, description, status]
    );
    await connection.query(
      'INSERT INTO tasks (title, description, status, created_at, updated_at) VALUES ' +
      SEED_DATA.tasks.map(() => '(?, ?, ?, DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 30) DAY), NOW())').join(', '),
      taskValues.flat()
    );
    logger.info(`Inserted ${SEED_DATA.tasks.length} tasks`);

    const assignmentValues = SEED_DATA.assignments.map(([taskId, userId, completed]) =>
      [taskId, userId, completed]
    );
    await connection.query(
      'INSERT IGNORE INTO task_assignments (task_id, user_id, completed, created_at, updated_at) VALUES ' +
      SEED_DATA.assignments.map(() => '(?, ?, ?, DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 30) DAY), NOW())').join(', '),
      assignmentValues.flat()
    );
    logger.info(`Inserted ${SEED_DATA.assignments.length} task assignments`);

    const notifications = [
      [1, 1, 200, '{"taskId": 1, "title": "Diseñar mockups del dashboard", "archivedAt": "2025-07-29T20:00:00Z"}'],
      [2, 1, 200, '{"taskId": 2, "title": "Configurar entorno de desarrollo", "archivedAt": "2025-08-03T20:00:00Z"}'],
      [9, 1, 500, '{"taskId": 9, "title": "Migrar base de datos a PostgreSQL", "archivedAt": "2025-07-26T20:00:00Z"}'],
      [9, 2, 200, '{"taskId": 9, "title": "Migrar base de datos a PostgreSQL", "archivedAt": "2025-07-26T20:00:00Z"}'],
      [10, 1, 200, '{"taskId": 10, "title": "Implementar sistema de notificaciones", "archivedAt": "2025-08-01T20:00:00Z"}'],
      [19, 1, 500, '{"taskId": 19, "title": "Diseñar flujo de checkout", "archivedAt": "2025-07-24T20:00:00Z"}'],
      [19, 2, 503, '{"taskId": 19, "title": "Diseñar flujo de checkout", "archivedAt": "2025-07-24T20:00:00Z"}'],
      [19, 3, 200, '{"taskId": 19, "title": "Diseñar flujo de checkout", "archivedAt": "2025-07-24T20:00:00Z"}'],
      [26, 1, 200, '{"taskId": 26, "title": "Configurar monitoreo con Datadog", "archivedAt": "2025-07-19T20:00:00Z"}'],
      [38, 1, 200, '{"taskId": 38, "title": "Implementar autenticación OAuth", "archivedAt": "2025-08-05T20:00:00Z"}'],
      [44, 1, 200, '{"taskId": 44, "title": "Implementar tests E2E con Playwright", "archivedAt": "2025-07-30T20:00:00Z"}'],
      [53, 1, 200, '{"taskId": 53, "title": "Diseñar sistema de templates", "archivedAt": "2025-07-26T20:00:00Z"}'],
      [64, 1, 200, '{"taskId": 64, "title": "Implementar WebSocket server", "archivedAt": "2025-07-22T20:00:00Z"}'],
      [69, 1, 200, '{"taskId": 69, "title": "Implementar módulo de reportes", "archivedAt": "2025-07-24T20:00:00Z"}'],
      [82, 1, 200, '{"taskId": 82, "title": "Implementar validación de formularios", "archivedAt": "2025-08-01T20:00:00Z"}'],
    ];

    const notifValues = notifications.map(([taskId, attempt, httpStatus, payload]) =>
      [taskId, attempt, httpStatus, payload]
    );
    await connection.query(
      'INSERT INTO notifications (task_id, attempt, http_status, payload, created_at) VALUES ' +
      notifications.map(() => '(?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 30) DAY))').join(', '),
      notifValues.flat()
    );
    logger.info(`Inserted ${notifications.length} notifications`);

    await connection.commit();
    connection.release();
    logger.info('Database seeded successfully!');
    return true;
  } catch (error) {
    await connection.rollback();
    connection.release();
    logger.error('Seed failed:', error);
    throw error;
  }
}

export { checkAndSeed };

if (require.main === module) {
  const force = process.argv.includes('--force');
  checkAndSeed(force)
    .then((seeded) => {
      process.exit(seeded ? 0 : 1);
    })
    .catch(() => {
      process.exit(1);
    });
}
