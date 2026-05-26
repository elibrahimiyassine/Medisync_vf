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
<<<<<<< HEAD
    const { patientId, doctorId, slotId, motif, notes, slot: inlineSlot } = req.body;
    const io = req.app.get('io');

    // Resolve doctor: when a DOCTOR creates an urgency appointment, doctorId comes from their profile
    let resolvedDoctorId = doctorId;
    if (!resolvedDoctorId && req.user!.role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({ where: { userId: req.user!.userId } });
      if (!doctor) throw new AppError('Doctor not found', 404);
      resolvedDoctorId = doctor.id;
    }

    // Resolve slot: create on-the-fly for urgency appointments (no slotId sent)
    let resolvedSlotId = slotId;
    if (!resolvedSlotId && inlineSlot) {
      const urgencySlot = await prisma.timeSlot.create({
        data: {
          doctorId: resolvedDoctorId,
          date: new Date(inlineSlot.date),
          startTime: inlineSlot.startTime,
          endTime: inlineSlot.startTime,
          duration: Number(inlineSlot.duration) || 30,
          isAvailable: false,
        },
      });
      resolvedSlotId = urgencySlot.id;
    }

    if (!resolvedSlotId) throw new AppError('Slot ID is required', 400);

    // For regular (non-urgency) bookings: verify slot is available and mark it taken
    if (!inlineSlot) {
      const slot = await prisma.timeSlot.findUnique({ where: { id: resolvedSlotId } });
      if (!slot || !slot.isAvailable) throw new AppError('Time slot not available', 409);
      await prisma.timeSlot.update({ where: { id: resolvedSlotId }, data: { isAvailable: false } });
    }
=======
    const { patientId, doctorId, slotId, motif, notes } = req.body;
    const io = req.app.get('io');

    const slot = await prisma.timeSlot.findUnique({ where: { id: slotId } });
    if (!slot || !slot.isAvailable) throw new AppError('Time slot not available', 409);
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567

    let resolvedPatientId = patientId;
    if (req.user!.role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({ where: { userId: req.user!.userId } });
      resolvedPatientId = patient!.id;
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: resolvedPatientId,
<<<<<<< HEAD
        doctorId: resolvedDoctorId,
        slotId: resolvedSlotId,
        motif: motif || 'Urgence médicale',
=======
        doctorId,
        slotId,
        motif,
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
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

<<<<<<< HEAD
    // Notify doctor
    emitToUser(io, appointment.doctor.userId, 'new_appointment', appointment);

    await prisma.notification.create({
      data: {
        userId: appointment.doctor.userId,
        message: `Nouveau rendez-vous de ${appointment.patient.firstName} ${appointment.patient.lastName}`,
=======
    await prisma.timeSlot.update({ where: { id: slotId }, data: { isAvailable: false } });

    // Notify doctor
    emitToUser(io, appointment.doctor.userId, 'new_appointment', appointment);

    // Create notification
    await prisma.notification.create({
      data: {
        userId: appointment.doctor.userId,
        message: `New appointment request from ${appointment.patient.firstName} ${appointment.patient.lastName}`,
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
        type: 'APPOINTMENT_BOOKED',
        data: { appointmentId: appointment.id },
      },
    });

<<<<<<< HEAD
    // Notify all secretaries
    const secretaries = await prisma.secretary.findMany({ select: { userId: true } });
    if (secretaries.length > 0) {
      const slotDate = new Date(appointment.slot.date).toLocaleDateString('fr-FR');
      await prisma.notification.createMany({
        data: secretaries.map(s => ({
          userId: s.userId,
          message: `Nouveau RDV : ${appointment.patient.firstName} ${appointment.patient.lastName} avec Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName} le ${slotDate} à ${appointment.slot.startTime}`,
          type: 'APPOINTMENT_BOOKED',
          data: { appointmentId: appointment.id },
        })),
      });
      secretaries.forEach(s => emitToUser(io, s.userId, 'new_appointment', appointment));
    }

=======
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
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
