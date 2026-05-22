import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const allowedRoles: string[] = route.data['roles'] || [];
  const role = auth.userRole();

  if (!role || !allowedRoles.includes(role)) {
    const redirectMap: Record<string, string> = {
      PATIENT:   '/patient/dashboard',
      DOCTOR:    '/doctor/dashboard',
      SECRETARY: '/secretary/dashboard',
      ADMIN:     '/admin/dashboard',
    };
    router.navigate([redirectMap[role!] || '/auth/login']);
    return false;
  }
  return true;
};
