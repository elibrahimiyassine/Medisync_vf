import { Component, Input, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { LucideAngularModule } from 'lucide-angular';

interface NavItem {
  icon: string;
  label: string;
  path: string;
  roles: string[];
}

const NAV_ITEMS: NavItem[] = [
  // Patient
  { icon: 'layout-dashboard', label: 'Tableau de bord', path: '/patient/dashboard',      roles: ['PATIENT'] },
  { icon: 'calendar',         label: 'Rendez-vous',     path: '/patient/appointments',   roles: ['PATIENT'] },
  { icon: 'clipboard-list',   label: 'Dossier médical', path: '/patient/dossier',        roles: ['PATIENT'] },
  { icon: 'pill',             label: 'Ordonnances',     path: '/patient/prescriptions',  roles: ['PATIENT'] },
  { icon: 'star',             label: 'Avis & retours',  path: '/patient/feedback',       roles: ['PATIENT'] },
  // Doctor
  { icon: 'layout-dashboard', label: 'Tableau de bord', path: '/doctor/dashboard',       roles: ['DOCTOR'] },
  { icon: 'calendar',         label: 'Mon planning',    path: '/doctor/planning',        roles: ['DOCTOR'] },
  { icon: 'users',            label: 'Patients',        path: '/doctor/patients',        roles: ['DOCTOR'] },
  { icon: 'pill',             label: 'Ordonnances',     path: '/doctor/prescriptions',   roles: ['DOCTOR'] },
  // Secretary
  { icon: 'layout-dashboard', label: 'Tableau de bord', path: '/secretary/dashboard',    roles: ['SECRETARY'] },
  { icon: 'calendar',         label: 'Rendez-vous',     path: '/secretary/appointments', roles: ['SECRETARY'] },
  { icon: 'users',            label: 'Patients',        path: '/secretary/patients',     roles: ['SECRETARY'] },
  { icon: 'receipt',          label: 'Facturation',     path: '/secretary/billing',      roles: ['SECRETARY'] },
  // Admin
  { icon: 'layout-dashboard', label: 'Tableau de bord', path: '/admin/dashboard',        roles: ['ADMIN'] },
  { icon: 'users',            label: 'Personnel',       path: '/admin/staff',            roles: ['ADMIN'] },
  { icon: 'chart-bar',        label: 'Finance',         path: '/admin/finance',          roles: ['ADMIN'] },
  { icon: 'search',           label: "Journal d'audit", path: '/admin/audit',            roles: ['ADMIN'] },
  { icon: 'settings',         label: 'Paramètres',      path: '/admin/settings',         roles: ['ADMIN'] },
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed()">
      <!-- Logo -->
      <div class="sidebar-logo">
        <div class="logo-icon">
          <span>M</span>
        </div>
        @if (!collapsed()) {
          <div class="logo-text">
            <span class="logo-name">MediSync</span>
            <span class="logo-sub">Health Platform</span>
          </div>
        }
      </div>

      <div class="ecg-bar" style="margin: 0 16px 16px;"></div>

      <!-- User badge -->
      @if (!collapsed()) {
        <div class="sidebar-user animate-fade-in">
          <div class="user-avatar" [style.background]="roleColor()">
            {{ userInitials() }}
          </div>
          <div class="user-info">
            <span class="user-name">{{ userName() }}</span>
            <span class="user-role badge {{ roleClass() }}">{{ userRole() }}</span>
          </div>
        </div>
      }

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <div class="nav-label" *ngIf="!collapsed()">Menu</div>
        @for (item of visibleItems(); track item.path) {
          <a
            [routerLink]="item.path"
            routerLinkActive="active"
            class="nav-item"
            [title]="collapsed() ? item.label : ''">
            <span class="nav-icon"><lucide-icon [name]="item.icon" [size]="18" /></span>
            @if (!collapsed()) {
              <span class="nav-label-text">{{ item.label }}</span>
            }
            <div class="nav-indicator"></div>
          </a>
        }
      </nav>

      <!-- Bottom actions -->
      <div class="sidebar-bottom">
        <button class="nav-item collapse-btn" (click)="toggleCollapse()">
          <span class="nav-icon">
            <lucide-icon [name]="collapsed() ? 'chevron-right' : 'chevron-left'" [size]="18" />
          </span>
          @if (!collapsed()) { <span class="nav-label-text">Réduire</span> }
        </button>

        <a routerLink="/{{ role()?.toLowerCase() }}/profile" class="nav-item" *ngIf="!collapsed()">
          <span class="nav-icon"><lucide-icon name="user" [size]="18" /></span>
          <span class="nav-label-text">Profil</span>
        </a>

        <button class="nav-item logout-btn" (click)="logout()">
          <span class="nav-icon"><lucide-icon name="log-out" [size]="18" /></span>
          @if (!collapsed()) { <span class="nav-label-text">Déconnexion</span> }
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      left: 0; top: 0; bottom: 0;
      width: 260px;
      background: #2A4A38;
      border-right: 1px solid rgba(27,37,32,0.2);
      display: flex;
      flex-direction: column;
      z-index: 100;
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;

      &.collapsed { width: 72px; }
    }

    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    .logo-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: linear-gradient(135deg, #C9633C, #D4A574);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 18px;
      color: #FAF7F1;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(201,99,60,0.4);
    }

    .logo-name {
      display: block;
      font-family: 'Fraunces', Georgia, serif;
      font-weight: 700;
      font-size: 18px;
      color: #EFEAE0;
      line-height: 1.2;
      font-variation-settings: "opsz" 72, "SOFT" 40;
    }

    .logo-sub {
      display: block;
      font-size: 11px;
      color: rgba(239,234,224,0.5);
      letter-spacing: 0.05em;
    }

    .sidebar-user {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      margin: 0 8px 8px;
      background: rgba(27,37,32,0.25);
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.08);
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
      color: white;
      flex-shrink: 0;
    }

    .user-name {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: #EFEAE0;
      line-height: 1.3;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 120px;
    }

    .user-role { font-size: 10px; margin-top: 2px; }

    .sidebar-nav {
      flex: 1;
      padding: 8px;
      overflow-y: auto;
      overflow-x: hidden;
      scrollbar-width: none;
      &::-webkit-scrollbar { display: none; }
    }

    .nav-label {
      font-size: 10px;
      font-weight: 700;
      color: rgba(239,234,224,0.4);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      padding: 8px 12px 4px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 9px;
      cursor: pointer;
      transition: all 0.15s ease;
      color: rgba(239,234,224,0.6);
      text-decoration: none;
      position: relative;
      border: none;
      background: none;
      width: 100%;
      font-family: 'Geist', 'Inter', system-ui, sans-serif;
      font-size: 14px;
      margin-bottom: 2px;

      .nav-icon { flex-shrink: 0; width: 24px; display: flex; align-items: center; justify-content: center; }
      .nav-label-text { white-space: nowrap; font-weight: 500; }
      .nav-indicator { position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 3px; height: 0; background: #C9633C; border-radius: 0 3px 3px 0; transition: height 0.2s; }

      &:hover {
        background: rgba(255,255,255,0.08);
        color: #EFEAE0;
      }

      &.active {
        background: rgba(255,255,255,0.12);
        color: #FAF7F1;
        .nav-indicator { height: 60%; }
        .nav-label-text { font-weight: 600; }
      }
    }

    .sidebar-bottom {
      padding: 8px;
      border-top: 1px solid rgba(255,255,255,0.08);
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .logout-btn { color: rgba(201,99,60,0.7); &:hover { color: #E8957A; background: rgba(201,99,60,0.12); } }

    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 10px;
      font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
      letter-spacing: 0.04em;
      text-transform: uppercase;

      &.patient   { background: rgba(42,74,56,0.4);   color: #A8C8B8; }
      &.doctor    { background: rgba(61,107,79,0.4);  color: #8EC8A0; }
      &.secretary { background: rgba(212,165,116,0.3); color: #E8C898; }
      &.admin     { background: rgba(201,99,60,0.35); color: #E89878; }
    }

    @media (max-width: 768px) {
      .sidebar {
        top: auto;
        right: 0;
        bottom: 0;
        width: 100vw;
        height: 68px;
        border-right: 0;
        border-top: 1px solid rgba(27,37,32,0.18);
        z-index: 200;

        &.collapsed { width: 100vw; }
      }

      .sidebar-logo,
      .sidebar-user,
      .sidebar-bottom,
      .ecg-bar,
      .nav-label {
        display: none !important;
      }

      .sidebar-nav {
        height: 100%;
        padding: 6px 8px;
        display: flex;
        align-items: center;
        gap: 6px;
        overflow-x: auto;
        overflow-y: hidden;
      }

      .nav-item {
        flex: 1 0 58px;
        min-width: 58px;
        max-width: 78px;
        height: 56px;
        margin: 0;
        padding: 6px 4px;
        flex-direction: column;
        justify-content: center;
        gap: 4px;
        border-radius: 12px;
        font-size: 10px;
        text-align: center;
      }

      .nav-item .nav-icon {
        width: 22px;
        height: 22px;
      }

      .nav-item .nav-label-text {
        display: block !important;
        max-width: 100%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 9px;
        line-height: 1.1;
      }

      .nav-item .nav-indicator {
        left: 50%;
        top: auto;
        bottom: 0;
        width: 24px;
        height: 3px;
        transform: translateX(-50%);
        border-radius: 3px 3px 0 0;
      }

      .nav-item.active .nav-indicator {
        height: 3px;
      }
    }
  `],
})
export class SidebarComponent implements OnInit {
  private _collapsed = signal(false);
  readonly collapsed = this._collapsed.asReadonly();

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const saved = localStorage.getItem('sidebar_collapsed');
    if (saved === 'true') this._collapsed.set(true);
  }

  readonly role = computed(() => this.authService.user()?.role);

  readonly visibleItems = computed(() => {
    const role = this.role();
    return role ? NAV_ITEMS.filter(item => item.roles.includes(role)) : [];
  });

  readonly userName = computed(() => {
    const p = this.authService.user()?.profile;
    const name = `${p?.firstName || ''} ${p?.lastName || ''}`.trim();
    return name || this.authService.user()?.email?.split('@')[0] || 'Utilisateur';
  });

  readonly userInitials = computed(() => {
    const p = this.authService.user()?.profile;
    return `${p?.firstName?.[0] || ''}${p?.lastName?.[0] || ''}` || 'U';
  });

  readonly userRole = computed(() => this.authService.user()?.role || '');

  readonly roleClass = computed(() => {
    return this.authService.user()?.role?.toLowerCase() || '';
  });

  readonly roleColor = computed(() => {
    const colors: Record<string, string> = {
      PATIENT:   'linear-gradient(135deg, #2A4A38, #3D6B4F)',
      DOCTOR:    'linear-gradient(135deg, #3D6B4F, #2A4A38)',
      SECRETARY: 'linear-gradient(135deg, #B8792A, #D4A574)',
      ADMIN:     'linear-gradient(135deg, #C9633C, #D4845A)',
    };
    return colors[this.authService.user()?.role || ''] || '#7A8A82';
  });

  toggleCollapse(): void {
    this._collapsed.update(v => !v);
    localStorage.setItem('sidebar_collapsed', String(this._collapsed()));
  }

  logout(): void {
    this.authService.logout();
  }
}
