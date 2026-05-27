import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getSlots = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { doctorId, date, dateFrom, dateTo } = req.query;

    // Doctor viewing their own planning: return ALL slots (booked + available) with appointment info
    const isDoctorOwnView = req.user?.role === 'DOCTOR' && !doctorId;

    let resolvedDoctorId: string | undefined;
    if (isDoctorOwnView) {
      const doctor = await prisma.doctor.findUnique({ where: { userId: req.user!.userId } });
      if (!doctor) throw new AppError('Doctor not found', 404);
      resolvedDoctorId = doctor.id;
    }

    const where: any = {};

    if (isDoctorOwnView) {
      where.doctorId = resolvedDoctorId;
      // no isAvailable filter — doctor sees all their slots (available + booked)
    } else {
      where.isAvailable = true;
      if (doctorId) where.doctorId = doctorId as string;
    }

    // Date range filtering
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom as string);
      if (dateTo) {
        const end = new Date(dateTo as string);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    } else if (date) {
      const d = new Date(date as string);
      const rangeEnd = new Date(d);
      // For doctor's own planning: return 7 days so week view works (day view filters locally via getSlotsForDay)
      rangeEnd.setDate(rangeEnd.getDate() + (isDoctorOwnView ? 7 : 1));
      where.date = { gte: d, lt: rangeEnd };
    }

    const slots = await prisma.timeSlot.findMany({
      where,
      ...(isDoctorOwnView ? {
        include: {
          appointment: {
            include: {
              patient: { select: { firstName: true, lastName: true } },
            },
          },
        },
      } : {}),
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

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
