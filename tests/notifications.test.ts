import request from 'supertest';
import app from '../src/app';
import { getPool } from '../src/config/database';
import notificationWorker from '../src/workers/notificationWorker';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Notification Retries', () => {
  beforeEach(async () => {
    const pool = getPool();
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    await pool.query('DELETE FROM notifications');
    await pool.query('DELETE FROM task_assignments');
    await pool.query('DELETE FROM tasks');
    await pool.query('DELETE FROM users');
    await pool.query('DELETE FROM idempotency_keys');
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');

    const [notifs] = await pool.query('SELECT COUNT(*) as count FROM notifications');
    const count = (notifs as any[])[0].count;
    if (count !== 0) {
      throw new Error(`Failed to clean notifications before test: ${count} rows remaining`);
    }
  });

  afterEach(() => {
    mockedAxios.post.mockReset();
  });

  it('should retry 3 times on 5xx and then succeed', async () => {
    mockedAxios.post
      .mockRejectedValueOnce({ response: { status: 500 } })
      .mockRejectedValueOnce({ response: { status: 503 } })
      .mockResolvedValueOnce({ status: 200 });

    const taskRes = await request(app).post('/tasks').send({ title: 'Retry Task' });
    const userRes = await request(app).post('/users').send({
      name: 'Retry',
      lastName: 'User',
      email: 'retry@example.com',
    });

    await request(app)
      .post(`/tasks/${taskRes.body.id}/assign`)
      .send({ userIds: [userRes.body.id] });

    await request(app).post(`/tasks/${taskRes.body.id}/complete`).send({ userId: userRes.body.id });

    await notificationWorker.processNotifications();
    await notificationWorker.processNotifications();
    await notificationWorker.processNotifications();

    const pool = getPool();
    const [notifications] = await pool.query('SELECT * FROM notifications WHERE task_id = ? ORDER BY attempt', [
      taskRes.body.id,
    ]);

    const notifs = notifications as any[];
    expect(notifs.length).toBe(3);
    expect(notifs[0].http_status).toBe(500);
    expect(notifs[1].http_status).toBe(503);
    expect(notifs[2].http_status).toBe(200);
  });

  it('should NOT retry on 4xx', async () => {
    mockedAxios.post.mockRejectedValueOnce({ response: { status: 400 } });

    const taskRes = await request(app).post('/tasks').send({ title: 'NoRetry Task' });
    const userRes = await request(app).post('/users').send({
      name: 'NoRetry',
      lastName: 'User',
      email: 'noretry@example.com',
    });

    await request(app)
      .post(`/tasks/${taskRes.body.id}/assign`)
      .send({ userIds: [userRes.body.id] });

    await request(app).post(`/tasks/${taskRes.body.id}/complete`).send({ userId: userRes.body.id });

    await notificationWorker.processNotifications();

    const pool = getPool();
    const [notifications] = await pool.query('SELECT * FROM notifications WHERE task_id = ? ORDER BY attempt', [
      taskRes.body.id,
    ]);

    const notifs = notifications as any[];
    expect(notifs.length).toBe(1);
    expect(notifs[0].http_status).toBe(400);
  });
});
