import { Injectable, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MASCOT_DIALOGS, MascotMessage } from './mascot-dialogs';

@Injectable({ providedIn: 'root' })
export class MascotService {
  private _state   = signal<'idle' | 'alert' | 'celebrate'>('idle');
  private _message = signal<MascotMessage | null>(null);
  private _visible = signal(true);
  private _role    = signal<string>('patient');
  private _route   = signal<string>('');
  private _timer: ReturnType<typeof setTimeout> | null = null;

  readonly state   = this._state.asReadonly();
  readonly message = this._message.asReadonly();
  readonly visible = this._visible.asReadonly();

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this._route.set(e.url);
        this._onRoute(e.url);
      });
  }

  setRole(role: string): void {
    const r = role.toLowerCase();
    if (this._role() === r) return;
    this._role.set(r);
    this._show(MASCOT_DIALOGS[r]?.welcome ?? null, 'alert', 4000);
  }

  showHint(): void {
    const seg   = this._pageSeg(this._route());
    const hints = MASCOT_DIALOGS[this._role()]?.hints ?? {};
    const hint  = hints[seg] ?? hints['default'] ?? null;
    if (hint) this._show(hint, 'alert', 6000);
  }

  celebrate(): void {
    const msg = MASCOT_DIALOGS[this._role()]?.success ?? null;
    this._show(msg, 'celebrate', 3000);
  }

  dismiss(): void { this._clear(); }
  hide():    void { this._visible.set(false); }
  show():    void { this._visible.set(true); }

  private _onRoute(url: string): void {
    const seg  = this._pageSeg(url);
    const page = MASCOT_DIALOGS[this._role()]?.pages?.[seg] ?? null;
    if (page) this._show(page, 'alert', 4500);
    else this._clear();
  }

  // Extract a meaningful page segment even for dynamic routes like /doctor/consultation/:id
  private _pageSeg(url: string): string {
    const parts = url.split('/').filter(Boolean);
    if (parts.length === 0) return '';
    const last  = parts[parts.length - 1];
    const pages = MASCOT_DIALOGS[this._role()]?.pages ?? {};
    // If last segment is a known page key, use it
    if (pages[last] !== undefined) return last;
    // Otherwise fall back to second-to-last (handles /role/page/:id patterns)
    if (parts.length >= 2) {
      const parent = parts[parts.length - 2];
      if (pages[parent] !== undefined) return parent;
    }
    return last;
  }

  private _show(msg: MascotMessage | null, state: 'alert' | 'celebrate', ms: number): void {
    if (this._timer) clearTimeout(this._timer);
    this._message.set(msg);
    this._state.set(state);
    this._timer = setTimeout(() => this._clear(), ms);
  }

  private _clear(): void {
    if (this._timer) { clearTimeout(this._timer); this._timer = null; }
    this._message.set(null);
    this._state.set('idle');
  }
}
