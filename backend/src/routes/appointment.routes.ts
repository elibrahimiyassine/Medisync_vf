import { Router } from 'express';
import { getAppointments, getAppointmentById, createAppointment, updateAppointment, cancelAppointment } from '../controllers/appointment.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { auditLog } from '../middlewares/audit.middleware';

const router = Router();

router.use(authenticate);
router.get('/', getAppointments);
router.get('/:id', getAppointmentById);
router.post('/', authorize('PATIENT', 'SECRETARY', 'ADMIN'), auditLog('CREATE_APPOINTMENT', 'appointment'), createAppointment);
router.put('/:id', authorize('DOCTOR', 'SECRETARY', 'ADMIN'), auditLog('UPDATE_APPOINTMENT', 'appointment'), updateAppointment);
router.delete('/:id', authorize('PATIENT', 'DOCTOR', 'SECRETARY', 'ADMIN'), cancelAppointment);

export default router;
