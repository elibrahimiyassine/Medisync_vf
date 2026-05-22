import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: '2fa',
    loadComponent: () => import('./two-fa/two-fa.component').then(m => m.TwoFaComponent),
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
  },
];
