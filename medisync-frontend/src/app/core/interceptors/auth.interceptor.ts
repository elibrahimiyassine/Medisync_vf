import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  const notif  = inject(NotificationService);
  const token  = auth.token();

  const authReq = req.clone({
    withCredentials: true,
    ...(token ? { setHeaders: { Authorization: `Bearer ${token}` } } : {}),
  });

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 403 && err.error?.code === 'ADMIN_2FA_REQUIRED') {
        notif.showToast('Activez la 2FA pour accéder au panneau admin', 'error');
        router.navigate(['/admin/settings'], { queryParams: { section: 'security' } });
        return throwError(() => err);
      }
      if (err.status === 401 && !req.url.includes('/auth/')) {
        return auth.refreshToken().pipe(
          switchMap(() => {
            const newToken = auth.token();
            const retryReq = authReq.clone(
              newToken ? { setHeaders: { Authorization: `Bearer ${newToken}` } } : {}
            );
            return next(retryReq);
          }),
          catchError(() => {
            auth.logout();
            return throwError(() => err);
          }),
        );
      }
      return throwError(() => err);
    }),
  );
};
