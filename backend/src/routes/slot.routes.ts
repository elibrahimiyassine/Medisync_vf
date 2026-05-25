import { Router } from 'express';
import { getSlots, createSlot, deleteSlot } from '../controllers/slot.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createSlotSchema } from '../schemas';

const router = Router();

// authenticate on all routes so DOCTOR role can be detected in getSlots
router.use(authenticate);
router.get('/', getSlots);
router.post('/', authorize('DOCTOR', 'ADMIN'), validate(createSlotSchema), createSlot);
router.delete('/:id', authorize('DOCTOR', 'ADMIN'), deleteSlot);

export default router;
