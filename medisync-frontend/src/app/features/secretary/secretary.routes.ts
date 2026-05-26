import { Routes } from '@angular/router';

export const SECRETARY_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard',    loadComponent: () => import('./dashboard/secretary-dashboard.component').then(m => m.SecretaryDashboardComponent) },
  { path: 'appointments', loadComponent: () => import('./appointments/secretary-appointments.component').then(m => m.SecretaryAppointmentsComponent) },
  { path: 'patients',     loadComponent: () => import('./patients/secretary-patients.component').then(m => m.SecretaryPatientsComponent) },
  { path: 'billing',      loadComponent: () => import('./billing/secretary-billing.component').then(m => m.SecretaryBillingComponent) },
  { path: 'profile',     loadComponent: () => import('./profile/secretary-profile.component').then(m => m.SecretaryProfileComponent) },
];
