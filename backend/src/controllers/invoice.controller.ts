import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';
import { generateInvoicePDF, generateFeuilleSoinsPDF } from '../utils/pdf';
import { sendInvoiceEmail } from '../utils/email';
import { v4 as uuidv4 } from 'uuid';

export const createInvoice = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { patientId, appointmentId, acts, dueDate } = req.body;
    const amount = acts.reduce((sum: number, act: any) => sum + act.amount, 0);

    const invoice = await prisma.invoice.create({
      data: { patientId, appointmentId, acts, amount, dueDate: dueDate ? new Date(dueDate) : undefined },
      include: { patient: { include: { user: true } }, appointment: { include: { slot: true } } },
    });

    await prisma.notification.create({
      data: {
        userId: invoice.patient.userId,
        message: `New invoice of €${amount.toFixed(2)} issued`,
        type: 'INVOICE_ISSUED',
        data: { invoiceId: invoice.id },
      },
    });

    res.status(201).json({ success: true, data: invoice });
  } catch (err) { next(err); }
};

export const getInvoices = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { role, userId } = req.user!;
    let where: any = {};

    if (role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({ where: { userId } });
      where.patientId = patient!.id;
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: { patient: { select: { firstName: true, lastName: true } }, appointment: { include: { doctor: true, slot: true } } },
      orderBy: { issuedAt: 'desc' },
    });
    res.json({ success: true, data: invoices });
  } catch (err) { next(err); }
};

export const updateInvoice = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = req.body;
    const invoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data: { status, paidAt: status === 'PAID' ? new Date() : undefined },
    });
    res.json({ success: true, data: invoice });
  } catch (err) { next(err); }
};

export const getFeuilleSoins = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: { patient: true, appointment: { include: { doctor: true } } },
    });
    if (!invoice) throw new AppError('Invoice not found', 404);

    generateFeuilleSoinsPDF(res, {
      invoiceNumber: invoice.id.slice(0, 8).toUpperCase(),
      patientName: `${invoice.patient.firstName} ${invoice.patient.lastName}`,
      patientDob: invoice.patient.dateOfBirth ? new Date(invoice.patient.dateOfBirth).toLocaleDateString('fr-FR') : '',
      patientSsn: invoice.patient.socialSecurityNumber || '',
      doctorName: `${invoice.appointment.doctor.firstName} ${invoice.appointment.doctor.lastName}`,
      doctorSpecialty: invoice.appointment.doctor.specialty,
      doctorLicense: invoice.appointment.doctor.licenseNumber || '',
      doctorAddress: invoice.appointment.doctor.address || '',
      date: new Date(invoice.issuedAt).toLocaleDateString('fr-FR'),
      acts: invoice.acts as Array<{ description: string; amount: number }>,
      total: invoice.amount,
      sectorType: invoice.appointment.doctor.sectorType,
    });
  } catch (err) { next(err); }
};

export const sendInvoiceByEmail = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: { patient: { include: { user: true } }, appointment: { include: { doctor: true } } },
    });
    if (!invoice) throw new AppError('Invoice not found', 404);
    await sendInvoiceEmail(
      invoice.patient.user.email,
      `${invoice.patient.firstName} ${invoice.patient.lastName}`,
      `${invoice.appointment.doctor.firstName} ${invoice.appointment.doctor.lastName}`,
      new Date(invoice.issuedAt).toLocaleDateString('fr-FR'),
      invoice.id.slice(0, 8).toUpperCase(),
      invoice.amount,
      invoice.acts as Array<{ description: string; amount: number }>,
    );
    res.json({ success: true, message: 'Facture envoyée par e-mail' });
  } catch (err) { next(err); }
};

export const getInvoicePDF = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: { patient: true, appointment: { include: { doctor: true } } },
    });
    if (!invoice) throw new AppError('Invoice not found', 404);

    generateInvoicePDF(res, {
      invoiceNumber: invoice.id.slice(0, 8).toUpperCase(),
      patientName: `${invoice.patient.firstName} ${invoice.patient.lastName}`,
      doctorName: `${invoice.appointment.doctor.firstName} ${invoice.appointment.doctor.lastName}`,
      date: new Date(invoice.issuedAt).toLocaleDateString('fr-FR'),
      acts: invoice.acts as any[],
      total: invoice.amount,
      status: invoice.status,
    });
  } catch (err) { next(err); }
};
