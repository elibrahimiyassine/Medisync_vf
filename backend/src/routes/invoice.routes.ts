import { Router } from 'express';
import { createInvoice, getInvoices, updateInvoice, getInvoicePDF, getFeuilleSoins, sendInvoiceByEmail } from '../controllers/invoice.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);
router.get('/', getInvoices);
router.post('/', authorize('SECRETARY', 'ADMIN'), createInvoice);
router.put('/:id', authorize('SECRETARY', 'ADMIN'), updateInvoice);
router.get('/:id/pdf', getInvoicePDF);
router.get('/:id/feuille-soins', getFeuilleSoins);
router.post('/:id/send-email', authorize('SECRETARY', 'ADMIN'), sendInvoiceByEmail);

export default router;
