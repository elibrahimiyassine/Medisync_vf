import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { prisma } from '../utils/prisma';
import { AppError } from '../middlewares/error.middleware';

const router = Router();
router.use(authenticate);

router.get('/:patientId', async (req, res, next) => {
  try {
    const documents = await prisma.document.findMany({
      where: { patientId: req.params.patientId },
      orderBy: { uploadedAt: 'desc' },
    });
    res.json({ success: true, data: documents });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.document.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
