import express from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { connectDB, getPool } from './config/database';
import { idempotencyMiddleware } from './middleware/idempotency';
import { errorHandler } from './middleware/errorHandler';
import { startNotificationWorker } from './workers/notificationWorker';
import { logger } from './utils/logger';
import usersRouter from './routes/users';
import tasksRouter from './routes/tasks';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Idempotencia en POST de ambos prefijos
app.use('/api/v1', idempotencyMiddleware);
app.use('/', idempotencyMiddleware);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/docs.json', (req, res) => {
  res.json(swaggerSpec);
});

app.get('/health', async (req, res) => {
  try {
    const pool = getPool();
    await pool.query('SELECT 1');
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: 'Database connection failed' });
  }
});

app.use('/api/v1/users', usersRouter);
app.use('/api/v1/tasks', tasksRouter);
app.use('/users', usersRouter);
app.use('/tasks', tasksRouter);

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    startNotificationWorker();

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Swagger docs available at http://localhost:${PORT}/docs`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Solo arrancamos el servidor real (listen + connectDB + worker) cuando este
// archivo se ejecuta directamente (`node dist/app.js` / `tsx src/app.ts`).
// Cuando los tests hacen `import app from '../src/app'` para pasárselo a
// supertest, este bloque NO corre: supertest no necesita un socket real
// escuchando, y evitamos que cada test file deje un listener y un
// startNotificationWorker() colgados que Jest nunca ve cerrar.
if (require.main === module) {
  startServer();
}

export default app;
