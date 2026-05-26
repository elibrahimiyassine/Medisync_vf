import { Routes } from '@angular/router';

export const PATIENT_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard',     loadComponent: () => import('./dashboard/patient-dashboard.component').then(m => m.PatientDashboardComponent) },
  { path: 'appointments',  loadComponent: () => import('./appointments/patient-appointments.component').then(m => m.PatientAppointmentsComponent) },
  { path: 'dossier',       loadComponent: () => import('./dossier/patient-dossier.component').then(m => m.PatientDossierComponent) },
  { path: 'prescriptions', loadComponent: () => import('./prescriptions/patient-prescriptions.component').then(m => m.PatientPrescriptionsComponent) },
  { path: 'profile',       loadComponent: () => import('./profile/patient-profile.component').then(m => m.PatientProfileComponent) },
  { path: 'feedback',      loadComponent: () => import('./feedback/patient-feedback.component').then(m => m.PatientFeedbackComponent) },
];
