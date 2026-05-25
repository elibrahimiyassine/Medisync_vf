import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const admin2faGuard: CanActivateFn = (route) => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  const user   = auth.user();

  // Allow the setup-2fa route itself through unconditionally
  if (route.routeConfig?.path === 'setup-2fa') return true;

  // If 2FA is not yet enabled, force setup
  if (user && !user.twoFactorEnabled) {
    router.navigate(['/admin/setup-2fa']);
    return false;
  }

  return true;
};
