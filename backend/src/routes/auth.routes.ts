import { Router } from 'express';
import rateLimit from 'express-rate-limit';
<<<<<<< HEAD
import { register, login, logout, refreshToken, forgotPassword, resetPassword, getMe, verify2FA, rescan2FA, setup2FA, enable2FA } from '../controllers/auth.controller';
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
router.post('/2fa/rescan',     authLimiter,                                  rescan2FA);
router.post('/2fa/setup',      authenticate,                                setup2FA);
router.post('/2fa/enable',     authenticate, validate(enable2FASchema),     enable2FA);
router.get('/me',              authenticate,                                getMe);
=======
import { register, login, logout, refreshToken, forgotPassword, resetPassword, getMe, verify2FA, setup2FA, enable2FA } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many attempts, please try again later' },
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', authenticate, logout);
router.post('/refresh', refreshToken);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/2fa/verify', authLimiter, verify2FA);
router.post('/2fa/setup', authenticate, setup2FA);
router.post('/2fa/enable', authenticate, enable2FA);
router.get('/me', authenticate, getMe);
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567

export default router;
