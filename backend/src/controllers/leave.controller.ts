import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getLeaves = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doctor = await prisma.doctor.findUnique({ where: { userId: req.user!.userId } });
    if (!doctor) throw new AppError('Doctor not found', 404);

    const leaves = await prisma.leave.findMany({
      where: { doctorId: doctor.id },
      orderBy: { startDate: 'asc' },
    });

    // Return in a format the frontend expects
    const formatted = leaves.map(l => ({
      id:          l.id,
      doctorEmail: doctor.userId, // frontend key, unused in display
      startDate:   l.startDate.toISOString().slice(0, 10),
      endDate:     l.endDate.toISOString().slice(0, 10),
      reason:      l.reason || '',
      createdAt:   l.createdAt.toISOString(),
    }));

    res.json({ success: true, data: formatted });
  } catch (err) { next(err); }
};

export const createLeave = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doctor = await prisma.doctor.findUnique({ where: { userId: req.user!.userId } });
    if (!doctor) throw new AppError('Doctor not found', 404);

    const { startDate, endDate, reason } = req.body;
    if (!startDate || !endDate) throw new AppError('startDate and endDate are required', 400);

    const leave = await prisma.leave.create({
      data: {
        doctorId:  doctor.id,
        startDate: new Date(startDate),
        endDate:   new Date(endDate),
        reason:    reason || '',
      },
    });

    // Also block time slots in that range
    await prisma.timeSlot.updateMany({
      where: { doctorId: doctor.id, isAvailable: true, date: { gte: new Date(startDate), lte: new Date(endDate) } },
      data:  { isAvailable: false },
    });

    res.status(201).json({
      success: true,
      data: {
        id:        leave.id,
        startDate: leave.startDate.toISOString().slice(0, 10),
        endDate:   leave.endDate.toISOString().slice(0, 10),
        reason:    leave.reason || '',
        createdAt: leave.createdAt.toISOString(),
      },
    });
  } catch (err) { next(err); }
};

export const deleteLeave = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doctor = await prisma.doctor.findUnique({ where: { userId: req.user!.userId } });
    if (!doctor) throw new AppError('Doctor not found', 404);

    const leave = await prisma.leave.findUnique({ where: { id: req.params.id } });
    if (!leave || leave.doctorId !== doctor.id) throw new AppError('Leave not found', 404);

    await prisma.leave.delete({ where: { id: req.params.id } });

    // Re-open slots (only if no appointment is booked on them)
    await prisma.timeSlot.updateMany({
      where: {
        doctorId:    doctor.id,
        isAvailable: false,
        date:        { gte: leave.startDate, lte: leave.endDate },
        appointment: null,
      },
      data: { isAvailable: true },
    });

    res.json({ success: true });
  } catch (err) { next(err); }
};
