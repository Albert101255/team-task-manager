import { Router } from 'express';
import {
  createTask,
  deleteTask,
  getAllTasks,
  getMyTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
} from '../controllers/taskController.js';
import { getTaskActivity } from '../controllers/activityController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdminOrAssignee, requireRole } from '../middleware/rbac.js';

const router = Router();

router.use(requireAuth);

router.get('/my', getMyTasks);
router.get('/my-tasks', getMyTasks);
router.get('/', requireRole('admin'), getAllTasks);
router.post('/', requireRole('admin'), createTask);

router.get('/:id/activity', requireAdminOrAssignee, getTaskActivity);
router.get('/:id', requireAdminOrAssignee, getTaskById);
router.patch('/:id/status', requireAdminOrAssignee, updateTaskStatus);
router.patch('/:id', requireRole('admin'), updateTask);
router.delete('/:id', requireRole('admin'), deleteTask);

export default router;
