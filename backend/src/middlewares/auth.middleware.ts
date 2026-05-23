import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JWTPayload } from '../utils/jwt';
import { Role } from '@prisma/client';
import { prisma } from '../utils/prisma';

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : req.cookies?.accessToken;

  if (!token) {
    res.status(401).json({ success: false, message: 'No authentication token provided' });
    return;
  }

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const requireAdmin2FA = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  if (req.path.startsWith('/totp')) return next();
  if (req.user?.role !== 'ADMIN') return next();
  const user = await prisma.user.findUnique({ where: { id: req.user.userId }, select: { twoFactorEnabled: true } });
  if (!user?.twoFactorEnabled) {
    res.status(403).json({
      success: false,
      message: 'Les administrateurs doivent activer la double authentification (2FA)',
      code: 'ADMIN_2FA_REQUIRED',
    });
    return;
  }
  next();
};

export const authorize = (...roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Insufficient permissions' });
      return;
    }
    next();
  };
};
