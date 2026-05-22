import { Router } from 'express';
import { getSlots, createSlot, deleteSlot } from '../controllers/slot.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getSlots);
router.use(authenticate);
router.post('/', authorize('DOCTOR', 'ADMIN'), createSlot);
router.delete('/:id', authorize('DOCTOR', 'ADMIN'), deleteSlot);

export default router;
