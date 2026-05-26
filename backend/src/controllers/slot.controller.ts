import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getSlots = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { doctorId, date } = req.query;
    const where: any = { isAvailable: true };
    if (doctorId) where.doctorId = doctorId;
    if (date) {
      const d = new Date(date as string);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      where.date = { gte: d, lt: next };
    }
    const slots = await prisma.timeSlot.findMany({ where, orderBy: [{ date: 'asc' }, { startTime: 'asc' }] });
    res.json({ success: true, data: slots });
  } catch (err) { next(err); }
};

export const createSlot = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doctor = await prisma.doctor.findUnique({ where: { userId: req.user!.userId } });
    if (!doctor) throw new AppError('Doctor not found', 404);

    const { dates, startTime, endTime, duration } = req.body;
    const slots = [];

    for (const dateStr of dates) {
      try {
        const slot = await prisma.timeSlot.create({
          data: { doctorId: doctor.id, date: new Date(dateStr), startTime, endTime, duration },
        });
        slots.push(slot);
      } catch {}
    }

    res.status(201).json({ success: true, data: slots });
  } catch (err) { next(err); }
};

export const deleteSlot = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const slot = await prisma.timeSlot.findUnique({ where: { id: req.params.id } });
    if (!slot) throw new AppError('Slot not found', 404);
    if (!slot.isAvailable) throw new AppError('Cannot delete a booked slot', 409);
    await prisma.timeSlot.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
};
