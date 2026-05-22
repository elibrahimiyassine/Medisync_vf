import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createReview = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { doctorId, appointmentId, rating, comment } = req.body;
    const patient = await prisma.patient.findUnique({ where: { userId: req.user!.userId } });
    if (!patient) throw new AppError('Patient not found', 404);

    const review = await prisma.review.create({
      data: { patientId: patient.id, doctorId, appointmentId, rating: Number(rating), comment },
    });
    res.status(201).json({ success: true, data: review });
  } catch (err) { next(err); }
};

export const getDoctorReviews = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reviews = await prisma.review.findMany({
      where: { doctorId: req.params.id },
      include: { patient: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: reviews });
  } catch (err) { next(err); }
};
