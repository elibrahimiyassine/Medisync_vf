import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { userId: req.user!.userId },
      include: {
        user: { select: { email: true, createdAt: true } },
        appointments: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { doctor: true, slot: true },
        },
        prescriptions: { orderBy: { issuedAt: 'desc' }, take: 3 },
      },
    });
    if (!patient) throw new AppError('Patient not found', 404);
    res.json({ success: true, data: patient });
  } catch (err) { next(err); }
};

export const updateMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      firstName, lastName, phone, address, dateOfBirth, bloodType, allergies,
      emergencyContact, emergencyPhone,
      guardianName, guardianPhone, guardianRelationship,
    } = req.body;

    const patient = await prisma.patient.update({
      where: { userId: req.user!.userId },
      data: {
        firstName, lastName, phone, address,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        bloodType, allergies, emergencyContact, emergencyPhone,
        guardianName, guardianPhone, guardianRelationship,
      },
    });
    res.json({ success: true, data: patient });
  } catch (err) { next(err); }
};

export const getPatientById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { email: true, createdAt: true } },
        medicalRecords: { orderBy: { createdAt: 'desc' }, include: { doctor: true, prescription: true } },
        appointments: { orderBy: { createdAt: 'desc' }, include: { doctor: true, slot: true }, take: 10 },
        documents: { orderBy: { uploadedAt: 'desc' } },
        invoices: { orderBy: { issuedAt: 'desc' } },
      },
    });
    if (!patient) throw new AppError('Patient not found', 404);
    res.json({ success: true, data: patient });
  } catch (err) { next(err); }
};

export const getAllPatients = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = search ? {
      OR: [
        { firstName: { contains: search as string, mode: 'insensitive' as const } },
        { lastName: { contains: search as string, mode: 'insensitive' as const } },
        { user: { email: { contains: search as string, mode: 'insensitive' as const } } },
      ],
    } : {};

    const [patients, total] = await prisma.$transaction([
      prisma.patient.findMany({ where, skip, take: Number(limit), include: { user: { select: { email: true } } }, orderBy: { createdAt: 'desc' } }),
      prisma.patient.count({ where }),
    ]);

    res.json({ success: true, data: patients, meta: { total, page: Number(page), limit: Number(limit) } });
  } catch (err) { next(err); }
};

export const getPatientRecords = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const records = await prisma.medicalRecord.findMany({
      where: { patientId: req.params.id },
      include: { doctor: true, appointment: { include: { slot: true } }, prescription: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: records });
  } catch (err) { next(err); }
};

export const getLabResults = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Lab results are stored as documents of type LAB_RESULT or embedded in medical records vitals.
    // Return an empty array until a dedicated lab module is built.
    res.json({ success: true, data: [] });
  } catch (err) { next(err); }
};

export const signalSymptom = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { urgency, description, doctorId } = req.body;
    const patient = await prisma.patient.findUnique({ where: { userId: req.user!.userId } });

    if (doctorId) {
      const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
      if (doctor) {
        await prisma.notification.create({
          data: {
            userId:  doctor.userId,
            message: `Signalement ${urgency || 'INFO'} de ${patient?.firstName || 'un patient'} : ${description || ''}`,
            type:    'SYSTEM',
            data:    { urgency, description, patientId: patient?.id },
          },
        });
      }
    }

    res.json({ success: true, message: 'Signal envoyé' });
  } catch (err) { next(err); }
};

export const uploadDocument = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const file = req.file;
    if (!file) throw new AppError('No file uploaded', 400);

    const document = await prisma.document.create({
      data: {
        patientId: req.params.id,
        uploadedBy: req.user!.userId,
        fileUrl: `/uploads/${file.filename}`,
        fileType: file.mimetype,
        fileName: file.originalname,
        fileSize: file.size,
        documentType: req.body.documentType || 'OTHER',
      },
    });
    res.status(201).json({ success: true, data: document });
  } catch (err) { next(err); }
};
