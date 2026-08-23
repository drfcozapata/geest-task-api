import { Request, Response, NextFunction } from 'express';
import { getPool } from '../config/database';
import { logger } from '../utils/logger';

export const idempotencyMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const idempotencyKey = req.headers['idempotency-key'] as string;

  if (!idempotencyKey) {
    return next();
  }

  const pool = getPool();

  try {
    const [existing] = await pool.query(
      'SELECT response, status_code FROM idempotency_keys WHERE `key` = ? FOR UPDATE',
      [idempotencyKey]
    );

    const rows = existing as any[];
    if (rows.length > 0) {
      logger.info(`Idempotent request detected for key: ${idempotencyKey}`);
      return res.status(rows[0].status_code).json(rows[0].response);
    }

    const originalJson = res.json.bind(res);
    let responseSent = false;

    res.json = function (body: any) {
      if (!responseSent) {
        responseSent = true;
        pool.query(
          'INSERT INTO idempotency_keys (`key`, response, status_code) VALUES (?, ?, ?)',
          [idempotencyKey, JSON.stringify(body), res.statusCode]
        ).catch((error) => {
          logger.error('Failed to store idempotency key:', error);
        });
      }
      return originalJson(body);
    };

    next();
  } catch (error) {
    logger.error('Idempotency middleware error:', error);
    next();
  }
};
