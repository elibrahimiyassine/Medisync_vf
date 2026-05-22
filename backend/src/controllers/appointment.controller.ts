import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';
import { emitToUser } from '../utils/socket';
import { sendAppointmentConfirmation } from '../utils/email';

export const getAppointments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { role, userId } = req.user!;
    const { status, date, doctorId } = req.query;

    let where: any = {};

    if (role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({ where: { userId } });
      where.patientId = patient!.id;
    } else if (role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({ where: { userId } });
      where.doctorId = doctor!.id;
    }

    if (status) where.status = status;
    if (doctorId) where.doctorId = doctorId;
    if (date) {
      const d = new Date(date as string);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      where.slot = { date: { gte: d, lt: next } };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: { select: { firstName: true, lastName: true, dateOfBirth: true, bloodType: true } },
        doctor: { select: { firstName: true, lastName: true, specialty: true, avatar: true } },
        slot: true,
      },
      orderBy: { slot: { date: 'asc' } },
    });

    res.json({ success: true, data: appointments });
  } catch (err) { next(err); }
};

export const getAppointmentById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.id },
      include: {
        patient: true,
        doctor: true,
        slot: true,
        medicalRecord: { include: { prescription: true } },
        invoice: true,
        review: true,
      },
    });
    if (!appointment) throw new AppError('Appointment not found', 404);
    res.json({ success: true, data: appointment });
  } catch (err) { next(err); }
};

export const createAppointment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { patientId, doctorId, slotId, motif, notes } = req.body;
    const io = req.app.get('io');

    const slot = await prisma.timeSlot.findUnique({ where: { id: slotId } });
    if (!slot || !slot.isAvailable) throw new AppError('Time slot not available', 409);

    let resolvedPatientId = patientId;
    if (req.user!.role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({ where: { userId: req.user!.userId } });
      resolvedPatientId = patient!.id;
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: resolvedPatientId,
        doctorId,
        slotId,
        motif,
        notes,
        secretaryId: req.user!.role === 'SECRETARY'
          ? (await prisma.secretary.findUnique({ where: { userId: req.user!.userId } }))?.id
          : undefined,
        status: req.user!.role === 'PATIENT' ? 'PENDING' : 'CONFIRMED',
      },
      include: {
        patient: { include: { user: true } },
        doctor: true,
        slot: true,
      },
    });

    await prisma.timeSlot.update({ where: { id: slotId }, data: { isAvailable: false } });

    // Notify doctor
    emitToUser(io, appointment.doctor.userId, 'new_appointment', appointment);

    // Create notification
    await prisma.notification.create({
      data: {
        userId: appointment.doctor.userId,
        message: `New appointment request from ${appointment.patient.firstName} ${appointment.patient.lastName}`,
        type: 'APPOINTMENT_BOOKED',
        data: { appointmentId: appointment.id },
      },
    });

    // Send email confirmation
    await sendAppointmentConfirmation(
      appointment.patient.user.email,
      `${appointment.patient.firstName} ${appointment.patient.lastName}`,
      `${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
      new Date(appointment.slot.date).toLocaleDateString('fr-FR'),
      appointment.slot.startTime
    );

    res.status(201).json({ success: true, data: appointment });
  } catch (err) { next(err); }
};

export const updateAppointment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, notes, motif } = req.body;
    const io = req.app.get('io');

    const appointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data: { status, notes, motif },
      include: { patient: { include: { user: true } }, doctor: true, slot: true },
    });

    if (status === 'CANCELLED') {
      await prisma.timeSlot.update({ where: { id: appointment.slotId }, data: { isAvailable: true } });
    }

    // Notify patient
    emitToUser(io, appointment.patient.userId, 'appointment_updated', appointment);

    await prisma.notification.create({
      data: {
        userId: appointment.patient.userId,
        message: `Your appointment on ${new Date(appointment.slot.date).toLocaleDateString('fr-FR')} has been ${status?.toLowerCase()}`,
        type: status === 'CONFIRMED' ? 'APPOINTMENT_CONFIRMED' : 'APPOINTMENT_CANCELLED',
        data: { appointmentId: appointment.id },
      },
    });

    res.json({ success: true, data: appointment });
  } catch (err) { next(err); }
};

export const cancelAppointment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' },
      include: { slot: true },
    });

    await prisma.timeSlot.update({ where: { id: appointment.slotId }, data: { isAvailable: true } });

    res.json({ success: true, message: 'Appointment cancelled' });
  } catch (err) { next(err); }
};
