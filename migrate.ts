import { readFileSync } from 'fs';
import { createPool } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function runMigration(sqlPath: string) {
  const pool = createPool({
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });

  const sql = readFileSync(sqlPath, 'utf-8');
  const statements = sql.split(';').filter((s) => s.trim().length > 0);

  const connection = await pool.getConnection();
  try {
    for (const statement of statements) {
      await connection.query(statement);
    }
    console.log(`Migration ${sqlPath} executed successfully`);
  } catch (error) {
    console.error(`Migration ${sqlPath} failed:`, error);
    process.exit(1);
  } finally {
    connection.release();
    await pool.end();
  }
}

async function main() {
  await runMigration('migrations/001_initial_schema.sql');
  await runMigration('migrations/002_seed.sql');
  await runMigration('migrations/003_notifications_per_attempt.sql');
  console.log('All migrations executed successfully');
}

main();
