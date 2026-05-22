import { Router } from 'express';
import {
  getStats, getAuditLogs,
  getStaff, createStaff, updateStaff, deleteStaff,
  getFinanceReport,
  getSettings, updateSettings,
} from '../controllers/admin.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { auditLog } from '../middlewares/audit.middleware';

const router = Router();
router.use(authenticate, authorize('ADMIN'));

router.get('/stats',        getStats);
router.get('/audit',        getAuditLogs);
router.get('/staff',        getStaff);
router.post('/staff',       auditLog('CREATE_STAFF', 'user'), createStaff);
router.put('/staff/:id',    auditLog('UPDATE_STAFF', 'user'), updateStaff);
router.delete('/staff/:id', auditLog('DELETE_STAFF', 'user'), deleteStaff);
router.get('/finance',      getFinanceReport);
router.get('/settings',     getSettings);
router.put('/settings',     auditLog('UPDATE_SETTINGS', 'system'), updateSettings);

export default router;
