import { Router } from 'express';
import { getAllDoctors, getDoctorById, getDoctorSlots, getDoctorAppointments, updateDoctor, getDoctorDashboard } from '../controllers/doctor.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);
router.get('/:id/slots', getDoctorSlots);

router.use(authenticate);
router.get('/me/dashboard', authorize('DOCTOR'), getDoctorDashboard);
router.get('/me/appointments', authorize('DOCTOR'), getDoctorAppointments);
router.put('/:id', authorize('DOCTOR', 'ADMIN'), updateDoctor);

export default router;
