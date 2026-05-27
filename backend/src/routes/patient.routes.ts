import { Router } from 'express';
import { getMe, updateMe, getPatientById, getAllPatients, getPatientRecords, uploadDocument, getLabResults, signalSymptom } from '../controllers/patient.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';
import { auditLog } from '../middlewares/audit.middleware';
import { validate } from '../middlewares/validate.middleware';
import { updatePatientSchema } from '../schemas';

const router = Router();

router.use(authenticate);
router.get('/me', authorize('PATIENT'), getMe);
router.put('/me', authorize('PATIENT'), validate(updatePatientSchema), updateMe);
router.get('/', authorize('DOCTOR', 'SECRETARY', 'ADMIN'), getAllPatients);
router.get('/:id', authorize('DOCTOR', 'SECRETARY', 'ADMIN'), auditLog('VIEW_PATIENT', 'patient'), getPatientById);
router.get('/:id/records', authorize('DOCTOR', 'PATIENT', 'ADMIN'), auditLog('VIEW_RECORDS', 'medical_record'), getPatientRecords);
router.post('/:id/documents',   upload.single('file'), uploadDocument);
router.get('/:id/lab-results', getLabResults);
router.post('/signal',         authorize('PATIENT'), signalSymptom);

export default router;
