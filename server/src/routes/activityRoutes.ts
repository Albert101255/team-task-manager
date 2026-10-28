import { Router } from 'express';
import { getAllActivities, getTaskActivity } from '../controllers/activityController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdminOrAssignee, requireRole } from '../middleware/rbac.js';

const router = Router();

router.use(requireAuth);

router.get('/tasks/:id', requireAdminOrAssignee, getTaskActivity);
router.get('/', requireRole('admin'), getAllActivities);

export default router;
