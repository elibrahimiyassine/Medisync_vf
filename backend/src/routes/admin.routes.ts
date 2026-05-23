import { Router } from 'express';
import {
  getStats, getMonthlyStats, getAuditLogs,
  getStaff, createStaff, updateStaff, deleteStaff,
  getFinanceReport,
  getSettings, updateSettings,
  getRooms, createRoom, deleteRoom, getRoomOccupancy,
  setupAdminTOTP, verifyAdminTOTP,
  updateAdminProfile,
} from '../controllers/admin.controller';
import { getReports, updateReportStatus } from '../controllers/patient.controller';
import { authenticate, authorize, requireAdmin2FA } from '../middlewares/auth.middleware';
import { auditLog } from '../middlewares/audit.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createStaffSchema, updateStaffSchema, updateSettingsSchema } from '../schemas';

const router = Router();
router.use(authenticate, authorize('ADMIN'), requireAdmin2FA);

router.get('/stats',          getStats);
router.get('/stats/monthly',  getMonthlyStats);
router.get('/audit',          getAuditLogs);
router.get('/staff',          getStaff);
router.post('/staff',         validate(createStaffSchema),  auditLog('CREATE_STAFF', 'user'), createStaff);
router.put('/staff/:id',      validate(updateStaffSchema),   auditLog('UPDATE_STAFF', 'user'), updateStaff);
router.delete('/staff/:id',   auditLog('DELETE_STAFF', 'user'), deleteStaff);
router.get('/finance',        getFinanceReport);
router.get('/settings',       getSettings);
router.put('/settings',       validate(updateSettingsSchema), auditLog('UPDATE_SETTINGS', 'system'), updateSettings);
router.get('/rooms',          getRooms);
router.get('/rooms/occupancy', getRoomOccupancy);
router.post('/rooms',         createRoom);
router.delete('/rooms/:id',   deleteRoom);
router.get('/totp/setup',     setupAdminTOTP);
router.post('/totp/verify',   verifyAdminTOTP);
router.put('/me',             updateAdminProfile);
router.get('/reports',        getReports);
router.patch('/reports/:id',  updateReportStatus);

export default router;
