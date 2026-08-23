import { Request, Response, NextFunction } from 'express';
import { getPool } from '../config/database';
import { logger } from '../utils/logger';

export const idempotencyMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const idempotencyKey = req.headers['idempotency-key'] as string;

  if (!idempotencyKey || req.method !== 'POST') {
    return next();
  }

  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [existing] = await connection.query(
      'SELECT response, status_code FROM idempotency_keys WHERE `key` = ? FOR UPDATE',
      [idempotencyKey]
    );

    const rows = existing as any[];

    // Ya completada anteriormente → replay idéntico
    if (rows.length > 0 && rows[0].response !== null) {
      await connection.commit();
      connection.release();
      return res.status(rows[0].status_code).json(rows[0].response);
    }

    // No existe → reservar YA (dentro de la tx). Un request paralelo con la misma
    // key bloqueará aquí en el FOR UPDATE / chocará con la PK hasta que terminemos.
    if (rows.length === 0) {
      await connection.query(
        'INSERT INTO idempotency_keys (`key`, response, status_code) VALUES (?, NULL, 0)',
        [idempotencyKey]
      );
    }

    await connection.commit(); // la reserva queda visible para todos
    connection.release();
  } catch (error: any) {
    connection.release();
    // Deadlock o duplicate key: otro request ganó la carrera. Reintentar lectura.
    const retryableCodes = ['ER_DUP_ENTRY', 'ER_LOCK_DEADLOCK'];
    if (retryableCodes.includes(error.code)) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      try {
        const [retry] = await pool.query(
          'SELECT response, status_code FROM idempotency_keys WHERE `key` = ?',
          [idempotencyKey]
        );
        const retryRows = retry as any[];
        if (retryRows.length > 0 && retryRows[0].response !== null) {
          return res.status(retryRows[0].status_code).json(retryRows[0].response);
        }
      } catch (e) {
        logger.error('Idempotency retry read error:', e);
      }
    }
    logger.error('Idempotency middleware error:', error);
    return next();
  }

  // El handler corre; al responder se hace UPDATE (ya existe la fila)
  const originalJson = res.json.bind(res);
  res.json = function (body: any) {
    pool.query(
      'UPDATE idempotency_keys SET response = ?, status_code = ? WHERE `key` = ?',
      [JSON.stringify(body), res.statusCode, idempotencyKey]
    ).catch((err) => {
      logger.error('Failed to store idempotent response:', err);
    });
    return originalJson(body);
  };

  next();
};
