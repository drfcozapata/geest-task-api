import request from 'supertest';
import app from '../src/app';
import { getPool } from '../src/config/database';

describe('User Endpoints', () => {
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

  describe('POST /api/v1/users', () => {
    it('should create a new user', async () => {
      const res = await request(app)
        .post('/api/v1/users')
        .send({
          name: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('John');
      expect(res.body.lastName).toBe('Doe');
      expect(res.body.email).toBe('john@example.com');
    });

    it('should return error if name is missing', async () => {
      const res = await request(app)
        .post('/api/v1/users')
        .send({
          lastName: 'Doe',
          email: 'john2@example.com',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toHaveProperty('code');
    });

    it('should return error if email is invalid', async () => {
      const res = await request(app)
        .post('/api/v1/users')
        .send({
          name: 'John',
          lastName: 'Doe',
          email: 'invalid-email',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toHaveProperty('code');
    });

    it('should return error if email already exists', async () => {
      await request(app)
        .post('/api/v1/users')
        .send({
          name: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        });

      const res = await request(app)
        .post('/api/v1/users')
        .send({
          name: 'Jane',
          lastName: 'Doe',
          email: 'john@example.com',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('DUPLICATE_EMAIL');
    });
  });

  describe('GET /api/v1/users', () => {
    it('should return list of users', async () => {
      const res = await request(app).get('/api/v1/users');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('DELETE /api/v1/users/:idUser', () => {
    it('should soft delete a user', async () => {
      const userRes = await request(app)
        .post('/api/v1/users')
        .send({
          name: 'ToDelete',
          lastName: 'User',
          email: 'delete@example.com',
        });

      const res = await request(app)
        .delete(`/api/v1/users/${userRes.body.id}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('User deleted');
    });

    it('should return 404 if user not found', async () => {
      const res = await request(app).delete('/api/v1/users/99999');

      expect(res.status).toBe(404);
    });
  });
});
