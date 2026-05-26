import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from './auth.middleware';
import { logger } from '../utils/logger';

export const auditLog = (action: string, target: string) => {
  return async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
    if (req.user) {
      try {
        await prisma.auditLog.create({
          data: {
            userId: req.user.userId,
            action,
            target,
            details: { params: req.params, query: req.query },
            ip: req.ip || req.socket.remoteAddress,
            userAgent: req.headers['user-agent'],
          },
        });
      } catch (err) {
        logger.error('Audit log error:', err);
      }
    }
    next();
  };
};
