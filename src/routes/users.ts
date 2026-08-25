import { Router, Request, Response } from 'express';
import { body, param } from 'express-validator';
import { validate, validateEmail } from '../middleware/validate';
import { getPool } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = Router();

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     tags: [Users]
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, lastName, email]
 *             properties:
 *               name:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 */
router.post(
  '/',
  validate([
    body('name').notEmpty().withMessage('Name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email')
      .notEmpty()
      .withMessage('Email is required')
      .custom((value) => {
        if (!validateEmail(value)) {
          throw new Error('Invalid email format');
        }
        return true;
      }),
  ]),
  async (req: Request, res: Response) => {
    const { name, lastName, email } = req.body;
    const pool = getPool();

    try {
      const [result] = await pool.query(
        'INSERT INTO users (name, last_name, email) VALUES (?, ?, ?)',
        [name, lastName, email]
      );

      const insertResult = result as any;
      const userId = insertResult.insertId;

      const [rows] = await pool.query(
        'SELECT id, name, last_name as lastName, email, created_at as createdAt FROM users WHERE id = ?',
        [userId]
      );

      const user = (rows as any[])[0];
      res.status(201).json(user);
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw createError(400, 'DUPLICATE_EMAIL', 'Email already exists');
      }
      throw error;
    }
  }
);

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users with their pending tasks
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserWithTasks'
 */
router.get('/', async (req: Request, res: Response) => {
  const pool = getPool();

  const [users] = await pool.query(
    'SELECT id, name, last_name as lastName, email, created_at as createdAt FROM users WHERE deleted_at IS NULL'
  );

  const usersWithTasks = await Promise.all(
    (users as any[]).map(async (user) => {
      const [tasks] = await pool.query(
        `SELECT t.id, t.title, t.description, t.status, t.created_at as createdAt
         FROM tasks t
         INNER JOIN task_assignments ta ON t.id = ta.task_id
         WHERE ta.user_id = ? AND t.status = 'open' AND t.deleted_at IS NULL`,
        [user.id]
      );
      return { ...user, pendingTasks: tasks };
    })
  );

  res.json(usersWithTasks);
});

/**
 * @swagger
 * /api/v1/users/deleted:
 *   get:
 *     tags: [Users]
 *     summary: Get all soft-deleted users
 *     description: Returns users that have been soft-deleted (deleted_at IS NOT NULL).
 *     responses:
 *       200:
 *         description: List of deleted users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   lastName:
 *                     type: string
 *                   email:
 *                     type: string
 *                   deletedAt:
 *                     type: string
 *                     format: date-time
 */
router.get('/deleted', async (req: Request, res: Response) => {
  const pool = getPool();

  const [users] = await pool.query(
    'SELECT id, name, last_name as lastName, email, deleted_at as deletedAt FROM users WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC'
  );

  res.json(users);
});

/**
 * @swagger
 * /api/v1/users/{idUser}/tasks:
 *   get:
 *     tags: [Users]
 *     summary: Get tasks for a specific user
 *     parameters:
 *       - in: path
 *         name: idUser
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User's tasks
 *       404:
 *         description: User not found
 */
router.get('/:idUser/tasks', async (req: Request, res: Response) => {
  const { idUser } = req.params;
  const pool = getPool();

  const [users] = await pool.query(
    'SELECT id FROM users WHERE id = ? AND deleted_at IS NULL',
    [idUser]
  );

  if ((users as any[]).length === 0) {
    throw createError(404, 'USER_NOT_FOUND', `User with id ${idUser} does not exist`);
  }

  const [tasks] = await pool.query(
    `SELECT t.id, t.title, t.description, t.status, ta.completed
     FROM tasks t
     INNER JOIN task_assignments ta ON t.id = ta.task_id
     WHERE ta.user_id = ? AND t.deleted_at IS NULL`,
    [idUser]
  );

  res.json(tasks);
});

/**
 * @swagger
 * /api/v1/users/{idUser}:
 *   delete:
 *     tags: [Users]
 *     summary: Soft delete a user
 *     description: Marks a user as deleted. Cannot delete a user with active (open) tasks.
 *     parameters:
 *       - in: path
 *         name: idUser
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       409:
 *         description: User has active tasks
 */
router.delete('/:idUser', async (req: Request, res: Response) => {
  const { idUser } = req.params;
  const pool = getPool();

  const [users] = await pool.query(
    'SELECT id FROM users WHERE id = ? AND deleted_at IS NULL',
    [idUser]
  );

  if ((users as any[]).length === 0) {
    throw createError(404, 'USER_NOT_FOUND', `User with id ${idUser} does not exist`);
  }

  const [activeTasks] = await pool.query(
    `SELECT t.id, t.title
     FROM tasks t
     INNER JOIN task_assignments ta ON t.id = ta.task_id
     WHERE ta.user_id = ? AND t.status = 'open' AND t.deleted_at IS NULL`,
    [idUser]
  );

  if ((activeTasks as any[]).length > 0) {
    const taskIds = (activeTasks as any[]).map((t: any) => t.id).join(', ');
    throw createError(
      409,
      'USER_HAS_ACTIVE_TASKS',
      `Cannot delete user with active tasks. Tasks: ${taskIds}`
    );
  }

  await pool.query(
    'UPDATE users SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL',
    [idUser]
  );

  res.json({ message: 'User deleted' });
});

/**
 * @swagger
 * /api/v1/users/{idUser}/restore:
 *   post:
 *     tags: [Users]
 *     summary: Restore a soft-deleted user
 *     description: Clears the deleted_at timestamp, making the user active again.
 *     parameters:
 *       - in: path
 *         name: idUser
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User restored successfully
 *       404:
 *         description: User not found or not deleted
 */
router.post('/:idUser/restore', async (req: Request, res: Response) => {
  const { idUser } = req.params;
  const pool = getPool();

  const [users] = await pool.query(
    'SELECT id FROM users WHERE id = ? AND deleted_at IS NOT NULL',
    [idUser]
  );

  if ((users as any[]).length === 0) {
    throw createError(404, 'USER_NOT_FOUND', `User with id ${idUser} does not exist or is not deleted`);
  }

  await pool.query(
    'UPDATE users SET deleted_at = NULL WHERE id = ?',
    [idUser]
  );

  const [rows] = await pool.query(
    'SELECT id, name, last_name as lastName, email, created_at as createdAt FROM users WHERE id = ?',
    [idUser]
  );

  const user = (rows as any[])[0];
  res.json({ message: 'User restored', user });
});

export default router;
