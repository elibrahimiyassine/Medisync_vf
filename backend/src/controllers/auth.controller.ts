import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { prisma } from '../utils/prisma';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { sendPasswordResetEmail } from '../utils/email';
import { AppError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';
import { emitToUser } from '../utils/socket';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, firstName, lastName, dateOfBirth, phone, role } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError('Email already registered', 409);

    const passwordHash = await bcrypt.hash(password, 12);
    const allowedRole = role === 'PATIENT' ? 'PATIENT' : 'PATIENT';

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: allowedRole,
        patient: {
          create: {
            firstName,
            lastName,
            dateOfBirth: new Date(dateOfBirth),
            phone,
          },
        },
      },
      include: { patient: true },
    });

    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { accessToken, user: { id: user.id, email: user.email, role: user.role, profile: user.patient } },
    });
  } catch (err) { next(err); }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { patient: true, doctor: true, secretary: true, admin: true },
    });

    if (!user || !user.isActive) throw new AppError('Invalid credentials', 401);

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new AppError('Invalid credentials', 401);

    if (user.twoFactorEnabled) {
      res.json({ success: true, requiresTwoFactor: true, userId: user.id });
      return;
    }

    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await prisma.user.update({ where: { id: user.id }, data: { refreshToken, lastLoginAt: new Date() } });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const profile = user.patient || user.doctor || user.secretary || user.admin;

    res.json({
      success: true,
      data: { accessToken, user: { id: user.id, email: user.email, role: user.role, profile } },
    });
  } catch (err) { next(err); }
};

export const verify2FA = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, token } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { patient: true, doctor: true, secretary: true, admin: true },
    });

    if (!user || !user.twoFactorSecret) throw new AppError('Invalid request', 400);

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!verified) throw new AppError('Invalid 2FA code', 401);

    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await prisma.user.update({ where: { id: user.id }, data: { refreshToken, lastLoginAt: new Date() } });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const profile = user.patient || user.doctor || user.secretary || user.admin;
    res.json({ success: true, data: { accessToken, user: { id: user.id, email: user.email, role: user.role, profile } } });
  } catch (err) { next(err); }
};

export const setup2FA = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const secret = speakeasy.generateSecret({ name: `MediSync (${req.user!.email})`, length: 20 });

    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { twoFactorSecret: secret.base32 },
    });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);
    res.json({ success: true, data: { secret: secret.base32, qrCode } });
  } catch (err) { next(err); }
};

export const enable2FA = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });

    if (!user?.twoFactorSecret) throw new AppError('2FA not set up', 400);

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!verified) throw new AppError('Invalid 2FA token', 400);

    await prisma.user.update({ where: { id: user.id }, data: { twoFactorEnabled: true } });
    res.json({ success: true, message: '2FA enabled successfully' });
  } catch (err) { next(err); }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user) {
      await prisma.user.update({ where: { id: req.user.userId }, data: { refreshToken: null } });
    }
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) { next(err); }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) throw new AppError('No refresh token', 401);

    const payload = verifyRefreshToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });

    if (!user || user.refreshToken !== token) throw new AppError('Invalid refresh token', 401);

    const newPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(newPayload);
    const newRefreshToken = generateRefreshToken(newPayload);

    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: newRefreshToken } });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, data: { accessToken } });
  } catch (err) { next(err); }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpiry = new Date(Date.now() + 3600000);

      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: `reset:${resetToken}:${resetExpiry.toISOString()}` },
      });

      const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
      await sendPasswordResetEmail(email, resetUrl);
    }

    res.json({ success: true, message: 'If that email exists, a reset link has been sent' });
  } catch (err) { next(err); }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, password } = req.body;

    const users = await prisma.user.findMany({
      where: { refreshToken: { startsWith: 'reset:' } },
    });

    const user = users.find(u => {
      const parts = u.refreshToken?.split(':');
      if (parts && parts[1] === token && parts[2]) {
        const expiry = new Date(parts[2]);
        return expiry > new Date();
      }
      return false;
    });

    if (!user) throw new AppError('Invalid or expired reset token', 400);

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash, refreshToken: null } });

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) { next(err); }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true, email: true, role: true, isActive: true,
        twoFactorEnabled: true, lastLoginAt: true, createdAt: true, updatedAt: true,
        patient: true, doctor: true, secretary: true, admin: true,
      },
    });
    if (!user) throw new AppError('User not found', 404);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};
