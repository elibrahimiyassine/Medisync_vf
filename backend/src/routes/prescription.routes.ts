import { Router } from 'express';
import {
  createPrescription, getPrescriptions, getPrescriptionPDF,
  updatePrescription, deletePrescription,
} from '../controllers/prescription.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createPrescriptionSchema, updatePrescriptionSchema } from '../schemas';

const router = Router();
router.use(authenticate);
router.get('/', getPrescriptions);
router.post('/', authorize('DOCTOR'), validate(createPrescriptionSchema), createPrescription);
router.get('/:id/pdf', getPrescriptionPDF);
router.put('/:id', authorize('DOCTOR', 'ADMIN'), validate(updatePrescriptionSchema), updatePrescription);
router.delete('/:id', authorize('DOCTOR', 'ADMIN'), deletePrescription);

export default router;
