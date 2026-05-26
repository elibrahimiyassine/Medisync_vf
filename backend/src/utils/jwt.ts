import jwt, { SignOptions } from 'jsonwebtoken';
import { Role } from '@prisma/client';

export interface JWTPayload {
  userId: string;
  email: string;
  role: Role;
}

export const generateAccessToken = (payload: JWTPayload): string => {
  const opts: SignOptions = { expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as SignOptions['expiresIn'] };
  return jwt.sign(payload, process.env.JWT_SECRET!, opts);
};

export const generateRefreshToken = (payload: JWTPayload): string => {
  const opts: SignOptions = { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as SignOptions['expiresIn'] };
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, opts);
};

export const verifyAccessToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as JWTPayload;
};
