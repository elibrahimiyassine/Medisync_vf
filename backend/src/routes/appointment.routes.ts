import { Router } from 'express';
import { getAppointments, getAppointmentById, createAppointment, updateAppointment, cancelAppointment } from '../controllers/appointment.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { auditLog } from '../middlewares/audit.middleware';
<<<<<<< HEAD
import { validate } from '../middlewares/validate.middleware';
import { createAppointmentSchema, updateAppointmentSchema } from '../schemas';
=======
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567

const router = Router();

router.use(authenticate);
router.get('/', getAppointments);
router.get('/:id', getAppointmentById);
<<<<<<< HEAD
router.post('/', authorize('PATIENT', 'DOCTOR', 'SECRETARY', 'ADMIN'), validate(createAppointmentSchema), auditLog('CREATE_APPOINTMENT', 'appointment'), createAppointment);
router.put('/:id', authorize('DOCTOR', 'SECRETARY', 'ADMIN'), validate(updateAppointmentSchema), auditLog('UPDATE_APPOINTMENT', 'appointment'), updateAppointment);
=======
router.post('/', authorize('PATIENT', 'SECRETARY', 'ADMIN'), auditLog('CREATE_APPOINTMENT', 'appointment'), createAppointment);
router.put('/:id', authorize('DOCTOR', 'SECRETARY', 'ADMIN'), auditLog('UPDATE_APPOINTMENT', 'appointment'), updateAppointment);
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
router.delete('/:id', authorize('PATIENT', 'DOCTOR', 'SECRETARY', 'ADMIN'), cancelAppointment);

export default router;
