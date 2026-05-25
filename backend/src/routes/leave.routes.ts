import { Router } from 'express';
import { getLeaves, createLeave, deleteLeave } from '../controllers/leave.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createLeaveSchema } from '../schemas';

const router = Router();
router.use(authenticate, authorize('DOCTOR', 'ADMIN'));
router.get('/', getLeaves);
router.post('/', validate(createLeaveSchema), createLeave);
router.delete('/:id', deleteLeave);

export default router;
