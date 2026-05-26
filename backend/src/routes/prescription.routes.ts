import { Router } from 'express';
<<<<<<< HEAD
import {
  createPrescription, getPrescriptions, getPrescriptionPDF,
  updatePrescription, deletePrescription,
} from '../controllers/prescription.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createPrescriptionSchema, updatePrescriptionSchema } from '../schemas';
=======
import { createPrescription, getPrescriptions, getPrescriptionPDF } from '../controllers/prescription.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567

const router = Router();
router.use(authenticate);
router.get('/', getPrescriptions);
<<<<<<< HEAD
router.post('/', authorize('DOCTOR'), validate(createPrescriptionSchema), createPrescription);
router.get('/:id/pdf', getPrescriptionPDF);
router.put('/:id', authorize('DOCTOR', 'ADMIN'), validate(updatePrescriptionSchema), updatePrescription);
router.delete('/:id', authorize('DOCTOR', 'ADMIN'), deletePrescription);
=======
router.post('/', authorize('DOCTOR'), createPrescription);
router.get('/:id/pdf', getPrescriptionPDF);
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567

export default router;
