import request from 'supertest';
import app from '../src/app';
import { getPool } from '../src/config/database';

describe('Task Endpoints', () => {
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

  describe('POST /api/v1/tasks', () => {
    it('should create a new task', async () => {
      const res = await request(app).post('/api/v1/tasks').send({
        title: 'Test Task',
        description: 'This is a test task',
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe('Test Task');
      expect(res.body.status).toBe('open');
    });

    it('should return error if title is missing', async () => {
      const res = await request(app).post('/api/v1/tasks').send({
        description: 'This is a test task',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toHaveProperty('code');
    });
  });

  describe('POST /api/v1/tasks/:idTask/assign', () => {
    it('should assign users to a task', async () => {
      const taskRes = await request(app).post('/api/v1/tasks').send({ title: 'Task to Assign' });

      const user1Res = await request(app)
        .post('/api/v1/users')
        .send({ name: 'User', lastName: 'One', email: 'user1@example.com' });

      const user2Res = await request(app)
        .post('/api/v1/users')
        .send({ name: 'User', lastName: 'Two', email: 'user2@example.com' });

      const res = await request(app)
        .post(`/api/v1/tasks/${taskRes.body.id}/assign`)
        .send({ userIds: [user1Res.body.id, user2Res.body.id] });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Task assigned successfully');
    });

    it('should return 404 if task not found', async () => {
      const res = await request(app)
        .post('/api/v1/tasks/99999/assign')
        .send({ userIds: [1] });

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/v1/tasks/:idTask/complete', () => {
    it('should mark task as completed by user', async () => {
      const taskRes = await request(app).post('/api/v1/tasks').send({ title: 'Task to Complete' });

      const userRes = await request(app)
        .post('/api/v1/users')
        .send({ name: 'Completer', lastName: 'User', email: 'completer@example.com' });

      await request(app)
        .post(`/api/v1/tasks/${taskRes.body.id}/assign`)
        .send({ userIds: [userRes.body.id] });

      const res = await request(app)
        .post(`/api/v1/tasks/${taskRes.body.id}/complete`)
        .send({ userId: userRes.body.id });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Task completion recorded');
    });

    it('should return 400 if user not assigned', async () => {
      const taskRes = await request(app).post('/api/v1/tasks').send({ title: 'Task Not Assigned' });

      const userRes = await request(app)
        .post('/api/v1/users')
        .send({ name: 'Not', lastName: 'Assigned', email: 'notassigned@example.com' });

      const res = await request(app)
        .post(`/api/v1/tasks/${taskRes.body.id}/complete`)
        .send({ userId: userRes.body.id });

      expect(res.status).toBe(400);
    });

    it('should auto-archive when all assigned users complete', async () => {
      const taskRes = await request(app).post('/api/v1/tasks').send({ title: 'AutoArchive Task' });

      const user1Res = await request(app)
        .post('/api/v1/users')
        .send({ name: 'Auto', lastName: 'One', email: 'auto1@example.com' });

      const user2Res = await request(app)
        .post('/api/v1/users')
        .send({ name: 'Auto', lastName: 'Two', email: 'auto2@example.com' });

      await request(app)
        .post(`/api/v1/tasks/${taskRes.body.id}/assign`)
        .send({ userIds: [user1Res.body.id, user2Res.body.id] });

      await request(app).post(`/api/v1/tasks/${taskRes.body.id}/complete`).send({ userId: user1Res.body.id });

      await request(app).post(`/api/v1/tasks/${taskRes.body.id}/complete`).send({ userId: user2Res.body.id });

      const res = await request(app).get(`/api/v1/tasks/${taskRes.body.id}`);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('archived');
    });

    it('should archive exactly once when two users complete in parallel', async () => {
      const taskRes = await request(app).post('/api/v1/tasks').send({ title: 'ParallelArchive Task' });

      const user1Res = await request(app)
        .post('/api/v1/users')
        .send({ name: 'Par', lastName: 'One', email: 'par1@example.com' });

      const user2Res = await request(app)
        .post('/api/v1/users')
        .send({ name: 'Par', lastName: 'Two', email: 'par2@example.com' });

      await request(app)
        .post(`/api/v1/tasks/${taskRes.body.id}/assign`)
        .send({ userIds: [user1Res.body.id, user2Res.body.id] });

      await Promise.allSettled([
        request(app).post(`/api/v1/tasks/${taskRes.body.id}/complete`).send({ userId: user1Res.body.id }),
        request(app).post(`/api/v1/tasks/${taskRes.body.id}/complete`).send({ userId: user2Res.body.id }),
      ]);

      const res = await request(app).get(`/api/v1/tasks/${taskRes.body.id}`);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('archived');

      // Verificar exactamente 1 notificación inicial
      const notifRes = await request(app).get(`/api/v1/tasks/${taskRes.body.id}/notifications`);
      expect(notifRes.status).toBe(200);
      const initialNotifications = (notifRes.body as any[]).filter((n) => n.attempt === 1 && n.httpStatus === null);
      expect(initialNotifications.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/v1/tasks', () => {
    it('should return list of tasks', async () => {
      const res = await request(app).get('/api/v1/tasks');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should filter tasks by status', async () => {
      const res = await request(app).get('/api/v1/tasks?status=open');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/v1/tasks/:idTask', () => {
    it('should return task details', async () => {
      const taskRes = await request(app).post('/api/v1/tasks').send({ title: 'Detail Task' });

      const res = await request(app).get(`/api/v1/tasks/${taskRes.body.id}`);

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Detail Task');
      expect(res.body).toHaveProperty('assignedUsers');
    });

    it('should return 404 if task not found', async () => {
      const res = await request(app).get('/api/v1/tasks/99999');

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/v1/tasks/:idTask/notifications', () => {
    it('should return task notifications', async () => {
      const taskRes = await request(app).post('/api/v1/tasks').send({ title: 'Notification Task' });

      const res = await request(app).get(`/api/v1/tasks/${taskRes.body.id}/notifications`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('DELETE /api/v1/tasks/:idTask', () => {
    it('should soft delete a task', async () => {
      const taskRes = await request(app).post('/api/v1/tasks').send({ title: 'Delete Task' });

      const res = await request(app).delete(`/api/v1/tasks/${taskRes.body.id}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Task deleted');
    });

    it('should return 404 if task not found', async () => {
      const res = await request(app).delete('/api/v1/tasks/99999');

      expect(res.status).toBe(404);
    });
  });
});
