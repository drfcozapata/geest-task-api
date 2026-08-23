import axios from 'axios';
import { getPool } from '../config/database';
import { logger } from '../utils/logger';

const MAX_ATTEMPTS = 3;
const RETRY_DELAYS = [1000, 3000, 10000];

const sendNotification = async (notification: any): Promise<void> => {
  const pool = getPool();

  try {
    const notifyUrl = process.env.NOTIFY_URL;
    if (!notifyUrl) {
      await pool.query(
        'UPDATE notifications SET http_status = 500 WHERE id = ?',
        [notification.id]
      );
      logger.warn(`No NOTIFY_URL configured. Notification ${notification.id} marked as failed.`);
      return;
    }

    const response = await axios.post(notifyUrl, notification.payload, {
      timeout: 5000,
    });

    await pool.query(
      'UPDATE notifications SET http_status = ? WHERE id = ?',
      [response.status, notification.id]
    );

    logger.info(`Notification ${notification.id} sent successfully (attempt ${notification.attempt})`);
  } catch (error: any) {
    const httpStatus = error.response?.status || 500;

    await pool.query(
      'UPDATE notifications SET http_status = ? WHERE id = ?',
      [httpStatus, notification.id]
    );

    logger.error(`Notification ${notification.id} failed (attempt ${notification.attempt}): ${error.message}`);
  }
};

const processNotifications = async (): Promise<void> => {
  const pool = getPool();

  try {
    const [pending] = await pool.query(
      'SELECT * FROM notifications WHERE http_status IS NULL AND attempt < ?',
      [MAX_ATTEMPTS + 1]
    );

    for (const notification of pending as any[]) {
      await sendNotification(notification);

      if (notification.attempt < MAX_ATTEMPTS) {
        await pool.query(
          'UPDATE notifications SET attempt = attempt + 1 WHERE id = ?',
          [notification.id]
        );
      }
    }
  } catch (error) {
    logger.error('Error processing notifications:', error);
  }
};

export const startNotificationWorker = (): void => {
  logger.info('Notification worker started');
  setInterval(processNotifications, 2000);
};

export default { startNotificationWorker, processNotifications };
