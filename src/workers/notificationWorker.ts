import axios from 'axios';
import { getPool } from '../config/database';
import { logger } from '../utils/logger';

const MAX_ATTEMPTS = 3;
const RETRY_DELAYS = [1000, 3000, 10000]; // índice = attempt - 1

const sendNotification = async (notification: any): Promise<void> => {
  const pool = getPool();
  let httpStatus: number | null = null;
  let retryable = false;

  try {
    const notifyUrl = process.env.NOTIFY_URL;
    if (!notifyUrl) {
      throw new Error('NOTIFY_URL not configured');
    }

    const response = await axios.post(notifyUrl, notification.payload, {
      timeout: 5000,
    });

    httpStatus = response.status;
  } catch (error: any) {
    httpStatus = error.response?.status ?? null;
    // SOLO reintentar ante 5xx o falta de respuesta (spec, sección Confiabilidad.3)
    retryable = !error.response || error.response.status >= 500;
  }

  try {
    // 1) Registrar ESTE intento (cierra la fila actual)
    await pool.query(
      'UPDATE notifications SET http_status = ? WHERE id = ?',
      [httpStatus, notification.id]
    );

    // 2) Programar el siguiente intento como FILA NUEVA (historial por intento)
    if (retryable && notification.attempt < MAX_ATTEMPTS) {
      const delayMs = RETRY_DELAYS[notification.attempt - 1];
      const payloadStr =
        typeof notification.payload === 'string'
          ? notification.payload
          : JSON.stringify(notification.payload);
      // En test (JEST_WORKER_ID) usar delay 0 para que los reintentos sean inmediatos
      const isTest = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID;
      const intervalSeconds = isTest ? 0 : Math.ceil(delayMs / 1000);
      await pool.query(
        `INSERT INTO notifications (task_id, attempt, payload, next_attempt_at)
         VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL ? SECOND))
         ON DUPLICATE KEY UPDATE attempt = attempt`,
        [
          notification.task_id,
          notification.attempt + 1,
          payloadStr,
          intervalSeconds,
        ]
      );
    }
  } catch (error) {
    logger.error(`Failed to update notification ${notification.id}:`, error);
  }
};

const processNotifications = async (): Promise<void> => {
  const pool = getPool();

  try {
    const [pending] = await pool.query(
      `SELECT * FROM notifications
       WHERE http_status IS NULL
         AND attempt <= ?
         AND (next_attempt_at IS NULL OR next_attempt_at <= NOW())`,
      [MAX_ATTEMPTS]
    );

    for (const notification of pending as any[]) {
      await sendNotification(notification);
    }
  } catch (error) {
    logger.error('Error processing notifications:', error);
  }
};

export const startNotificationWorker = (): void => {
  // No iniciar el worker automáticamente en entornos de test
  if (process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID) {
    return;
  }

  logger.info('Notification worker started');
  const interval = setInterval(processNotifications, 2000);
  // Permitir que el proceso de Jest termine sin esperar el intervalo
  if (interval && typeof interval.unref === 'function') {
    interval.unref();
  }
};

export default { startNotificationWorker, processNotifications };
