import { Router } from 'express';
import { createPrescription, getPrescriptions, getPrescriptionPDF } from '../controllers/prescription.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);
router.get('/', getPrescriptions);
router.post('/', authorize('DOCTOR'), createPrescription);
router.get('/:id/pdf', getPrescriptionPDF);

export default router;
