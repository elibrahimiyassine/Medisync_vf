import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, logout, refreshToken, forgotPassword, resetPassword, getMe, verify2FA, setup2FA, enable2FA } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema, verify2FASchema, enable2FASchema } from '../schemas';

const router = Router();

const authLimiter = process.env.DISABLE_RATE_LIMIT === 'true'
  ? (_req: any, _res: any, next: any) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 10,
      message: { success: false, message: 'Too many attempts, please try again later' },
    });

router.post('/register',       authLimiter, validate(registerSchema),       register);
router.post('/login',          authLimiter, validate(loginSchema),          login);
router.post('/logout',         authenticate,                                logout);
router.post('/refresh',        refreshToken);
router.post('/forgot-password',authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema),               resetPassword);
router.post('/2fa/verify',     authLimiter, validate(verify2FASchema),      verify2FA);
router.post('/2fa/setup',      authenticate,                                setup2FA);
router.post('/2fa/enable',     authenticate, validate(enable2FASchema),     enable2FA);
router.get('/me',              authenticate,                                getMe);

export default router;
