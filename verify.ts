import { createPool } from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const pool = createPool({
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });

  const [users] = await pool.query('SELECT COUNT(*) as count FROM users');
  const [tasks] = await pool.query('SELECT COUNT(*) as count FROM tasks');
  const [assignments] = await pool.query('SELECT COUNT(*) as count FROM task_assignments');
  const [notifications] = await pool.query('SELECT COUNT(*) as count FROM notifications');
  const [idem] = await pool.query('SELECT COUNT(*) as count FROM idempotency_keys');
  const [migration] = await pool.query(
    "SELECT COUNT(*) as count FROM information_schema.columns WHERE table_schema = ? AND table_name = 'notifications' AND column_name = 'next_attempt_at'",
    [process.env.DB_NAME]
  );

  console.log('Users:', (users as any[])[0].count);
  console.log('Tasks:', (tasks as any[])[0].count);
  console.log('Assignments:', (assignments as any[])[0].count);
  console.log('Notifications:', (notifications as any[])[0].count);
  console.log('Idempotency keys:', (idem as any[])[0].count);
  console.log('Migration 003 applied:', (migration as any[])[0].count > 0 ? 'YES' : 'NO');

  await pool.end();
}

main();
