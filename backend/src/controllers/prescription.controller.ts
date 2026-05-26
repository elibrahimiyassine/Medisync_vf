import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';
import { generatePrescriptionPDF } from '../utils/pdf';

export const createPrescription = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { medicalRecordId, patientId, medications, instructions, expiresAt } = req.body;
    const doctor = await prisma.doctor.findUnique({ where: { userId: req.user!.userId } });
    if (!doctor) throw new AppError('Doctor not found', 404);

    const prescription = await prisma.prescription.create({
      data: { medicalRecordId, doctorId: doctor.id, patientId, medications, instructions, expiresAt: expiresAt ? new Date(expiresAt) : undefined },
      include: { patient: { include: { user: true } }, doctor: true },
    });

    await prisma.notification.create({
      data: {
        userId: prescription.patient.userId,
        message: `New prescription issued by Dr. ${doctor.firstName} ${doctor.lastName}`,
        type: 'PRESCRIPTION_ISSUED',
        data: { prescriptionId: prescription.id },
      },
    });

    res.status(201).json({ success: true, data: prescription });
  } catch (err) { next(err); }
};

export const getPrescriptions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { role, userId } = req.user!;
    let where: any = {};

    if (role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({ where: { userId } });
      where.patientId = patient!.id;
    } else if (role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({ where: { userId } });
      where.doctorId = doctor!.id;
    }

    const prescriptions = await prisma.prescription.findMany({
      where,
      include: { patient: { select: { firstName: true, lastName: true } }, doctor: { select: { firstName: true, lastName: true, specialty: true } } },
      orderBy: { issuedAt: 'desc' },
    });
    res.json({ success: true, data: prescriptions });
  } catch (err) { next(err); }
};

export const getPrescriptionPDF = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const prescription = await prisma.prescription.findUnique({
      where: { id: req.params.id },
      include: { patient: true, doctor: true },
    });
    if (!prescription) throw new AppError('Prescription not found', 404);

    generatePrescriptionPDF(res, {
      patientName: `${prescription.patient.firstName} ${prescription.patient.lastName}`,
      doctorName: `${prescription.doctor.firstName} ${prescription.doctor.lastName}`,
      specialty: prescription.doctor.specialty,
      date: new Date(prescription.issuedAt).toLocaleDateString('fr-FR'),
      medications: prescription.medications as any[],
      instructions: prescription.instructions || undefined,
    });
  } catch (err) { next(err); }
};
