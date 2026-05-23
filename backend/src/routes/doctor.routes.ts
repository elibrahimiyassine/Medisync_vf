import { Router } from 'express';
import {
  getAllDoctors, getDoctorById, getDoctorSlots,
  getDoctorAppointments, updateDoctor, updateDoctorMe,
  getDoctorDashboard, getDoctorProfile,
} from '../controllers/doctor.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/', getAllDoctors);
router.get('/:id/slots', getDoctorSlots);

// Authenticated routes — /me/* MUST come before /:id to avoid param capture
router.use(authenticate);

// Medication autocomplete (REQ-36)
router.get('/medications', authorize('DOCTOR'), (req, res) => {
  const q = (req.query['q'] as string || '').toLowerCase();
  const meds = [
    'Paracétamol','Ibuprofène','Amoxicilline','Amoxicilline/Acide clavulanique','Azithromycine',
    'Metformine','Metoprolol','Amlodipine','Lisinopril','Atorvastatine','Simvastatine',
    'Oméprazole','Pantoprazole','Esoméprazole','Ranitidine','Metronidazole','Ciprofloxacine',
    'Cétirizine','Loratadine','Salbutamol','Fluticasone','Prednisone','Prednisolone',
    'Insuline glargine','Metoprolol','Bisoprolol','Furosémide','Spironolactone',
    'Aspirine','Clopidogrel','Warfarine','Héparine','Enoxaparine','Diazépam',
    'Sertraline','Fluoxétine','Amitriptyline','Tramadol','Codéine','Morphine',
    'Vitamine D3','Fer ferreux','Acide folique','Calcium','Magnésium',
  ];
  const filtered = q ? meds.filter(m => m.toLowerCase().includes(q)) : meds.slice(0, 20);
  res.json({ success: true, data: filtered.slice(0, 20) });
});

router.get('/me/dashboard',    authorize('DOCTOR'), getDoctorDashboard);
router.get('/me/profile',      authorize('DOCTOR'), getDoctorProfile);
router.put('/me/profile',      authorize('DOCTOR'), updateDoctorMe);
router.put('/me',              authorize('DOCTOR'), updateDoctorMe);
router.get('/me/appointments', authorize('DOCTOR'), getDoctorAppointments);

router.get('/:id', getDoctorById);
router.put('/:id', authorize('DOCTOR', 'ADMIN'), updateDoctor);

export default router;
