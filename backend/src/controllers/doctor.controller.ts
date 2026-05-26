import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getAllDoctors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
<<<<<<< HEAD
    const { specialty, search, city } = req.query;
    const where: any = { isAvailable: true };
    if (specialty) where.specialty = { contains: specialty as string, mode: 'insensitive' };
    if (city)      where.city      = { contains: city as string,      mode: 'insensitive' };
    if (search) where.OR = [
      { firstName: { contains: search as string, mode: 'insensitive' } },
      { lastName:  { contains: search as string, mode: 'insensitive' } },
      { specialty: { contains: search as string, mode: 'insensitive' } },
      { city:      { contains: search as string, mode: 'insensitive' } },
=======
    const { specialty, search } = req.query;
    const where: any = { isAvailable: true };
    if (specialty) where.specialty = { contains: specialty as string, mode: 'insensitive' };
    if (search) where.OR = [
      { firstName: { contains: search as string, mode: 'insensitive' } },
      { lastName: { contains: search as string, mode: 'insensitive' } },
      { specialty: { contains: search as string, mode: 'insensitive' } },
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
    ];

    const doctors = await prisma.doctor.findMany({
      where,
      select: {
        id: true, firstName: true, lastName: true, specialty: true,
        languages: true, sectorType: true, consultationRate: true,
<<<<<<< HEAD
        bio: true, avatar: true, licenseNumber: true, city: true, address: true,
=======
        bio: true, avatar: true, licenseNumber: true,
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
        reviews: { select: { rating: true } },
      },
    });

    const doctorsWithRating = doctors.map(d => ({
      ...d,
      avgRating: d.reviews.length ? d.reviews.reduce((a, r) => a + r.rating, 0) / d.reviews.length : null,
      reviewCount: d.reviews.length,
    }));

    res.json({ success: true, data: doctorsWithRating });
  } catch (err) { next(err); }
};

export const getDoctorById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: req.params.id },
      include: {
        reviews: {
          include: { patient: { select: { firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
    if (!doctor) throw new AppError('Doctor not found', 404);
    res.json({ success: true, data: doctor });
  } catch (err) { next(err); }
};

export const getDoctorSlots = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { date } = req.query;
<<<<<<< HEAD
    const where: any = { doctorId: req.params.id, isAvailable: true };
=======
    const where: any = { doctorId: req.params.id };
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567

    if (date) {
      const d = new Date(date as string);
      const next = new Date(d);
      next.setDate(next.getDate() + 7);
      where.date = { gte: d, lt: next };
    }

    const slots = await prisma.timeSlot.findMany({
      where,
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
    res.json({ success: true, data: slots });
  } catch (err) { next(err); }
};

export const getDoctorAppointments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doctor = await prisma.doctor.findUnique({ where: { userId: req.user!.userId } });
    if (!doctor) throw new AppError('Doctor not found', 404);

    const appointments = await prisma.appointment.findMany({
      where: { doctorId: doctor.id },
      include: {
        patient: { select: { firstName: true, lastName: true, dateOfBirth: true, bloodType: true, allergies: true } },
        slot: true,
      },
      orderBy: { slot: { date: 'asc' } },
    });
    res.json({ success: true, data: appointments });
  } catch (err) { next(err); }
};

<<<<<<< HEAD
export const updateDoctorMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { firstName, lastName, specialty, languages, sectorType, consultationRate, bio, phone } = req.body;
    const doctor = await prisma.doctor.update({
      where: { userId: req.user!.userId },
      data: {
        ...(firstName    !== undefined && { firstName }),
        ...(lastName     !== undefined && { lastName }),
        ...(specialty    !== undefined && { specialty }),
        ...(languages    !== undefined && { languages }),
        ...(sectorType   !== undefined && { sectorType }),
        ...(consultationRate !== undefined && { consultationRate: Number(consultationRate) }),
        ...(bio          !== undefined && { bio }),
      },
    });
    res.json({ success: true, data: doctor });
  } catch (err) { next(err); }
};

=======
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
export const updateDoctor = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { firstName, lastName, specialty, languages, sectorType, consultationRate, bio } = req.body;
    const doctor = await prisma.doctor.update({
      where: { id: req.params.id },
      data: { firstName, lastName, specialty, languages, sectorType, consultationRate: Number(consultationRate), bio },
    });
    res.json({ success: true, data: doctor });
  } catch (err) { next(err); }
};

<<<<<<< HEAD
export const getDoctorProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { userId: req.user!.userId },
      include: { reviews: { select: { rating: true } } },
    });
    if (!doctor) throw new AppError('Doctor not found', 404);
    const avgRating = doctor.reviews.length
      ? doctor.reviews.reduce((a, r) => a + r.rating, 0) / doctor.reviews.length
      : null;
    res.json({ success: true, data: { ...doctor, avgRating, reviewCount: doctor.reviews.length } });
  } catch (err) { next(err); }
};

=======
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
export const getDoctorDashboard = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doctor = await prisma.doctor.findUnique({ where: { userId: req.user!.userId } });
    if (!doctor) throw new AppError('Doctor not found', 404);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayAppointments, totalPatients, pendingCount, completedToday] = await prisma.$transaction([
      prisma.appointment.findMany({
        where: { doctorId: doctor.id, slot: { date: { gte: today, lt: tomorrow } } },
        include: { patient: true, slot: true },
        orderBy: { slot: { startTime: 'asc' } },
      }),
      prisma.appointment.groupBy({ by: ['patientId'], where: { doctorId: doctor.id }, orderBy: { _count: { patientId: 'desc' } } }),
      prisma.appointment.count({ where: { doctorId: doctor.id, status: 'PENDING' } }),
      prisma.appointment.count({ where: { doctorId: doctor.id, status: 'COMPLETED', slot: { date: { gte: today, lt: tomorrow } } } }),
    ]);

    res.json({
      success: true,
      data: {
        todayAppointments,
        stats: { todayTotal: todayAppointments.length, totalPatients: totalPatients.length, pending: pendingCount, completedToday },
      },
    });
  } catch (err) { next(err); }
};
