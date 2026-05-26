import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

// ── Stats ──────────────────────────────────────────────────────────────────────
export const getStats = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalPatients, totalDoctors, totalAppointments,
      monthAppointments, pendingInvoices, totalRevenue,
      noShowCount, appointmentsByStatus,
    ] = await prisma.$transaction([
      prisma.patient.count(),
      prisma.doctor.count(),
      prisma.appointment.count(),
      prisma.appointment.count({ where: { createdAt: { gte: thisMonth } } }),
      prisma.invoice.count({ where: { status: 'PENDING' } }),
      prisma.invoice.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
      prisma.appointment.count({ where: { status: 'NO_SHOW' } }),
      prisma.appointment.groupBy({ by: ['status'], _count: true, orderBy: { _count: { status: 'desc' } } }),
    ]);

    res.json({
      success: true,
      data: {
        totalPatients, totalDoctors, totalAppointments, monthAppointments,
        pendingInvoices, totalRevenue: totalRevenue._sum.amount || 0,
        noShowRate: totalAppointments ? Math.round((noShowCount / totalAppointments) * 100) : 0,
        appointmentsByStatus,
      },
    });
  } catch (err) { next(err); }
};

// ── Audit Logs ─────────────────────────────────────────────────────────────────
export const getAuditLogs = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 500, action } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};
    if (action) where.action = { contains: action as string, mode: 'insensitive' };

    const [logs, total] = await prisma.$transaction([
      prisma.auditLog.findMany({
        where, skip, take: Number(limit),
        include: { user: { select: { email: true, role: true } } },
        orderBy: { timestamp: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ]);

    // Normalise field name (timestamp → createdAt) for frontend
    const normalised = logs.map((l: any) => ({ ...l, createdAt: l.timestamp }));
    res.json({ success: true, data: normalised, meta: { total, page: Number(page) } });
  } catch (err) { next(err); }
};

// ── Staff ──────────────────────────────────────────────────────────────────────
export const getStaff = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [doctors, secretaries] = await prisma.$transaction([
      prisma.doctor.findMany({
        include: { user: { select: { id: true, email: true, isActive: true, createdAt: true } } },
      }),
      prisma.secretary.findMany({
        include: { user: { select: { id: true, email: true, isActive: true, createdAt: true } } },
      }),
    ]);

    // Return unified array — each item has role, id = profile record id
    const staff = [
      ...doctors.map((d: any) => ({ ...d, role: 'DOCTOR' })),
      ...secretaries.map((s: any) => ({ ...s, role: 'SECRETARY' })),
    ];

    res.json({ success: true, data: staff });
  } catch (err) { next(err); }
};

export const createStaff = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, role, firstName, lastName, specialty, sectorType, consultationRate, bio, phone } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError('Email already exists', 409);

    if (!password) throw new AppError('Password is required', 400);
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email, passwordHash, role,
        ...(role === 'DOCTOR' && {
          doctor: {
            create: {
              firstName, lastName,
              specialty: specialty || 'General Medicine',
              sectorType: sectorType || 'SECTOR_1',
              consultationRate: Number(consultationRate) || 50,
              bio: bio || '',
            },
          },
        }),
        ...(role === 'SECRETARY' && {
          secretary: { create: { firstName, lastName, phone: phone || '' } },
        }),
      },
      include: { doctor: true, secretary: true },
    });

    res.status(201).json({ success: true, data: user });
  } catch (err) { next(err); }
};

export const updateStaff = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { firstName, lastName, phone, specialty, email } = req.body;
    const profileId = req.params.id;

    // Try doctor first, then secretary
    const doctor = await prisma.doctor.findUnique({ where: { id: profileId } });
    if (doctor) {
      await prisma.doctor.update({
        where: { id: profileId },
        data: { firstName, lastName, ...(specialty && { specialty }) },
      });
      if (email) await prisma.user.update({ where: { id: doctor.userId }, data: { email } });
      return res.json({ success: true, message: 'Staff updated' }) as any;
    }

    const secretary = await prisma.secretary.findUnique({ where: { id: profileId } });
    if (secretary) {
      await prisma.secretary.update({
        where: { id: profileId },
        data: { firstName, lastName, ...(phone && { phone }) },
      });
      if (email) await prisma.user.update({ where: { id: secretary.userId }, data: { email } });
      return res.json({ success: true, message: 'Staff updated' }) as any;
    }

    throw new AppError('Staff member not found', 404);
  } catch (err) { next(err); }
};

export const deleteStaff = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const profileId = req.params.id;

    const doctor = await prisma.doctor.findUnique({ where: { id: profileId } });
    if (doctor) {
      await prisma.user.update({ where: { id: doctor.userId }, data: { isActive: false } });
      return res.json({ success: true, message: 'Staff deactivated' }) as any;
    }

    const secretary = await prisma.secretary.findUnique({ where: { id: profileId } });
    if (secretary) {
      await prisma.user.update({ where: { id: secretary.userId }, data: { isActive: false } });
      return res.json({ success: true, message: 'Staff deactivated' }) as any;
    }

    throw new AppError('Staff member not found', 404);
  } catch (err) { next(err); }
};

// ── Finance ────────────────────────────────────────────────────────────────────
export const getFinanceReport = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { month } = req.query as { month?: string };

    let startDate: Date, endDate: Date;
    if (month) {
      const [y, m] = month.split('-').map(Number);
      startDate = new Date(y, m - 1, 1);
      endDate   = new Date(y, m, 0, 23, 59, 59, 999);
    } else {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    const invoices = await prisma.invoice.findMany({
      where: { issuedAt: { gte: startDate, lte: endDate } },
      include: {
        patient: { select: { firstName: true, lastName: true } },
        appointment: {
          include: {
            doctor: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });

    const paid    = invoices.filter((i: any) => i.status === 'PAID');
    const pending = invoices.filter((i: any) => i.status === 'PENDING');

    const totalRevenue   = paid.reduce((s: number, i: any) => s + Number(i.amount), 0);
    const pendingRevenue = pending.reduce((s: number, i: any) => s + Number(i.amount), 0);
    const avgAmount      = invoices.length ? (totalRevenue + pendingRevenue) / invoices.length : 0;

    // Revenue grouped by doctor
    const doctorMap: Record<string, { doctorId: string; doctorName: string; revenue: number }> = {};
    paid.forEach((inv: any) => {
      const doc = inv.appointment?.doctor;
      if (!doc) return;
      const key = inv.appointment?.doctorId || 'unknown';
      if (!doctorMap[key]) doctorMap[key] = { doctorId: key, doctorName: `${doc.firstName} ${doc.lastName}`, revenue: 0 };
      doctorMap[key].revenue += Number(inv.amount);
    });
    const byDoctor = Object.values(doctorMap).sort((a, b) => b.revenue - a.revenue);

    res.json({
      success: true,
      data: {
        summary: { totalRevenue, paidCount: paid.length, pendingRevenue, avgAmount, byDoctor },
        invoices,
      },
    });
  } catch (err) { next(err); }
};

// ── Settings ───────────────────────────────────────────────────────────────────
const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json');

const defaultSettings = {
  clinicName: 'MediSync Clinic',
  address: '',
  phone: '',
  email: '',
  timezone: 'Europe/Paris',
  apptDuration: 30,
  maxApptPerDay: 20,
  cancelWindow: 24,
  autoConfirm: false,
  emailReminders: true,
  currency: 'EUR',
  defaultFee: 50,
  vatRate: 20,
  invoiceNote: 'Thank you for your visit. Payment due within 30 days.',
  require2FA: false,
  ipAllowlist: false,
  sessionTimeout: 60,
  maxLoginAttempts: 5,
};

function readSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      return { ...defaultSettings, ...JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8')) };
    }
  } catch { /* ignore */ }
  return { ...defaultSettings };
}

function writeSettings(data: any) {
  const dir = path.dirname(SETTINGS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2));
}

export const getSettings = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.json({ success: true, data: readSettings() });
  } catch (err) { next(err); }
};

export const updateSettings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const current = readSettings();
    const updated = { ...current, ...req.body };
    writeSettings(updated);
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};
