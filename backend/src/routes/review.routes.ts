import { Router } from 'express';
import { createReview, getDoctorReviews } from '../controllers/review.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
router.get('/doctor/:id', getDoctorReviews);
router.use(authenticate);
router.post('/', authorize('PATIENT'), createReview);

export default router;
