import { Router } from 'express';
<<<<<<< HEAD
import { getMe, updateMe, getPatientById, getAllPatients, getPatientRecords, uploadDocument, getLabResults, signalSymptom } from '../controllers/patient.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';
import { auditLog } from '../middlewares/audit.middleware';
import { validate } from '../middlewares/validate.middleware';
import { updatePatientSchema } from '../schemas';
=======
import { getMe, updateMe, getPatientById, getAllPatients, getPatientRecords, uploadDocument } from '../controllers/patient.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';
import { auditLog } from '../middlewares/audit.middleware';
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567

const router = Router();

router.use(authenticate);
router.get('/me', authorize('PATIENT'), getMe);
<<<<<<< HEAD
router.put('/me', authorize('PATIENT'), validate(updatePatientSchema), updateMe);
router.get('/', authorize('DOCTOR', 'SECRETARY', 'ADMIN'), getAllPatients);
router.get('/:id', authorize('DOCTOR', 'SECRETARY', 'ADMIN'), auditLog('VIEW_PATIENT', 'patient'), getPatientById);
router.get('/:id/records', authorize('DOCTOR', 'PATIENT', 'ADMIN'), auditLog('VIEW_RECORDS', 'medical_record'), getPatientRecords);
router.post('/:id/documents',   upload.single('file'), uploadDocument);
router.get('/:id/lab-results', getLabResults);
router.post('/signal',         authorize('PATIENT'), signalSymptom);
=======
router.put('/me', authorize('PATIENT'), updateMe);
router.get('/', authorize('DOCTOR', 'SECRETARY', 'ADMIN'), getAllPatients);
router.get('/:id', authorize('DOCTOR', 'SECRETARY', 'ADMIN'), auditLog('VIEW_PATIENT', 'patient'), getPatientById);
router.get('/:id/records', authorize('DOCTOR', 'PATIENT', 'ADMIN'), auditLog('VIEW_RECORDS', 'medical_record'), getPatientRecords);
router.post('/:id/documents', upload.single('file'), uploadDocument);
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567

export default router;
