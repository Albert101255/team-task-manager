import { Router } from 'express';
import { getCurrentUserProfile, getUsers } from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

router.use(requireAuth);

router.get('/', requireRole('admin'), getUsers);
router.get('/me', getCurrentUserProfile);

export default router;
