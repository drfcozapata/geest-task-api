import request from 'supertest';
import app from '../src/app';
import { getPool } from '../src/config/database';

describe('Idempotency', () => {
  beforeAll(async () => {
    const pool = getPool();
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    await pool.query('TRUNCATE TABLE idempotency_keys');
    await pool.query('TRUNCATE TABLE notifications');
    await pool.query('TRUNCATE TABLE task_assignments');
    await pool.query('TRUNCATE TABLE tasks');
    await pool.query('TRUNCATE TABLE users');
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');
  });

  it('should return same response for same idempotency key', async () => {
    const idempotencyKey = 'test-key-123';

    const res1 = await request(app)
      .post('/api/v1/users')
      .set('Idempotency-Key', idempotencyKey)
      .send({
        name: 'Idempotent',
        lastName: 'User',
        email: 'idempotent@example.com',
      });

    const res2 = await request(app)
      .post('/api/v1/users')
      .set('Idempotency-Key', idempotencyKey)
      .send({
        name: 'Idempotent',
        lastName: 'User',
        email: 'idempotent@example.com',
      });

    expect(res1.status).toBe(201);
    expect(res2.status).toBe(201);
    expect(res1.body.id).toBe(res2.body.id);
  });

  it('should create new resource without idempotency key', async () => {
    const res1 = await request(app)
      .post('/api/v1/users')
      .send({
        name: 'NoKey',
        lastName: 'User',
        email: 'nokey@example.com',
      });

    const res2 = await request(app)
      .post('/api/v1/users')
      .send({
        name: 'NoKey2',
        lastName: 'User',
        email: 'nokey2@example.com',
      });

    expect(res1.status).toBe(201);
    expect(res2.status).toBe(201);
    expect(res1.body.id).not.toBe(res2.body.id);
  });

  it('should create only one resource with parallel requests using same key', async () => {
    const idempotencyKey = 'parallel-key-456';

    await Promise.allSettled([
      request(app)
        .post('/users')
        .set('Idempotency-Key', idempotencyKey)
        .send({ name: 'Parallel', lastName: 'User', email: 'parallel@example.com' }),
      request(app)
        .post('/users')
        .set('Idempotency-Key', idempotencyKey)
        .send({ name: 'Parallel', lastName: 'User', email: 'parallel@example.com' }),
    ]);

    const pool = getPool();
    const [users] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      ['parallel@example.com']
    );

    expect((users as any[]).length).toBe(1);
  });
});
