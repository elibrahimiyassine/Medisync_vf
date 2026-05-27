import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, BehaviorSubject, filter, take } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  email: string;
  role: 'PATIENT' | 'DOCTOR' | 'SECRETARY' | 'ADMIN';
  twoFactorEnabled?: boolean;
  profile?: any;
}

export function detectRole(email: string): 'PATIENT' | 'DOCTOR' | 'SECRETARY' | 'ADMIN' {
  const local = email.split('@')[0].toLowerCase();
  if (/^dr([._-]|$)/.test(local)) return 'DOCTOR';
  if (/^(sec|secretaire|secretary)([._-]|$)/.test(local)) return 'SECRETARY';
  if (/^admin([._-]|$)/.test(local)) return 'ADMIN';
  return 'PATIENT';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user    = signal<User | null>(null);
  private _token   = signal<string | null>(null);
  private _loading = signal(false);

  private _isRefreshing = false;
  private _tokenSubject = new BehaviorSubject<string | null>(null);

  readonly user            = this._user.asReadonly();
  readonly token           = this._token.asReadonly();
  readonly isLoading       = this._loading.asReadonly();
  readonly isAuthenticated = computed(() => !!this._user() && !!this._token());
  readonly userRole        = computed(() => this._user()?.role);

  private readonly api = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  initializeAuth(): void {
    try {
      const token   = localStorage.getItem('accessToken');
      const userStr = localStorage.getItem('user');
      if (token && userStr) {
        this._token.set(token);
        this._user.set(JSON.parse(userStr));
      }
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
  }

  login(email: string, password: string): Observable<any> {
    this._loading.set(true);
    return this.http.post<any>(`${this.api}/auth/login`, { email, password }).pipe(
      tap(res => {
        // requiresTwoFactor: true → no accessToken yet, handled by the component
        if (res.success && res.data?.accessToken) {
          this.setSession(res.data.accessToken, res.data.user);
        }
        this._loading.set(false);
      }),
      catchError(err => {
        this._loading.set(false);
        return throwError(() => err);
      }),
    );
  }

  register(data: any): Observable<any> {
    return this.http.post<any>(`${this.api}/auth/register`, data).pipe(
      tap(res => {
        if (res.success && res.data?.accessToken) {
          this.setSession(res.data.accessToken, res.data.user);
        }
      }),
    );
  }

  logout(): void {
    this.http.post(`${this.api}/auth/logout`, {}).subscribe({ error: () => {} });
    this.clearSession();
    this._isRefreshing = false;
    this._tokenSubject.next(null);
    this.router.navigate(['/']);
  }

  refreshToken(): Observable<any> {
    if (this._isRefreshing) {
      // Another refresh is already in flight — wait for it instead of starting a second one.
      // Without this, concurrent 401s each trigger their own refresh; the first rotation
      // invalidates the DB token so every subsequent refresh fails and calls auth.logout().
      return this._tokenSubject.asObservable().pipe(
        filter(token => token !== null),
        take(1),
      );
    }

    this._isRefreshing = true;
    this._tokenSubject.next(null);

    return this.http.post<any>(`${this.api}/auth/refresh`, {}).pipe(
      tap(res => {
        this._isRefreshing = false;
        if (res.success) {
          this._token.set(res.data.accessToken);
          localStorage.setItem('accessToken', res.data.accessToken);
          this._tokenSubject.next(res.data.accessToken);
        }
      }),
      catchError(err => {
        this._isRefreshing = false;
        this._tokenSubject.next(null);
        return throwError(() => err);
      }),
    );
  }

  updateUser(partial: Partial<User>): void {
    const current = this._user();
    if (!current) return;
    const updated = { ...current, ...partial };
    this._user.set(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  }

  getMe(): Observable<any> {
    return this.http.get<any>(`${this.api}/auth/me`);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.api}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.api}/auth/reset-password`, { token, password });
  }

  rescan2FA(userId: string): Observable<any> {
    return this.http.post<any>(`${this.api}/auth/2fa/rescan`, { userId });
  }

  verify2FA(userId: string, token: string): Observable<any> {
    return this.http.post<any>(`${this.api}/auth/2fa/verify`, { userId, token }).pipe(
      tap(res => {
        if (res.success) {
          const { accessToken, user } = res.data;
          this.setSession(accessToken, user);
        }
      }),
    );
  }

  // Demo-only: simulates OAuth login for UI demo accounts not present in the backend
  loginWithOAuth(email: string, profile: { firstName: string; lastName: string }): Observable<any> {
    this._loading.set(true);
    return new Observable(observer => {
      setTimeout(() => {
        const user: User = { id: 'oauth-' + Date.now(), email, role: 'PATIENT', profile };
        this.setSession('oauth-demo-token', user);
        this._loading.set(false);
        observer.next({ success: true });
        observer.complete();
      }, 700);
    });
  }

  private setSession(token: string, user: User): void {
    this._token.set(token);
    this._user.set(user);
    localStorage.setItem('accessToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.redirectByRole(user.role);
  }

  private clearSession(): void {
    this._token.set(null);
    this._user.set(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  }

  private redirectByRole(role: string): void {
    const map: Record<string, string> = {
      PATIENT:   '/patient/dashboard',
      DOCTOR:    '/doctor/dashboard',
      SECRETARY: '/secretary/dashboard',
      ADMIN:     '/admin/dashboard',
    };
    this.router.navigate([map[role] ?? '/']);
  }
}
