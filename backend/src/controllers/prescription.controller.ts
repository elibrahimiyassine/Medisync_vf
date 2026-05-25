import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';
import { generatePrescriptionPDF } from '../utils/pdf';

// Normalize to array format for storage; accept both single-med and array
function normalizeMedications(body: any): any[] {
  if (Array.isArray(body.medications) && body.medications.length > 0) {
    return body.medications;
  }
  if (body.medication) {
    return [{ name: body.medication, dosage: body.dosage || '', frequency: body.frequency || '', duration: body.duration || '' }];
  }
  return [];
}

// Add flat compat fields so frontend can read medication/dosage/duration directly
function withFlatFields(rx: any): any {
  const meds = (rx.medications as any[]) || [];
  const first = meds[0] || {};
  return {
    ...rx,
    medication:   first.name     || '',
    dosage:       first.dosage   || '',
    duration:     first.duration || '',
    status:       rx.status ?? 'ACTIVE',
  };
}

export const createPrescription = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { medicalRecordId, patientId, instructions, expiresAt } = req.body;
    const doctor = await prisma.doctor.findUnique({ where: { userId: req.user!.userId } });
    if (!doctor) throw new AppError('Doctor not found', 404);

    const medications = normalizeMedications(req.body);

    // patientId can be an email or UUID — try both
    let resolvedPatientId = patientId;
    if (patientId && !patientId.includes('-')) {
      const byEmail = await prisma.patient.findFirst({ where: { user: { email: patientId } } });
      if (byEmail) resolvedPatientId = byEmail.id;
    }

    const prescription = await prisma.prescription.create({
      data: {
        ...(medicalRecordId && { medicalRecordId }),
        doctorId:    doctor.id,
        patientId:   resolvedPatientId,
        medications,
        instructions,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      },
      include: { patient: { include: { user: true } }, doctor: true },
    });

    await prisma.notification.create({
      data: {
        userId:  prescription.patient.userId,
        message: `Nouvelle ordonnance émise par Dr. ${doctor.firstName} ${doctor.lastName}`,
        type:    'PRESCRIPTION_ISSUED',
        data:    { prescriptionId: prescription.id },
      },
    });

    res.status(201).json({ success: true, data: withFlatFields(prescription) });
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
      include: {
        patient: { select: { firstName: true, lastName: true } },
        doctor:  { select: { firstName: true, lastName: true, specialty: true } },
      },
      orderBy: { issuedAt: 'desc' },
    });

    res.json({ success: true, data: prescriptions.map(withFlatFields) });
  } catch (err) { next(err); }
};

export const updatePrescription = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { medications, instructions, expiresAt } = req.body;
    const meds = medications !== undefined ? medications : normalizeMedications(req.body);
    const prescription = await prisma.prescription.update({
      where: { id: req.params.id },
      data: {
        ...(meds.length       && { medications: meds }),
        ...(instructions !== undefined && { instructions }),
        ...(expiresAt    !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
      },
    });
    res.json({ success: true, data: withFlatFields(prescription) });
  } catch (err) { next(err); }
};

export const deletePrescription = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await prisma.prescription.delete({ where: { id: req.params.id } });
    res.json({ success: true });
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
      patientName:  `${prescription.patient.firstName} ${prescription.patient.lastName}`,
      doctorName:   `${prescription.doctor.firstName} ${prescription.doctor.lastName}`,
      specialty:    prescription.doctor.specialty,
      date:         new Date(prescription.issuedAt).toLocaleDateString('fr-FR'),
      medications:  prescription.medications as any[],
      instructions: prescription.instructions || undefined,
    });
  } catch (err) { next(err); }
};
