import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createRecord = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { patientId, appointmentId, diagnosis, notes, symptoms, vitals } = req.body;
    const doctor = await prisma.doctor.findUnique({ where: { userId: req.user!.userId } });
    if (!doctor) throw new AppError('Doctor not found', 404);

    const record = await prisma.medicalRecord.create({
      data: { patientId, doctorId: doctor.id, appointmentId, diagnosis, notes, symptoms: symptoms || [], vitals },
      include: { patient: true, appointment: { include: { slot: true } } },
    });

    await prisma.appointment.update({ where: { id: appointmentId }, data: { status: 'COMPLETED' } });

    res.status(201).json({ success: true, data: record });
  } catch (err) { next(err); }
};

export const getRecord = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const record = await prisma.medicalRecord.findUnique({
      where: { id: req.params.id },
      include: { patient: true, doctor: true, prescription: true, appointment: { include: { slot: true } } },
    });
    if (!record) throw new AppError('Record not found', 404);
    res.json({ success: true, data: record });
  } catch (err) { next(err); }
};

export const updateRecord = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { diagnosis, notes, symptoms, vitals } = req.body;
    const record = await prisma.medicalRecord.update({
      where: { id: req.params.id },
      data: { diagnosis, notes, symptoms, vitals },
    });
    res.json({ success: true, data: record });
  } catch (err) { next(err); }
};
