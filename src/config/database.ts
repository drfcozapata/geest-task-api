import mysql from 'mysql2/promise';
import { logger } from '../utils/logger';

let pool: mysql.Pool | null = null;

function createPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'geest_task_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    });
  }
  return pool;
}

export const connectDB = async (): Promise<void> => {
  try {
    const p = createPool();
    const connection = await p.getConnection();
    logger.info('Database connected successfully');
    connection.release();
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
};

export const getPool = () => createPool();

export default createPool;
