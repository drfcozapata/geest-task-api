import { Router, Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validate';
import { getPool } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = Router();

/**
 * @swagger
 * /api/v1/tasks:
 *   post:
 *     tags: [Tasks]
 *     summary: Create a new task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Validation error
 */
router.post(
  '/',
  validate([
    body('title').notEmpty().withMessage('Title is required'),
  ]),
  async (req: Request, res: Response) => {
    const { title, description } = req.body;
    const pool = getPool();

    const [result] = await pool.query(
      'INSERT INTO tasks (title, description) VALUES (?, ?)',
      [title, description || null]
    );

    const insertResult = result as any;
    const taskId = insertResult.insertId;

    const [rows] = await pool.query(
      'SELECT id, title, description, status, created_at as createdAt FROM tasks WHERE id = ?',
      [taskId]
    );

    const task = (rows as any[])[0];
    res.status(201).json(task);
  }
);

/**
 * @swagger
 * /api/v1/tasks/{idTask}/assign:
 *   post:
 *     tags: [Tasks]
 *     summary: Assign users to a task
 *     parameters:
 *       - in: path
 *         name: idTask
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userIds]
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Users assigned successfully
 *       404:
 *         description: Task or user not found
 */
router.post(
  '/:idTask/assign',
  validate([
    param('idTask').isInt().withMessage('Task ID must be an integer'),
    body('userIds').isArray({ min: 1 }).withMessage('User IDs must be a non-empty array'),
    body('userIds.*').isInt().withMessage('Each user ID must be an integer'),
  ]),
  async (req: Request, res: Response) => {
    const { idTask } = req.params;
    const { userIds } = req.body;
    const pool = getPool();

    const [task] = await pool.query(
      'SELECT id FROM tasks WHERE id = ? AND deleted_at IS NULL',
      [idTask]
    );

    if ((task as any[]).length === 0) {
      throw createError(404, 'TASK_NOT_FOUND', `Task with id ${idTask} does not exist`);
    }

    const [users] = await pool.query(
      'SELECT id FROM users WHERE id IN (?) AND deleted_at IS NULL',
      [userIds]
    );

    const foundUserIds = (users as any[]).map((u) => u.id);
    const missingUserIds = userIds.filter((id: number) => !foundUserIds.includes(id));

    if (missingUserIds.length > 0) {
      throw createError(
        404,
        'USER_NOT_FOUND',
        `Users not found: ${missingUserIds.join(', ')}`
      );
    }

    const values = userIds.map((userId: number) => [idTask, userId]);
    await pool.query(
      'INSERT IGNORE INTO task_assignments (task_id, user_id) VALUES ?',
      [values]
    );

    res.json({ message: 'Task assigned successfully' });
  }
);

/**
 * @swagger
 * /api/v1/tasks/{idTask}/complete:
 *   post:
 *     tags: [Tasks]
 *     summary: Mark a task as completed by a user
 *     parameters:
 *       - in: path
 *         name: idTask
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Task completion recorded
 *       400:
 *         description: User not assigned to task
 *       404:
 *         description: Task or user not found
 */
router.post(
  '/:idTask/complete',
  validate([
    param('idTask').isInt().withMessage('Task ID must be an integer'),
    body('userId').isInt().withMessage('User ID must be an integer'),
  ]),
  async (req: Request, res: Response) => {
    const { idTask } = req.params;
    const { userId } = req.body;
    const pool = getPool();

    const [task] = await pool.query(
      'SELECT id, status FROM tasks WHERE id = ? AND deleted_at IS NULL',
      [idTask]
    );

    if ((task as any[]).length === 0) {
      throw createError(404, 'TASK_NOT_FOUND', `Task with id ${idTask} does not exist`);
    }

    const taskData = (task as any[])[0];
    if (taskData.status === 'archived') {
      throw createError(400, 'TASK_ARCHIVED', 'Task is already archived');
    }

    const [user] = await pool.query(
      'SELECT id FROM users WHERE id = ? AND deleted_at IS NULL',
      [userId]
    );

    if ((user as any[]).length === 0) {
      throw createError(404, 'USER_NOT_FOUND', `User with id ${userId} does not exist`);
    }

    const [assignment] = await pool.query(
      'SELECT id FROM task_assignments WHERE task_id = ? AND user_id = ?',
      [idTask, userId]
    );

    if ((assignment as any[]).length === 0) {
      throw createError(
        400,
        'USER_NOT_ASSIGNED',
        `User ${userId} is not assigned to task ${idTask}`
      );
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(
        'UPDATE task_assignments SET completed = TRUE WHERE task_id = ? AND user_id = ?',
        [idTask, userId]
      );

      const [uncompleted] = await connection.query(
        'SELECT COUNT(*) as count FROM task_assignments WHERE task_id = ? AND completed = FALSE',
        [idTask]
      );

      const uncompletedCount = (uncompleted as any[])[0].count;

      if (uncompletedCount === 0) {
        const [updateResult] = await connection.query(
          "UPDATE tasks SET status = 'archived' WHERE id = ? AND status = 'open'",
          [idTask]
        );

        const updateData = updateResult as any;
        if (updateData.affectedRows > 0) {
          const [taskRows] = await connection.query(
            'SELECT id, title FROM tasks WHERE id = ?',
            [idTask]
          );
          const taskInfo = (taskRows as any[])[0];

          const payload = {
            taskId: taskInfo.id,
            title: taskInfo.title,
            archivedAt: new Date().toISOString(),
          };

          await connection.query(
            'INSERT INTO notifications (task_id, attempt, payload) VALUES (?, 1, ?)',
            [idTask, JSON.stringify(payload)]
          );

          logger.info(`Task ${idTask} archived. Notification queued.`);
        }
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    res.json({ message: 'Task completion recorded' });
  }
);

/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     tags: [Tasks]
 *     summary: Get all tasks
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, archived]
 *     responses:
 *       200:
 *         description: List of tasks
 */
router.get(
  '/',
  validate([
    query('status')
      .optional()
      .isIn(['open', 'archived'])
      .withMessage('Status must be open or archived'),
  ]),
  async (req: Request, res: Response) => {
    const { status } = req.query;
    const pool = getPool();

    let sql = `
      SELECT t.id, t.title, t.description, t.status, t.created_at as createdAt
      FROM tasks t
      WHERE t.deleted_at IS NULL
    `;
    const params: any[] = [];

    if (status) {
      sql += ' AND t.status = ?';
      params.push(status);
    }

    const [tasks] = await pool.query(sql, params);

    const tasksWithUsers = await Promise.all(
      (tasks as any[]).map(async (task) => {
        const [completedUsers] = await pool.query(
          `SELECT u.id, u.name, u.last_name as lastName
           FROM users u
           INNER JOIN task_assignments ta ON u.id = ta.user_id
           WHERE ta.task_id = ? AND ta.completed = TRUE`,
          [task.id]
        );
        return { ...task, completedUsers };
      })
    );

    res.json(tasksWithUsers);
  }
);

/**
 * @swagger
 * /api/v1/tasks/{idTask}:
 *   get:
 *     tags: [Tasks]
 *     summary: Get task details
 *     parameters:
 *       - in: path
 *         name: idTask
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task details
 *       404:
 *         description: Task not found
 */
router.get('/:idTask', async (req: Request, res: Response) => {
  const { idTask } = req.params;
  const pool = getPool();

  const [tasks] = await pool.query(
    'SELECT id, title, description, status, created_at as createdAt FROM tasks WHERE id = ? AND deleted_at IS NULL',
    [idTask]
  );

  if ((tasks as any[]).length === 0) {
    throw createError(404, 'TASK_NOT_FOUND', `Task with id ${idTask} does not exist`);
  }

  const task = (tasks as any[])[0];

  const [assignedUsers] = await pool.query(
    `SELECT u.id, u.name, u.last_name as lastName, ta.completed
     FROM users u
     INNER JOIN task_assignments ta ON u.id = ta.user_id
     WHERE ta.task_id = ?`,
    [idTask]
  );

  res.json({ ...task, assignedUsers });
});

/**
 * @swagger
 * /api/v1/tasks/{idTask}/notifications:
 *   get:
 *     tags: [Tasks]
 *     summary: Get task notifications
 *     parameters:
 *       - in: path
 *         name: idTask
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task notifications
 *       404:
 *         description: Task not found
 */
router.get('/:idTask/notifications', async (req: Request, res: Response) => {
  const { idTask } = req.params;
  const pool = getPool();

  const [tasks] = await pool.query(
    'SELECT id FROM tasks WHERE id = ? AND deleted_at IS NULL',
    [idTask]
  );

  if ((tasks as any[]).length === 0) {
    throw createError(404, 'TASK_NOT_FOUND', `Task with id ${idTask} does not exist`);
  }

  const [notifications] = await pool.query(
    'SELECT attempt, http_status as httpStatus, created_at as timestamp, payload FROM notifications WHERE task_id = ? ORDER BY attempt',
    [idTask]
  );

  res.json(notifications);
});

/**
 * @swagger
 * /api/v1/tasks/{idTask}:
 *   delete:
 *     tags: [Tasks]
 *     summary: Soft delete a task
 *     parameters:
 *       - in: path
 *         name: idTask
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found
 */
router.delete('/:idTask', async (req: Request, res: Response) => {
  const { idTask } = req.params;
  const pool = getPool();

  const [result] = await pool.query(
    'UPDATE tasks SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL',
    [idTask]
  );

  const updateResult = result as any;
  if (updateResult.affectedRows === 0) {
    throw createError(404, 'TASK_NOT_FOUND', `Task with id ${idTask} does not exist`);
  }

  res.json({ message: 'Task deleted' });
});

export default router;
