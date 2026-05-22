import { Router } from 'express';
import { createRecord, getRecord, updateRecord } from '../controllers/record.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { auditLog } from '../middlewares/audit.middleware';

const router = Router();
router.use(authenticate);
router.post('/', authorize('DOCTOR'), auditLog('CREATE_RECORD', 'medical_record'), createRecord);
router.get('/:id', auditLog('VIEW_RECORD', 'medical_record'), getRecord);
router.put('/:id', authorize('DOCTOR'), updateRecord);

export default router;
