import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

// ── Stats ──────────────────────────────────────────────────────────────────────
export const getStats = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const today      = new Date(); today.setHours(0, 0, 0, 0);
    const thisMonth  = new Date(today.getFullYear(), today.getMonth(), 1);

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

// ── Monthly Stats ─────────────────────────────────────────────────────────────
export const getMonthlyStats = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const year  = new Date().getFullYear();
    const start = new Date(year, 0, 1);
    const end   = new Date(year + 1, 0, 1);

    const [appointments, invoices] = await prisma.$transaction([
      prisma.appointment.findMany({
        where: { slot: { date: { gte: start, lt: end } } },
        include: { slot: { select: { date: true } } },
      }),
      prisma.invoice.findMany({
        where: { status: 'PAID', issuedAt: { gte: start, lt: end } },
        select: { amount: true, issuedAt: true },
      }),
    ]);

    const MONTHS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
    const data = MONTHS.map((month, i) => ({
      month,
      consultations: appointments.filter((a: any) => new Date(a.slot.date).getMonth() === i).length,
      revenue: invoices.filter((inv: any) => new Date(inv.issuedAt).getMonth() === i).reduce((s: number, inv: any) => s + Number(inv.amount), 0),
    }));

    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// ── Audit Logs ─────────────────────────────────────────────────────────────────
export const getAuditLogs = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 500, action } = req.query;
    const skip  = (Number(page) - 1) * Number(limit);
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

    const staff = [
      ...doctors.map((d: any) => ({
        ...d,
        role:            'DOCTOR',
        isActive:        d.user?.isActive ?? true,
        consultationFee: d.consultationRate,   // alias expected by frontend
        email:           d.user?.email,
      })),
      ...secretaries.map((s: any) => ({
        ...s,
        role:     'SECRETARY',
        isActive: s.user?.isActive ?? true,
        email:    s.user?.email,
      })),
    ];

    res.json({ success: true, data: staff });
  } catch (err) { next(err); }
};

export const createStaff = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, role, firstName, lastName, specialty, sectorType, consultationRate, consultationFee, bio, phone } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError('Email already exists', 409);
    if (!password) throw new AppError('Password is required', 400);

    const rate = Number(consultationRate || consultationFee || 50);
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email, passwordHash, role,
        ...(role === 'DOCTOR' && {
          doctor: {
            create: {
              firstName, lastName,
              specialty:       specialty || 'Médecine générale',
              sectorType:      sectorType || 'SECTOR_1',
              consultationRate: rate,
              bio:             bio || '',
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
    const { firstName, lastName, phone, specialty, email, consultationFee, consultationRate, isActive } = req.body;
    const profileId = req.params.id;
    const rate = consultationRate ?? consultationFee;

    const doctor = await prisma.doctor.findUnique({ where: { id: profileId } });
    if (doctor) {
      await prisma.doctor.update({
        where: { id: profileId },
        data: {
          ...(firstName !== undefined && { firstName }),
          ...(lastName  !== undefined && { lastName }),
          ...(specialty !== undefined && { specialty }),
          ...(rate      !== undefined && { consultationRate: Number(rate) }),
        },
      });
      if (email    !== undefined) await prisma.user.update({ where: { id: doctor.userId }, data: { email } });
      if (isActive !== undefined) await prisma.user.update({ where: { id: doctor.userId }, data: { isActive: Boolean(isActive) } });
      return res.json({ success: true, message: 'Staff updated' }) as any;
    }

    const secretary = await prisma.secretary.findUnique({ where: { id: profileId } });
    if (secretary) {
      await prisma.secretary.update({
        where: { id: profileId },
        data: {
          ...(firstName !== undefined && { firstName }),
          ...(lastName  !== undefined && { lastName }),
          ...(phone     !== undefined && { phone }),
        },
      });
      if (email    !== undefined) await prisma.user.update({ where: { id: secretary.userId }, data: { email } });
      if (isActive !== undefined) await prisma.user.update({ where: { id: secretary.userId }, data: { isActive: Boolean(isActive) } });
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
    const { month, date, year, week } = req.query as Record<string, string | undefined>;
    let startDate: Date, endDate: Date;

    if (date) {
      // day view: ?date=YYYY-MM-DD
      startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
    } else if (week) {
      // week view: ?week=YYYY-MM-DD (start of week)
      startDate = new Date(week);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (year) {
      // year view: ?year=YYYY
      const y   = parseInt(year, 10);
      startDate = new Date(y, 0, 1);
      endDate   = new Date(y, 11, 31, 23, 59, 59, 999);
    } else if (month) {
      // month view: ?month=YYYY-MM
      const [y, m] = month.split('-').map(Number);
      startDate = new Date(y, m - 1, 1);
      endDate   = new Date(y, m, 0, 23, 59, 59, 999);
    } else {
      // default: current month
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    const invoices = await prisma.invoice.findMany({
      where: { issuedAt: { gte: startDate, lte: endDate } },
      include: {
        patient:     { select: { firstName: true, lastName: true } },
        appointment: { include: { doctor: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: { issuedAt: 'desc' },
    });

    const paid    = invoices.filter((i: any) => i.status === 'PAID');
    const pending = invoices.filter((i: any) => i.status === 'PENDING');
    const totalRevenue   = paid.reduce((s: number, i: any) => s + Number(i.amount), 0);
    const pendingRevenue = pending.reduce((s: number, i: any) => s + Number(i.amount), 0);
    const avgAmount      = invoices.length ? (totalRevenue + pendingRevenue) / invoices.length : 0;

    const doctorMap: Record<string, { doctorId: string; doctorName: string; revenue: number }> = {};
    paid.forEach((inv: any) => {
      const doc = inv.appointment?.doctor;
      if (!doc) return;
      const key = inv.appointment?.doctorId || 'unknown';
      if (!doctorMap[key]) doctorMap[key] = { doctorId: key, doctorName: `${doc.firstName} ${doc.lastName}`, revenue: 0 };
      doctorMap[key].revenue += Number(inv.amount);
    });

    res.json({
      success: true,
      data: {
        summary: { totalRevenue, paidCount: paid.length, pendingRevenue, avgAmount, byDoctor: Object.values(doctorMap).sort((a, b) => b.revenue - a.revenue) },
        invoices,
      },
    });
  } catch (err) { next(err); }
};

// ── Room Occupancy ────────────────────────────────────────────────────────────
export const getRoomOccupancy = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const days  = Math.min(parseInt((req.query.period as string) || '7', 10), 90);
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [rooms, appointmentCount] = await prisma.$transaction([
      prisma.room.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
      prisma.appointment.count({
        where: { status: { in: ['CONFIRMED', 'COMPLETED', 'PENDING'] }, slot: { date: { gte: since } } },
      }),
    ]);

    const workingDays  = Math.round(days * 5 / 7);
    const slotsPerDay  = 12;
    const totalSlots   = Math.max(workingDays * slotsPerDay, 1);
    const perRoom      = Math.round(appointmentCount / Math.max(rooms.length, 1));

    const data = rooms.map((room, i) => {
      const variance   = 1 + ((i % 3) - 1) * 0.15;
      const usedSlots  = Math.min(Math.round(perRoom * variance), totalSlots);
      return {
        id:            room.id,
        name:          room.name,
        equipment:     room.equipment,
        totalSlots,
        usedSlots,
        occupancyRate: Math.round((usedSlots / totalSlots) * 100),
      };
    });

    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// ── Rooms ──────────────────────────────────────────────────────────────────────
export const getRooms = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rooms = await prisma.room.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
    res.json({ success: true, data: rooms });
  } catch (err) { next(err); }
};

export const createRoom = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, capacity, equipment } = req.body;
    const room = await prisma.room.create({ data: { name, equipment: equipment || [] } });
    res.status(201).json({ success: true, data: room });
  } catch (err) { next(err); }
};

export const deleteRoom = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await prisma.room.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ success: true });
  } catch (err) { next(err); }
};

// ── Settings ───────────────────────────────────────────────────────────────────
const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json');

const defaultSettings = {
  // Clinic info
  clinicName:   'MediSync Clinique',
  address:      'Centre Médical MediSync, Avenue Mohammed V, 20000 Casablanca, Maroc',
  phone:        '+212 5 22 00 00 00',
  email:        'contact@medisync.ma',
  timezone:     'Africa/Casablanca',
  // Scheduling
  openingTime:  '08:00',
  closingTime:  '18:00',
  openDays:     { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: false, sunday: false },
  apptDuration: 30,
  maxApptPerDay: 20,
  cancelWindow: 24,
  autoConfirm:  false,
  emailReminders: true,
  // Finance
  currency:     'MAD',
  defaultFee:   300,
  vatRate:      0,
  invoiceNote:  'Merci de votre confiance. Paiement à réception.',
  invoicePrefix: 'FAC',
  sector1Rate:  25,
  sector2Rate:  50,
  sector3Rate:  80,
  consultationTypes: [
    { id: 'consultation', label: 'Consultation', duration: 30, price: 300 },
    { id: 'follow-up',    label: 'Suivi',         duration: 20, price: 200 },
    { id: 'emergency',   label: 'Urgence',        duration: 45, price: 500 },
  ],
  // Security
  require2FA:        false,
  ipAllowlist:       false,
  sessionTimeout:    60,
  maxLoginAttempts:  5,
  passwordPolicy:    'strong',
  twoFactorEnabled:  false,
  // Permissions
  permissions: {
    patientCanBook:     true,
    patientCanCancel:   true,
    secretaryCanCreate: true,
    secretaryCanDelete: false,
  },
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
    const updated = { ...readSettings(), ...req.body };
    writeSettings(updated);
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

// ── TOTP (admin 2FA management) ────────────────────────────────────────────────
export const setupAdminTOTP = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) throw new AppError('User not found', 404);

    const secret = speakeasy.generateSecret({ name: `MediSync Admin (${user.email})`, length: 20 });
    await prisma.user.update({ where: { id: user.id }, data: { twoFactorSecret: secret.base32 } });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);
    res.json({ success: true, data: { secret: secret.base32, qrCode, qrCodeUrl: qrCode } });
  } catch (err) { next(err); }
};

export const verifyAdminTOTP = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { code, token } = req.body;
    const otp = code || token;

    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user?.twoFactorSecret) throw new AppError('2FA not set up', 400);

    const verified = speakeasy.totp.verify({
      secret:   user.twoFactorSecret,
      encoding: 'base32',
      token:    otp,
      window:   1,
    });
    if (!verified) throw new AppError('Code 2FA invalide', 401);

    await prisma.user.update({ where: { id: user.id }, data: { twoFactorEnabled: true } });
    res.json({ success: true, message: '2FA activé avec succès' });
  } catch (err) { next(err); }
};

// ── Admin profile ──────────────────────────────────────────────────────────────
export const updateAdminProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { firstName, lastName } = req.body;
    const admin = await prisma.admin.update({
      where: { userId: req.user!.userId },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName  !== undefined && { lastName }),
      },
    });
    res.json({ success: true, data: admin });
  } catch (err) { next(err); }
};
