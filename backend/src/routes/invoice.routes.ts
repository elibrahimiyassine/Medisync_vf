import { Router } from 'express';
<<<<<<< HEAD
import { createInvoice, getInvoices, updateInvoice, getInvoicePDF, getFeuilleSoins, sendInvoiceByEmail } from '../controllers/invoice.controller';
=======
import { createInvoice, getInvoices, updateInvoice, getInvoicePDF } from '../controllers/invoice.controller';
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);
router.get('/', getInvoices);
router.post('/', authorize('SECRETARY', 'ADMIN'), createInvoice);
router.put('/:id', authorize('SECRETARY', 'ADMIN'), updateInvoice);
router.get('/:id/pdf', getInvoicePDF);
<<<<<<< HEAD
router.get('/:id/feuille-soins', getFeuilleSoins);
router.post('/:id/send-email', authorize('SECRETARY', 'ADMIN'), sendInvoiceByEmail);
=======
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567

export default router;
