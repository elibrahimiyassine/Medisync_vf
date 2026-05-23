import { Router } from 'express';
import { getSecretaryMe, updateSecretaryMe, createPatientBySecretary } from '../controllers/secretary.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { updateSecretarySchema } from '../schemas';

const router = Router();
router.use(authenticate, authorize('SECRETARY'));
router.get('/me', getSecretaryMe);
router.put('/me', validate(updateSecretarySchema), updateSecretaryMe);
router.post('/patients', createPatientBySecretary);

export default router;
