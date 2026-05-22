import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <header class="topbar">
      <!-- ECG pulse bar at very top -->
      <div class="ecg-bar" style="position:absolute;top:0;left:0;right:0;"></div>

      <div class="topbar-left">
        <h2 class="page-title">{{ pageTitle() }}</h2>
        <span class="breadcrumb">MediSync / {{ pageTitle() }}</span>
      </div>

      <div class="topbar-right">
        <!-- Search -->
        <div class="search-box">
          <span class="search-icon"><lucide-icon name="search" [size]="14" /></span>
          <input type="text" placeholder="Rechercher patients, rendez-vous..." class="glass-input search-input"/>
        </div>

        <!-- Notifications -->
        <div class="notif-wrapper">
          <button class="btn-icon notif-btn" (click)="toggleNotifs()">
            <lucide-icon name="bell" [size]="17" />
            @if (notifSvc.unreadCount() > 0) {
              <span class="notif-badge animate-scale-in">{{ notifSvc.unreadCount() }}</span>
            }
          </button>

          @if (notifOpen()) {
            <div class="notif-dropdown animate-slide-down">
              <div class="notif-header">
                <span>Notifications</span>
                <button (click)="notifSvc.markAllAsRead()">Tout marquer lu</button>
              </div>
              @for (n of notifSvc.notifications().slice(0, 8); track n.id) {
                <div class="notif-item" [class.unread]="!n.isRead" (click)="notifSvc.markAsRead(n.id)">
                  <div class="notif-dot" [class]="n.type.toLowerCase()"></div>
                  <div class="notif-content">
                    <p>{{ n.message }}</p>
                    <span>{{ n.createdAt | date:'short' }}</span>
                  </div>
                </div>
              }
              @empty {
                <p class="notif-empty">Aucune notification</p>
              }
            </div>
          }
        </div>

        <!-- User avatar -->
        <a [routerLink]="profilePath()" class="topbar-avatar">
          <div class="avatar-circle" [style.background]="roleGradient()">
            {{ userInitials() }}
          </div>
          <div class="avatar-info">
            <span class="avatar-name">{{ userName() }}</span>
            <span class="avatar-role">{{ userRole() }}</span>
          </div>
        </a>
      </div>
    </header>
  `,
  styles: [`
    .topbar {
      position: fixed;
      top: 0;
      left: var(--sidebar-w, 260px);
      right: 0;
      height: 64px;
      background: rgba(239,234,224,0.94);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(42,74,56,0.12);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      z-index: 50;
    }

    .topbar-left { display: flex; flex-direction: column; gap: 1px; }

    .page-title { font-size: 16px; font-weight: 700; color: #1B2520; font-family: 'Fraunces', Georgia, serif; font-variation-settings: "opsz" 72, "SOFT" 30; }
    .breadcrumb { font-size: 11px; color: #7A8A82; font-family: 'JetBrains Mono', monospace; }

    .topbar-right { display: flex; align-items: center; gap: 12px; }

    .search-box {
      position: relative;
      .search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); display: flex; color: #7A8A82; }
    }

    .search-input { padding-left: 36px !important; width: 240px; height: 36px; font-size: 13px; }

    .notif-wrapper { position: relative; }
    .notif-btn { position: relative; font-size: 16px; }

    .notif-badge {
      position: absolute;
      top: -4px; right: -4px;
      background: #C24040;
      color: white;
      font-size: 10px;
      font-weight: 700;
      width: 17px; height: 17px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #EFEAE0;
      animation: pulse-ring 1.5s ease-out infinite;
    }

    .notif-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 320px;
      background: #FAF7F1;
      border: 1px solid rgba(42,74,56,0.15);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 16px 40px rgba(27,37,32,0.14), 0 2px 8px rgba(27,37,32,0.07);
    }

    .notif-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 16px;
      border-bottom: 1px solid rgba(42,74,56,0.1);
      font-size: 14px;
      font-weight: 600;
      color: #1B2520;
      button { font-size: 11px; color: #2A4A38; background: none; border: none; cursor: pointer; font-weight: 600; }
    }

    .notif-item {
      display: flex;
      gap: 12px;
      padding: 12px 16px;
      transition: background 0.12s;
      cursor: pointer;
      border-bottom: 1px solid rgba(42,74,56,0.06);

      &:hover { background: rgba(42,74,56,0.04); }
      &.unread { background: rgba(42,74,56,0.03); }
    }

    .notif-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      margin-top: 4px;
      flex-shrink: 0;
      background: #7A8A82;
      &.appointment_booked, &.appointment_confirmed { background: #2A4A38; }
      &.appointment_cancelled { background: #C24040; }
      &.prescription_issued { background: #3D6B4F; }
      &.invoice_issued { background: #B8792A; }
    }

    .notif-content {
      flex: 1;
      p { font-size: 13px; color: #3A5248; line-height: 1.4; }
      span { font-size: 11px; color: #7A8A82; margin-top: 2px; display: block; }
    }

    .notif-empty { padding: 20px; text-align: center; font-size: 13px; color: #7A8A82; }

    .topbar-avatar {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      padding: 6px 10px;
      border-radius: 10px;
      transition: background 0.15s;
      &:hover { background: rgba(42,74,56,0.07); }
    }

    .avatar-circle {
      width: 36px; height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 13px;
      color: white;
    }

    .avatar-name { display: block; font-size: 13px; font-weight: 600; color: #1B2520; }
    .avatar-role { display: block; font-size: 10px; color: #7A8A82; text-transform: uppercase; letter-spacing: 0.05em; font-family: 'JetBrains Mono', monospace; }

    @keyframes pulse-ring {
      0%   { box-shadow: 0 0 0 0 rgba(194,64,64,0.45); }
      70%  { box-shadow: 0 0 0 6px rgba(194,64,64,0); }
      100% { box-shadow: 0 0 0 0 rgba(194,64,64,0); }
    }
  `],
})
export class TopbarComponent implements OnInit {
  private _notifOpen = signal(false);
  readonly notifOpen = this._notifOpen.asReadonly();

  private readonly _pageName: ReturnType<typeof toSignal<string>>;

  constructor(
    public authService: AuthService,
    public notifSvc: NotificationService,
    private router: Router
  ) {
    this._pageName = toSignal(
      this.router.events.pipe(
        filter(e => e instanceof NavigationEnd),
        map((e: any) => this.urlToTitle(e.url))
      ),
      { initialValue: this.urlToTitle(this.router.url) }
    );
  }

  ngOnInit(): void {
    this.notifSvc.loadNotifications();
    this.notifSvc.connect();
  }

  readonly userName = computed(() => {
    const p = this.authService.user()?.profile;
    const name = `${p?.firstName || ''} ${p?.lastName || ''}`.trim();
    return name || this.authService.user()?.email?.split('@')[0] || 'Utilisateur';
  });

  readonly userInitials = computed(() => {
    const p = this.authService.user()?.profile;
    if (!p) return 'U';
    return `${p.firstName?.[0] || ''}${p.lastName?.[0] || ''}` || 'U';
  });

  readonly userRole = computed(() => this.authService.user()?.role || '');

  readonly pageTitle = computed(() => this._pageName() || 'MediSync');

  private urlToTitle(url: string): string {
    const last = url.split('/').filter(Boolean).pop() || '';
    const titles: Record<string, string> = {
      'dashboard':     'Tableau de bord',
      'appointments':  'Rendez-vous',
      'patients':      'Mes patients',
      'prescriptions': 'Ordonnances',
      'planning':      'Planning',
      'consultation':  'Consultation',
      'dossier':       'Dossier médical',
      'feedback':      'Évaluations',
      'profile':       'Mon profil',
      'staff':         'Personnel',
      'finance':       'Rapport financier',
      'audit':         "Journal d'audit",
      'settings':      'Paramètres',
      'rooms':         'Salles',
    };
    return titles[last] || 'MediSync';
  }

  readonly profilePath = computed(() => {
    const role = this.authService.user()?.role?.toLowerCase();
    return `/${role}/profile`;
  });

  readonly roleGradient = computed(() => {
    const colors: Record<string, string> = {
      PATIENT:   'linear-gradient(135deg, #2A4A38, #3D6B4F)',
      DOCTOR:    'linear-gradient(135deg, #3D6B4F, #2A4A38)',
      SECRETARY: 'linear-gradient(135deg, #B8792A, #D4A574)',
      ADMIN:     'linear-gradient(135deg, #C9633C, #D4845A)',
    };
    return colors[this.authService.user()?.role || ''] || '#7A8A82';
  });

  toggleNotifs(): void {
    this._notifOpen.update(v => !v);
  }
}
