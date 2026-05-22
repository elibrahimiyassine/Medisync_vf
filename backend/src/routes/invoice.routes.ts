import { Router } from 'express';
import { createInvoice, getInvoices, updateInvoice, getInvoicePDF } from '../controllers/invoice.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);
router.get('/', getInvoices);
router.post('/', authorize('SECRETARY', 'ADMIN'), createInvoice);
router.put('/:id', authorize('SECRETARY', 'ADMIN'), updateInvoice);
router.get('/:id/pdf', getInvoicePDF);

export default router;
