import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';
<<<<<<< HEAD
import { RequestHandler } from 'express';

export const getRecords = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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

    const records = await prisma.medicalRecord.findMany({
      where,
      include: {
        doctor: { select: { firstName: true, lastName: true, specialty: true } },
        patient: { select: { firstName: true, lastName: true } },
        prescription: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: records });
  } catch (err) { next(err); }
};
=======
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567

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
<<<<<<< HEAD

export const uploadRecordDocument: RequestHandler = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const file = (req as any).file;
    if (!file) throw new AppError('No file uploaded', 400);

    const record = await prisma.medicalRecord.findUnique({ where: { id: req.params.id }, select: { patientId: true } });
    if (!record) throw new AppError('Record not found', 404);

    const ext = file.originalname.split('.').pop()?.toLowerCase() ?? '';
    const documentType = req.body.documentType
      || (['dcm', 'dicom'].includes(ext) ? 'IMAGING' : 'CONSULTATION');

    const document = await prisma.document.create({
      data: {
        patientId:    record.patientId,
        uploadedBy:   req.user!.userId,
        fileUrl:      `/uploads/${file.filename}`,
        fileType:     file.mimetype,
        fileName:     file.originalname,
        fileSize:     file.size,
        documentType,
      },
    });
    res.status(201).json({ success: true, data: document });
  } catch (err) { next(err); }
};
=======
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
