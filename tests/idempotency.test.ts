import request from 'supertest';
import app from '../src/app';

describe('Idempotency', () => {
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
});
