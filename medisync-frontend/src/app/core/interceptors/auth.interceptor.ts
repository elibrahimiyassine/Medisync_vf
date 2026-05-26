import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
<<<<<<< HEAD
import { NotificationService } from '../services/notification.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth  = inject(AuthService);
  const notif = inject(NotificationService);
  const token = auth.token();

  const authReq = req.clone({
    withCredentials: true,
    ...(token ? { setHeaders: { Authorization: `Bearer ${token}` } } : {}),
  });

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !req.url.includes('/auth/') && auth.isAuthenticated()) {
        // Only attempt token refresh when we have an active session. Without this guard,
        // stale requests from a previously-active admin component (still in flight after
        // logout or while on the 2FA page) trigger a refresh with no valid cookie, causing
        // a spurious auth.logout() that lands the user on the home page.
        return auth.refreshToken().pipe(
          switchMap(() => {
            const newToken = auth.token();
            const retryReq = authReq.clone(
              newToken ? { setHeaders: { Authorization: `Bearer ${newToken}` } } : {}
            );
            return next(retryReq);
          }),
          catchError(() => {
            notif.showToast('Session expirée. Veuillez vous reconnecter.', 'warning');
            auth.logout();
            return throwError(() => err);
          }),
        );
      }
      return throwError(() => err);
    }),
=======

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !req.url.includes('/auth/')) {
        return auth.refreshToken().pipe(
          switchMap(() => {
            const newToken = auth.token();
            const retryReq = newToken
              ? req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } })
              : req;
            return next(retryReq);
          }),
          catchError(() => {
            auth.logout();
            return throwError(() => err);
          })
        );
      }
      return throwError(() => err);
    })
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
  );
};
