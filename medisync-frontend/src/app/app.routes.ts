import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent),
    pathMatch: 'full',
  },

  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },

  {
    path: 'patient',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['PATIENT'] },
    loadChildren: () => import('./features/patient/patient.routes').then(m => m.PATIENT_ROUTES),
  },

  {
    path: 'doctor',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['DOCTOR'] },
    loadChildren: () => import('./features/doctor/doctor.routes').then(m => m.DOCTOR_ROUTES),
  },

  {
    path: 'secretary',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['SECRETARY'] },
    loadChildren: () => import('./features/secretary/secretary.routes').then(m => m.SECRETARY_ROUTES),
  },

  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
  },

  { path: '**', redirectTo: '/' },
];
