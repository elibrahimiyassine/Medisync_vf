import { Routes } from '@angular/router';

export const DOCTOR_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard',     loadComponent: () => import('./dashboard/doctor-dashboard.component').then(m => m.DoctorDashboardComponent) },
  { path: 'planning',      loadComponent: () => import('./planning/doctor-planning.component').then(m => m.DoctorPlanningComponent) },
  { path: 'patients',      loadComponent: () => import('./patients/doctor-patients.component').then(m => m.DoctorPatientsComponent) },
  { path: 'consultation/:id', loadComponent: () => import('./consultation/doctor-consultation.component').then(m => m.DoctorConsultationComponent) },
  { path: 'prescriptions', loadComponent: () => import('./prescriptions/doctor-prescriptions.component').then(m => m.DoctorPrescriptionsComponent) },
  { path: 'profile',       loadComponent: () => import('./profile/doctor-profile.component').then(m => m.DoctorProfileComponent) },
];
