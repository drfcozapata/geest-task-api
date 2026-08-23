import express from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { connectDB } from './config/database';
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
    const { getPool } = require('./config/database');
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

startServer();

export default app;
