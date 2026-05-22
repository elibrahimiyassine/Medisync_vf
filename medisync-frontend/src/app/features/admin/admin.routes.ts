import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', loadComponent: () => import('./dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
  { path: 'staff',     loadComponent: () => import('./staff/admin-staff.component').then(m => m.AdminStaffComponent) },
  { path: 'finance',   loadComponent: () => import('./finance/admin-finance.component').then(m => m.AdminFinanceComponent) },
  { path: 'audit',     loadComponent: () => import('./audit/admin-audit.component').then(m => m.AdminAuditComponent) },
  { path: 'settings',  loadComponent: () => import('./settings/admin-settings.component').then(m => m.AdminSettingsComponent) },
  { path: 'profile',   loadComponent: () => import('./profile/admin-profile.component').then(m => m.AdminProfileComponent) },
];
