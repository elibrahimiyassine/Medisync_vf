import { Router } from 'express';
<<<<<<< HEAD
import { getRecords, createRecord, getRecord, updateRecord, uploadRecordDocument } from '../controllers/record.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { auditLog } from '../middlewares/audit.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createRecordSchema, updateRecordSchema } from '../schemas';
import { upload } from '../middlewares/upload.middleware';

const router = Router();
router.use(authenticate);
router.get('/', getRecords);
router.post('/', authorize('DOCTOR'), validate(createRecordSchema), auditLog('CREATE_RECORD', 'medical_record'), createRecord);
router.get('/:id', auditLog('VIEW_RECORD', 'medical_record'), getRecord);
router.put('/:id', authorize('DOCTOR'), validate(updateRecordSchema), updateRecord);
router.post('/:id/documents', authorize('DOCTOR'), upload.single('file'), uploadRecordDocument);
=======
import { createRecord, getRecord, updateRecord } from '../controllers/record.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { auditLog } from '../middlewares/audit.middleware';

const router = Router();
router.use(authenticate);
router.post('/', authorize('DOCTOR'), auditLog('CREATE_RECORD', 'medical_record'), createRecord);
router.get('/:id', auditLog('VIEW_RECORD', 'medical_record'), getRecord);
router.put('/:id', authorize('DOCTOR'), updateRecord);
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567

export default router;
