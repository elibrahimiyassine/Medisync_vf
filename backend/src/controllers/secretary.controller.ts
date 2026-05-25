import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';
import { AppError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';
import { sendEmail } from '../utils/email';

export const getSecretaryMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const secretary = await prisma.secretary.findUnique({
      where: { userId: req.user!.userId },
      include: { user: { select: { email: true, createdAt: true } } },
    });
    if (!secretary) throw new AppError('Secretary not found', 404);
    res.json({ success: true, data: secretary });
  } catch (err) { next(err); }
};

export const createPatientBySecretary = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, firstName, lastName, phone, dateOfBirth, bloodType, allergies } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError('Un compte avec cet email existe déjà', 409);

    const tempPassword = `MediSync${Math.random().toString(36).slice(-6).toUpperCase()}!`;
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'PATIENT',
        patient: {
          create: {
            firstName,
            lastName,
            phone: phone || null,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            bloodType: bloodType || null,
            allergies: allergies || [],
          },
        },
      },
      include: { patient: true },
    });

    sendEmail({
      to: email,
      subject: 'Bienvenue sur MediSync — Vos identifiants de connexion',
      html: `<div style="font-family:sans-serif;background:#070B14;color:#E8F4FD;padding:40px;border-radius:12px;max-width:600px;margin:0 auto;border:1px solid rgba(0,212,255,0.3);">
        <h1 style="color:#00D4FF;text-align:center;">MediSync</h1>
        <h2 style="color:#00F5A0;">Bienvenue, ${firstName} ${lastName} !</h2>
        <p>Votre dossier patient a été créé par notre équipe. Voici vos identifiants temporaires :</p>
        <div style="background:#0D1526;border:1px solid rgba(0,212,255,0.2);border-radius:8px;padding:20px;margin:20px 0;">
          <p><strong style="color:#00D4FF;">Email :</strong> ${email}</p>
          <p><strong style="color:#00D4FF;">Mot de passe temporaire :</strong> ${tempPassword}</p>
        </div>
        <p>Veuillez vous connecter et modifier votre mot de passe dès que possible.</p>
        <p style="color:#5A7A9B;font-size:12px;margin-top:30px;">Message automatique MediSync.</p>
      </div>`,
    }).catch(() => {});

    res.status(201).json({ success: true, data: { ...user.patient, email, tempPassword } });
  } catch (err) { next(err); }
};

export const updateSecretaryMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { firstName, lastName, phone } = req.body;
    const secretary = await prisma.secretary.update({
      where: { userId: req.user!.userId },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName  !== undefined && { lastName }),
        ...(phone     !== undefined && { phone }),
      },
    });
    res.json({ success: true, data: secretary });
  } catch (err) { next(err); }
};
