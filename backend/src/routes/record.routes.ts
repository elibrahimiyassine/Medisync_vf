import { Router } from 'express';
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

export default router;
