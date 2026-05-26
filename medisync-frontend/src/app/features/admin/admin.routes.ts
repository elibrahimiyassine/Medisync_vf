import { Routes } from '@angular/router';
<<<<<<< HEAD
import { admin2faGuard } from '../../core/guards/admin2fa.guard';

export const ADMIN_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'setup-2fa', canActivate: [admin2faGuard], loadComponent: () => import('./setup-2fa/admin-setup-2fa.component').then(m => m.AdminSetup2faComponent) },
  { path: 'dashboard', canActivate: [admin2faGuard], loadComponent: () => import('./dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
  { path: 'staff',     canActivate: [admin2faGuard], loadComponent: () => import('./staff/admin-staff.component').then(m => m.AdminStaffComponent) },
  { path: 'finance',   canActivate: [admin2faGuard], loadComponent: () => import('./finance/admin-finance.component').then(m => m.AdminFinanceComponent) },
  { path: 'audit',     canActivate: [admin2faGuard], loadComponent: () => import('./audit/admin-audit.component').then(m => m.AdminAuditComponent) },
  { path: 'settings',  canActivate: [admin2faGuard], loadComponent: () => import('./settings/admin-settings.component').then(m => m.AdminSettingsComponent) },
  { path: 'profile',   canActivate: [admin2faGuard], loadComponent: () => import('./profile/admin-profile.component').then(m => m.AdminProfileComponent) },
=======

export const ADMIN_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', loadComponent: () => import('./dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
  { path: 'staff',     loadComponent: () => import('./staff/admin-staff.component').then(m => m.AdminStaffComponent) },
  { path: 'finance',   loadComponent: () => import('./finance/admin-finance.component').then(m => m.AdminFinanceComponent) },
  { path: 'audit',     loadComponent: () => import('./audit/admin-audit.component').then(m => m.AdminAuditComponent) },
  { path: 'settings',  loadComponent: () => import('./settings/admin-settings.component').then(m => m.AdminSettingsComponent) },
  { path: 'profile',   loadComponent: () => import('./profile/admin-profile.component').then(m => m.AdminProfileComponent) },
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
];
