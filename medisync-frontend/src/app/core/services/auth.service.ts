import { Injectable, signal, computed } from '@angular/core';
<<<<<<< HEAD
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, BehaviorSubject, filter, take } from 'rxjs';
import { environment } from '../../../environments/environment';
=======
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567

export interface User {
  id: string;
  email: string;
  role: 'PATIENT' | 'DOCTOR' | 'SECRETARY' | 'ADMIN';
<<<<<<< HEAD
  twoFactorEnabled?: boolean;
  profile?: any;
}

=======
  profile?: any;
}

interface StoredUser {
  id: string;
  email: string;
  password: string;
  role: 'PATIENT' | 'DOCTOR' | 'SECRETARY' | 'ADMIN';
  profile: { firstName: string; lastName: string; specialty?: string };
}

const DB_KEY = 'medisync_users_db';

>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
export function detectRole(email: string): 'PATIENT' | 'DOCTOR' | 'SECRETARY' | 'ADMIN' {
  const local = email.split('@')[0].toLowerCase();
  if (/^dr([._-]|$)/.test(local)) return 'DOCTOR';
  if (/^(sec|secretaire|secretary)([._-]|$)/.test(local)) return 'SECRETARY';
  if (/^admin([._-]|$)/.test(local)) return 'ADMIN';
  return 'PATIENT';
}

<<<<<<< HEAD
=======
function extractName(email: string): { firstName: string; lastName: string } {
  let local = email.split('@')[0];
  local = local
    .replace(/^dr[._-]?/i, '')
    .replace(/^secretaire[._-]?/i, '')
    .replace(/^sec[._-]?/i, '')
    .replace(/^admin[._-]?/i, '');
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  const parts = local.split(/[._-]/).filter(p => p.length > 0);
  if (parts.length >= 2) return { firstName: cap(parts[0]), lastName: cap(parts.slice(1).join(' ')) };
  if (parts.length === 1) return { firstName: cap(parts[0]), lastName: 'Utilisateur' };
  return { firstName: 'Utilisateur', lastName: '' };
}

const SEED_USERS: StoredUser[] = [
  { id: '1', email: 'dr.chen@medisync.ma',   password: 'Doctor123!',    role: 'DOCTOR',    profile: { firstName: 'Marc',  lastName: 'Chen',    specialty: 'Cardiologue' } },
  { id: '2', email: 'admin@medisync.ma',      password: 'Admin123!',     role: 'ADMIN',     profile: { firstName: 'Admin', lastName: 'MediSync' } },
  { id: '3', email: 'alice.bernard@email.fr', password: 'Patient123!',   role: 'PATIENT',   profile: { firstName: 'Alice', lastName: 'Bernard' } },
  { id: '4', email: 'secretary@medisync.ma',  password: 'Secretary123!', role: 'SECRETARY', profile: { firstName: 'Sarah', lastName: 'Leblanc' } },
];

>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user    = signal<User | null>(null);
  private _token   = signal<string | null>(null);
  private _loading = signal(false);

<<<<<<< HEAD
  private _isRefreshing = false;
  private _tokenSubject = new BehaviorSubject<string | null>(null);

=======
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
  readonly user            = this._user.asReadonly();
  readonly token           = this._token.asReadonly();
  readonly isLoading       = this._loading.asReadonly();
  readonly isAuthenticated = computed(() => !!this._user() && !!this._token());
  readonly userRole        = computed(() => this._user()?.role);

<<<<<<< HEAD
  private readonly api = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}
=======
  constructor(private router: Router) {
    this.seedDb();
  }

  private seedDb(): void {
    if (!localStorage.getItem(DB_KEY)) {
      localStorage.setItem(DB_KEY, JSON.stringify(SEED_USERS));
    } else {
      try {
        const stored: StoredUser[] = JSON.parse(localStorage.getItem(DB_KEY)!);
        const patched = stored.map(u => ({
          ...u,
          email: u.email.replace('@medisync.fr', '@medisync.ma'),
        }));
        // Always sync seed accounts: add if missing, restore correct password+role if present
        for (const seed of SEED_USERS) {
          const idx = patched.findIndex(u => u.email === seed.email);
          if (idx === -1) {
            patched.push({ ...seed });
          } else {
            patched[idx] = { ...patched[idx], password: seed.password, role: seed.role, profile: seed.profile };
          }
        }
        localStorage.setItem(DB_KEY, JSON.stringify(patched));
      } catch { /* ignore */ }
    }
    // Fix active session
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const u = JSON.parse(userStr);
        const newEmail = u.email?.replace('@medisync.fr', '@medisync.ma') || u.email;
        const seed = SEED_USERS.find(s => s.email === newEmail);
        if (seed && (u.email !== newEmail || u.role !== seed.role || !u.profile?.firstName || u.profile.firstName === 'Utilisateur')) {
          localStorage.setItem('user', JSON.stringify({ ...u, email: newEmail, role: seed.role, profile: seed.profile }));
        } else if (u.email !== newEmail) {
          localStorage.setItem('user', JSON.stringify({ ...u, email: newEmail }));
        }
      }
    } catch { /* ignore */ }
  }

  private getDb(): StoredUser[] {
    try { return JSON.parse(localStorage.getItem(DB_KEY) || '[]'); } catch { return []; }
  }

  private saveDb(users: StoredUser[]): void {
    localStorage.setItem(DB_KEY, JSON.stringify(users));
  }
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567

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
<<<<<<< HEAD
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
=======
    return new Observable(observer => {
      setTimeout(() => {
        if (!email || !password) {
          this._loading.set(false);
          observer.error({ error: { message: 'E-mail et mot de passe requis.' } });
          return;
        }

        // Seed accounts always authenticate directly — no localStorage dependency
        const seedUser = SEED_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (seedUser) {
          if (seedUser.password !== password) {
            this._loading.set(false);
            observer.error({ error: { message: 'Mot de passe incorrect.' } });
            return;
          }
          const user: User = { id: seedUser.id, email: seedUser.email, role: seedUser.role, profile: seedUser.profile };
          this.setSession('token-' + seedUser.id, user);
          this._loading.set(false);
          observer.next({ success: true });
          observer.complete();
          return;
        }

        const db = this.getDb();
        const existing = db.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (existing) {
          if (existing.password !== password) {
            this._loading.set(false);
            observer.error({ error: { message: 'Mot de passe incorrect.' } });
            return;
          }
          const user: User = { id: existing.id, email: existing.email, role: existing.role, profile: existing.profile };
          this.setSession('token-' + existing.id, user);
          this._loading.set(false);
          observer.next({ success: true });
          observer.complete();
        } else {
          // Auto-create on first login (patients only)
          if (password.length < 8) {
            this._loading.set(false);
            observer.error({ error: { message: 'Première connexion : mot de passe minimum 8 caractères.' } });
            return;
          }
          const { firstName, lastName } = extractName(email);
          const role = detectRole(email);
          if (role === 'DOCTOR' || role === 'SECRETARY') {
            this._loading.set(false);
            observer.error({ error: { message: 'Compte non reconnu. Contactez l\'administrateur pour obtenir vos identifiants de connexion.' } });
            return;
          }
          const newUser: StoredUser = {
            id: 'u-' + Date.now(),
            email: email.toLowerCase(),
            password,
            role,
            profile: { firstName, lastName },
          };
          db.push(newUser);
          this.saveDb(db);
          const user: User = { id: newUser.id, email: newUser.email, role: newUser.role, profile: newUser.profile };
          this.setSession('token-' + newUser.id, user);
          this._loading.set(false);
          observer.next({ success: true, created: true });
          observer.complete();
        }
      }, 500);
    });
  }

  register(data: any): Observable<any> {
    return new Observable(observer => {
      setTimeout(() => {
        if (!data.email || !data.password) {
          observer.error({ error: { message: 'E-mail et mot de passe requis.' } });
          return;
        }
        if (data.password.length < 8) {
          observer.error({ error: { message: 'Le mot de passe doit contenir au moins 8 caractères.' } });
          return;
        }
        const db = this.getDb();
        const emailLower = data.email.toLowerCase();
        if (db.find(u => u.email.toLowerCase() === emailLower)) {
          observer.error({ error: { message: 'Cette adresse e-mail est déjà utilisée.' } });
          return;
        }
        const role = detectRole(emailLower);
        if (role === 'DOCTOR' || role === 'SECRETARY') {
          observer.error({ error: { message: 'Les comptes médecin et secrétaire sont créés par l\'administrateur. Veuillez vous connecter directement.' } });
          return;
        }
        const newUser: StoredUser = {
          id: 'u-' + Date.now(),
          email: emailLower,
          password: data.password,
          role,
          profile: {
            firstName: data.firstName || extractName(data.email).firstName,
            lastName:  data.lastName  || extractName(data.email).lastName,
          },
        };
        db.push(newUser);
        this.saveDb(db);
        const user: User = { id: newUser.id, email: newUser.email, role: newUser.role, profile: newUser.profile };
        this.setSession('token-' + newUser.id, user);
        observer.next({ success: true });
        observer.complete();
      }, 600);
    });
  }

  verify2FA(_userId: string, _token: string): Observable<any> {
    return new Observable(observer => {
      observer.next({ success: true });
      observer.complete();
    });
  }

  forgotPassword(_email: string): Observable<any> {
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({ message: 'If this email is registered, a reset link has been sent.' });
        observer.complete();
      }, 600);
    });
  }

  resetPassword(_token: string, _password: string): Observable<any> {
    return new Observable(observer => {
      observer.next({ message: 'Mot de passe réinitialisé avec succès.' });
      observer.complete();
    });
  }

>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
  loginWithOAuth(email: string, profile: { firstName: string; lastName: string }): Observable<any> {
    this._loading.set(true);
    return new Observable(observer => {
      setTimeout(() => {
<<<<<<< HEAD
        const user: User = { id: 'oauth-' + Date.now(), email, role: 'PATIENT', profile };
        this.setSession('oauth-demo-token', user);
=======
        const db = this.getDb();
        const emailLower = email.toLowerCase();
        let acct = db.find(u => u.email.toLowerCase() === emailLower);
        if (!acct) {
          acct = { id: 'oauth-' + Date.now(), email: emailLower, password: '', role: 'PATIENT', profile };
          db.push(acct);
          this.saveDb(db);
        }
        const user: User = { id: acct.id, email: acct.email, role: acct.role, profile: acct.profile };
        this.setSession('token-' + acct.id, user);
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
        this._loading.set(false);
        observer.next({ success: true });
        observer.complete();
      }, 700);
    });
  }

<<<<<<< HEAD
=======
  logout(): void {
    this.clearSession();
    this.router.navigate(['/']);
  }

  refreshToken(): Observable<any> {
    return new Observable(observer => {
      observer.error({ error: { message: 'Non autorisé' } });
    });
  }

  getMe(): Observable<any> {
    return new Observable(observer => {
      observer.next({ data: this._user() });
      observer.complete();
    });
  }

>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
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
