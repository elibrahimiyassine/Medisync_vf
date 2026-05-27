import { Router } from 'express';
import { getAppointments, getAppointmentById, createAppointment, updateAppointment, cancelAppointment } from '../controllers/appointment.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { auditLog } from '../middlewares/audit.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createAppointmentSchema, updateAppointmentSchema } from '../schemas';

const router = Router();

router.use(authenticate);
router.get('/', getAppointments);
router.get('/:id', getAppointmentById);
router.post('/', authorize('PATIENT', 'DOCTOR', 'SECRETARY', 'ADMIN'), validate(createAppointmentSchema), auditLog('CREATE_APPOINTMENT', 'appointment'), createAppointment);
router.put('/:id', authorize('DOCTOR', 'SECRETARY', 'ADMIN'), validate(updateAppointmentSchema), auditLog('UPDATE_APPOINTMENT', 'appointment'), updateAppointment);
router.delete('/:id', authorize('PATIENT', 'DOCTOR', 'SECRETARY', 'ADMIN'), cancelAppointment);

export default router;
