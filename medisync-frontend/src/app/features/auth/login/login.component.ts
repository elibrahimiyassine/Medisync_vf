import {
  Component, OnInit, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService, detectRole } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LucideAngularModule],
  template: `
    <div class="auth-page">
      <!-- Animated particle background -->
      <div class="particles-container" aria-hidden="true">
        @for (p of particles; track $index) {
          <span class="particle" [style]="p.style">+</span>
        }
      </div>

      <div class="auth-container">
        <!-- Left: branding panel -->
        <div class="auth-brand">
          <div class="brand-content">
            <div class="brand-logo">
              <div class="logo-mark">M</div>
              <div>
                <h1 class="brand-name text-gradient">MediSync</h1>
                <p class="brand-sub">Health Platform</p>
              </div>
            </div>

            <div class="brand-features">
              @for (f of features; track f.icon) {
                <div class="feature-item animate-slide-up">
                  <span class="feature-icon"><lucide-icon [name]="f.icon" [size]="18" /></span>
                  <span>{{ f.text }}</span>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Right: login form -->
        <div class="auth-form-panel">
          <div class="auth-form-content">
            <div class="form-header">
              <h2>Bienvenue</h2>
              <p class="form-sub">Connectez-vous à votre compte MediSync</p>
            </div>

            @if (!showTwoFactor()) {
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="login-form stagger" novalidate>
              <!-- Email -->
              <div class="form-group">
                <label for="email">Adresse e-mail</label>
                <input
                  #emailInput
                  id="email"
                  type="email"
                  formControlName="email"
                  class="glass-input"
                  placeholder="medecin@medisync.ma"
                  autocomplete="email" />
                @if (loginEmailRole() !== 'PATIENT' || form.get('email')?.value) {
                  <div style="display:flex;align-items:center;gap:5px;margin-top:4px;">
                    <lucide-icon [name]="roleIconFor(loginEmailRole())" [size]="11" style="color:#2A4A38;" />
                    <span style="font-size:11px;color:#2A4A38;font-weight:600;">{{ roleLabelFor(loginEmailRole()) }}</span>
                  </div>
                }
                <p style="font-size:10px;color:#7A8A82;margin-top:3px;line-height:1.5;">Préfixe : <b>dr.</b> = médecin · <b>admin.</b> = admin · <b>sec.</b> = secrétaire</p>
                @if (form.get('email')?.invalid && form.get('email')?.touched) {
                  <span class="error-msg">Veuillez saisir une adresse e-mail valide</span>
                }
              </div>

              <!-- Password -->
              <div class="form-group">
                <label for="password">Mot de passe</label>
                <div class="password-wrapper">
                  <input
                    id="password"
                    [type]="showPassword() ? 'text' : 'password'"
                    formControlName="password"
                    class="glass-input"
                    placeholder="••••••••••"
                    autocomplete="current-password" />
                  <button
                    type="button"
                    class="eye-toggle"
                    (click)="togglePassword()"
                    [title]="showPassword() ? 'Hide password' : 'Show password'">
                    <lucide-icon [name]="showPassword() ? 'eye-off' : 'eye'" [size]="14" />
                  </button>
                </div>
                @if (form.get('password')?.invalid && form.get('password')?.touched) {
                  <span class="error-msg">Le mot de passe est obligatoire</span>
                }
              </div>

              <!-- Mot de passe oublié -->
              <div class="form-row">
                <label class="remember-label">
                  <input type="checkbox" formControlName="remember" class="checkbox" />
                  <span>Se souvenir de moi</span>
                </label>
                <a routerLink="/auth/forgot-password" class="forgot-link">Mot de passe oublié ?</a>
              </div>

              <!-- Error message -->
              @if (errorMsg()) {
                <div class="error-banner animate-slide-down">
                  <lucide-icon name="triangle-alert" [size]="14" />
                  <span>{{ errorMsg() }}</span>
                </div>
              }

              <!-- Submit -->
              <button
                type="submit"
                class="btn-primary submit-btn"
                [disabled]="isLoading() || form.invalid">
                @if (isLoading()) {
                  <span class="spinner"></span>
                  <span>Connexion en cours...</span>
                } @else {
                  <span>Se connecter</span>
                  <lucide-icon name="arrow-right" [size]="14" />
                }
              </button>
              <p style="font-size:11px;color:#7A8A82;text-align:center;margin-top:-4px;">
                Première connexion ? Un compte sera créé automatiquement.
              </p>
            </form>

            } @else {
              <div class="twofa-inline animate-slide-down">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
                  <lucide-icon name="lock-keyhole" [size]="24" style="color:#2A4A38;" />
                  <div>
                    <p style="font-size:15px;font-weight:700;color:#1B2520;margin:0;">Authentification à deux facteurs</p>
                    <p style="font-size:12px;color:#7A8A82;margin:2px 0 0;">Entrez le code à 6 chiffres de votre application</p>
                  </div>
                </div>

                @if (rescanQr()) {
                  <div style="text-align:center;margin-bottom:16px;">
                    <p style="font-size:12px;color:#7A8A82;margin-bottom:10px;">Scannez ce QR code avec Google Authenticator</p>
                    <img [src]="rescanQr()!" alt="QR Code" width="160" height="160"
                      style="border:2px solid rgba(42,74,56,0.15);border-radius:10px;padding:8px;background:#fff;" />
                    <button style="display:block;margin:8px auto 0;background:none;border:none;font-size:11px;color:#7A8A82;cursor:pointer;"
                      (click)="hideRescan()">Masquer le QR code</button>
                  </div>
                }

                <div class="otp-inputs" style="margin-bottom:16px;">
                  @for (i of [0,1,2,3,4,5]; track i) {
                    <input type="text" maxlength="1" class="otp-box glass-input"
                      [id]="'login-otp-' + i"
                      (input)="onOtpInput($event, i)"
                      (keydown.backspace)="onOtpBackspace($event, i)"
                      autocomplete="off" inputmode="numeric" pattern="[0-9]*" />
                  }
                </div>
                @if (twoFaError()) {
                  <div class="error-banner" style="margin-bottom:12px;">
                    <lucide-icon name="triangle-alert" [size]="14" />
                    <span>{{ twoFaError() }}</span>
                  </div>
                }
                <button class="btn-primary submit-btn" (click)="submitTwoFa()"
                  [disabled]="isLoading() || otpCode.length !== 6">
                  @if (isLoading()) { <span class="spinner"></span> Vérification... }
                  @else { Vérifier le code }
                </button>
                <button class="forgot-link" style="display:block;text-align:center;margin-top:10px;background:none;border:none;cursor:pointer;width:100%;font-size:12px;color:#7A8A82;"
                  (click)="showRescanQr()" [disabled]="rescanLoading()">
                  @if (rescanLoading()) { <span class="spinner" style="width:13px;height:13px;border-width:2px;"></span> Chargement... }
                  @else { <lucide-icon name="smartphone" [size]="13" style="flex-shrink:0;" /> J'ai supprimé mon application — rescanner le QR code }
                </button>
                <button class="forgot-link" style="display:block;text-align:center;margin-top:8px;background:none;border:none;cursor:pointer;width:100%;"
                  (click)="cancelTwoFa()">
                  ← Retour à la connexion
                </button>
              </div>
            }

            @if (!showTwoFactor()) {
            <div class="divider">
              <span>ou continuer avec</span>
            </div>

            <!-- OAuth providers -->
            <div class="oauth-row">
              <button class="oauth-btn" (click)="openOAuth('google')" [disabled]="isLoading()" title="Google">
                <svg width="18" height="18" viewBox="0 0 48 48" style="flex-shrink:0;">
                  <path fill="#EA4335" d="M24 9.5c3.5 0 6.3 1.2 8.6 3.2l6.4-6.4C34.8 2.7 29.8.5 24 .5 14.8.5 7 5.9 3.2 13.6l7.5 5.8C12.4 13 17.7 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.5 24.5c0-1.7-.1-3.3-.4-4.8H24v9.1h12.7c-.5 2.9-2.2 5.4-4.7 7l7.3 5.7c4.3-4 6.8-9.8 7.2-17z"/>
                  <path fill="#FBBC05" d="M10.7 28.6A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.6l-7.5-5.8A23.5 23.5 0 0 0 .5 24c0 3.8.9 7.4 2.5 10.6l7.7-6z"/>
                  <path fill="#34A853" d="M24 47.5c5.8 0 10.7-1.9 14.3-5.2l-7.3-5.7c-1.9 1.3-4.4 2-7 2-6.3 0-11.6-3.5-13.3-8.9l-7.7 6C7 42.1 14.8 47.5 24 47.5z"/>
                </svg>
                Google
              </button>
              <button class="oauth-btn" (click)="openOAuth('microsoft')" [disabled]="isLoading()" title="Microsoft">
                <svg width="18" height="18" viewBox="0 0 23 23" style="flex-shrink:0;">
                  <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
                  <rect x="12" y="1" width="10" height="10" fill="#7FBA00"/>
                  <rect x="1" y="12" width="10" height="10" fill="#00A4EF"/>
                  <rect x="12" y="12" width="10" height="10" fill="#FFB900"/>
                </svg>
                Microsoft
              </button>
            </div>

            <!-- Accès démo rapide -->
            <div class="demo-logins">
              <p class="demo-title">Accès démo rapide</p>
              <div class="demo-grid">
                @for (demo of demoUsers; track demo.role) {
                  <button class="demo-btn" (click)="loginAs(demo)" [disabled]="isLoading()">
                    <span class="demo-icon"><lucide-icon [name]="demo.icon" [size]="18" /></span>
                    <span>{{ demo.role }}</span>
                  </button>
                }
              </div>
            </div>

            <p class="register-link">
              Nouveau patient ?
              <a routerLink="/auth/register">Créer votre compte →</a>
            </p>
            }
          </div>
        </div>
      </div>
    </div>

    @if (oauthProvider()) {
      <div class="oauth-overlay" (click)="closeOAuth()">
        <div class="oauth-modal" (click)="$event.stopPropagation()">
          <div class="oauth-modal-head" [class.ms]="oauthProvider() === 'microsoft'">
            @if (oauthProvider() === 'google') {
              <svg width="28" height="28" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.3 1.2 8.6 3.2l6.4-6.4C34.8 2.7 29.8.5 24 .5 14.8.5 7 5.9 3.2 13.6l7.5 5.8C12.4 13 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.7-.1-3.3-.4-4.8H24v9.1h12.7c-.5 2.9-2.2 5.4-4.7 7l7.3 5.7c4.3-4 6.8-9.8 7.2-17z"/><path fill="#FBBC05" d="M10.7 28.6A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.6l-7.5-5.8A23.5 23.5 0 0 0 .5 24c0 3.8.9 7.4 2.5 10.6l7.7-6z"/><path fill="#34A853" d="M24 47.5c5.8 0 10.7-1.9 14.3-5.2l-7.3-5.7c-1.9 1.3-4.4 2-7 2-6.3 0-11.6-3.5-13.3-8.9l-7.7 6C7 42.1 14.8 47.5 24 47.5z"/></svg>
            } @else {
              <svg width="28" height="28" viewBox="0 0 23 23"><rect x="1" y="1" width="10" height="10" fill="#F25022"/><rect x="12" y="1" width="10" height="10" fill="#7FBA00"/><rect x="1" y="12" width="10" height="10" fill="#00A4EF"/><rect x="12" y="12" width="10" height="10" fill="#FFB900"/></svg>
            }
            <div>
              <p class="oauth-modal-title">Se connecter avec {{ oauthProvider() === 'google' ? 'Google' : 'Microsoft' }}</p>
              <p class="oauth-modal-sub">Choisissez un compte</p>
            </div>
          </div>
          <div class="oauth-acct-list">
            @for (acct of currentOAuthAccounts(); track acct.email) {
              <button class="oauth-acct-btn" (click)="selectOAuthAccount(acct)" [disabled]="oauthLoading()">
                <div class="acct-avatar" [style.background]="acct.color">{{ acct.avatar }}</div>
                <div class="acct-info">
                  <span class="acct-name">{{ acct.firstName }} {{ acct.lastName }}</span>
                  <span class="acct-email">{{ acct.email }}</span>
                </div>
                @if (oauthLoading()) { <span class="oauth-spinner"></span> }
                @else { <lucide-icon name="chevron-right" [size]="14" style="color:#7A8A82;flex-shrink:0;" /> }
              </button>
            }
          </div>
          <div class="oauth-modal-foot">
            <button class="oauth-cancel" (click)="closeOAuth()">Annuler</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      padding: 20px;
      background: #EFEAE0;
    }

    .auth-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      max-width: 960px;
      width: 100%;
      background: #FAF7F1;
      backdrop-filter: blur(24px);
      border: 1px solid rgba(42,74,56,0.15);
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 0 60px rgba(42,74,56,0.06), 0 24px 80px rgba(27,37,32,0.14);

      @media (max-width: 768px) { grid-template-columns: 1fr; }
    }

    /* ── Brand panel ── */
    .auth-brand {
      background: linear-gradient(160deg, rgba(42,74,56,0.06) 0%, rgba(201,99,60,0.08) 100%);
      border-right: 1px solid rgba(42,74,56,0.12);
      padding: 40px 32px;
      display: flex;
      align-items: center;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: -40%; left: -40%;
        width: 80%; height: 80%;
        background: radial-gradient(circle, rgba(42,74,56,0.06), transparent 70%);
        pointer-events: none;
      }

      @media (max-width: 768px) { display: none; }
    }

    .brand-content { width: 100%; }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 32px;
    }

    .logo-mark {
      width: 48px; height: 48px;
      border-radius: 14px;
      background: linear-gradient(135deg, #2A4A38, #C9633C);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 22px;
      color: #1B2520;
      box-shadow: 0 6px 20px rgba(42,74,56,0.4);
    }

    .brand-name {
      font-family: 'Fraunces', Georgia, serif;
      font-size: 28px;
      font-weight: 700;
      margin: 0;
    }

    .brand-sub { font-size: 12px; color: #7A8A82; margin: 0; letter-spacing: 0.05em; }

    .brand-features { display: flex; flex-direction: column; gap: 12px; }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 13px;
      color: #3A5248;
      padding: 10px 14px;
      background: rgba(42,74,56,0.05);
      border-radius: 10px;
      border: 1px solid rgba(42,74,56,0.06);
    }

    .feature-icon { display:flex; align-items:center; justify-content:center; }

    /* ── Form panel ── */
    .auth-form-panel {
      padding: 48px 40px;
      display: flex;
      align-items: center;
      @media (max-width: 480px) { padding: 32px 24px; }
    }

    .auth-form-content { width: 100%; }

    .form-header {
      margin-bottom: 32px;
      h2 { font-size: 26px; font-weight: 700; color: #1B2520; font-family: 'Fraunces', Georgia, serif; }
      .form-sub { font-size: 14px; color: #7A8A82; margin-top: 4px; }
    }

    .login-form { display: flex; flex-direction: column; gap: 20px; }

    .password-wrapper {
      position: relative;
      .glass-input { padding-right: 48px; }
    }

    .eye-toggle {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      font-size: 16px;
      color: #7A8A82;
      padding: 4px;
      transition: color 0.2s;
      &:hover { color: #2A4A38; }
    }

    .form-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .remember-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #3A5248;
      cursor: pointer;
    }

    .checkbox {
      width: 16px; height: 16px;
      accent-color: #2A4A38;
      cursor: pointer;
    }

    .forgot-link { font-size: 13px; color: #2A4A38; text-decoration: none; &:hover { text-decoration: underline; } }

    .error-banner {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      background: rgba(194,64,64,0.08);
      border: 1px solid rgba(194,64,64,0.3);
      border-radius: 10px;
      font-size: 13px;
      color: #C24040;
    }

    .submit-btn {
      width: 100%;
      justify-content: center;
      padding: 14px;
      font-size: 15px;
      border-radius: 12px;
    }

    .spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(0,0,0,0.3);
      border-top-color: #000;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      display: inline-block;
    }

    .divider {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 20px 0;
      span { font-size: 12px; color: #7A8A82; white-space: nowrap; }
      &::before, &::after {
        content: '';
        flex: 1;
        height: 1px;
        background: rgba(42,74,56,0.12);
      }
    }

    .demo-logins { margin-bottom: 20px; }
    .demo-title { font-size: 12px; color: #7A8A82; margin-bottom: 10px; text-align: center; letter-spacing: 0.04em; }

    .demo-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
    }

    .demo-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 10px 6px;
      background: rgba(42,74,56,0.06);
      border: 1px solid rgba(42,74,56,0.1);
      border-radius: 10px;
      color: #3A5248;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-family: 'Geist', 'Inter', sans-serif;
      text-transform: uppercase;
      letter-spacing: 0.04em;

      .demo-icon { display:flex; align-items:center; justify-content:center; }

      &:hover {
        background: rgba(42,74,56,0.1);
        border-color: #2A4A38;
        color: #2A4A38;
        transform: translateY(-2px);
      }

      &:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }
    }

    .oauth-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 4px;
    }

    .oauth-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 9px;
      padding: 11px 14px;
      background: rgba(42,74,56,0.04);
      border: 1px solid rgba(42,74,56,0.14);
      border-radius: 12px;
      font-size: 13px;
      font-weight: 600;
      color: #3A5248;
      cursor: pointer;
      transition: all 0.2s;
      font-family: 'Geist', 'Inter', sans-serif;
      &:hover:not(:disabled) { background: rgba(42,74,56,0.08); border-color: rgba(42,74,56,0.25); transform: translateY(-1px); }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }

    .register-link {
      text-align: center;
      font-size: 13px;
      color: #7A8A82;
      a { color: #2A4A38; font-weight: 600; }
    }

    /* ── Inline 2FA ── */
    .twofa-inline { padding: 4px 0; }
    .otp-inputs { display: flex; gap: 10px; justify-content: center; }
    .otp-box {
      width: 48px !important;
      height: 56px !important;
      text-align: center;
      font-size: 22px;
      font-weight: 700;
      padding: 0 !important;
      border-radius: 12px;
    }

    /* ── Particles ── */
    .particle {
      position: absolute;
      color: rgba(42,74,56,0.15);
      animation: float-up linear infinite;
      user-select: none;
      pointer-events: none;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }

    @keyframes float-up {
      0%   { transform: translateY(0) rotate(0deg); opacity: 0.6; }
      100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
    }

    /* ── OAuth modal ── */
    .oauth-overlay { position:fixed;inset:0;background:rgba(27,37,32,0.45);backdrop-filter:blur(4px);z-index:400;display:flex;align-items:center;justify-content:center;padding:24px; }
    .oauth-modal { background:#fff;border-radius:16px;width:100%;max-width:340px;box-shadow:0 24px 64px rgba(0,0,0,0.18);overflow:hidden; }
    .oauth-modal-head { display:flex;align-items:center;gap:14px;padding:22px 24px 18px;border-bottom:1px solid #f0f0f0; &.ms { border-top:3px solid #0078D4; } }
    .oauth-modal-title { font-size:15px;font-weight:700;color:#1B2520;margin:0; }
    .oauth-modal-sub { font-size:12px;color:#7A8A82;margin:2px 0 0; }
    .oauth-acct-list { padding:8px 0; }
    .oauth-acct-btn { width:100%;display:flex;align-items:center;gap:14px;padding:12px 24px;background:none;border:none;cursor:pointer;transition:background .15s;text-align:left;
      &:hover:not(:disabled) { background:#f6f6f6; }
      &:disabled { opacity:.6;cursor:not-allowed; }
    }
    .acct-avatar { width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#fff;flex-shrink:0; }
    .acct-info { flex:1;min-width:0; }
    .acct-name  { display:block;font-size:13px;font-weight:600;color:#1B2520; }
    .acct-email { display:block;font-size:11px;color:#7A8A82;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
    .oauth-modal-foot { padding:12px 24px 18px;border-top:1px solid #f0f0f0;text-align:center; }
    .oauth-cancel { background:none;border:none;font-size:13px;color:#7A8A82;cursor:pointer;font-family:'Geist','Inter',sans-serif; &:hover{color:#1B2520;} }
    .oauth-spinner { width:16px;height:16px;border:2px solid rgba(0,0,0,0.15);border-top-color:#2A4A38;border-radius:50%;animation:spin .7s linear infinite;flex-shrink:0; }
  `],
})
export class LoginComponent implements OnInit {
  form!: ReturnType<FormBuilder['group']>;

  private _showPassword = signal(false);
  private _isLoading = signal(false);
  private _errorMsg = signal('');
  loginEmailRole = signal<string>('PATIENT');
  oauthProvider  = signal<'google' | 'microsoft' | null>(null);
  oauthLoading   = signal(false);

  private _showTwoFactor = signal(false);
  private _twoFaError    = signal('');
  readonly showTwoFactor = this._showTwoFactor.asReadonly();
  readonly twoFaError    = this._twoFaError.asReadonly();

  readonly showPassword = this._showPassword.asReadonly();
  readonly isLoading    = this._isLoading.asReadonly();
  readonly errorMsg     = this._errorMsg.asReadonly();

  otpCode = '';
  private otpValues: string[] = ['', '', '', '', '', ''];
  private pendingUserId = '';

  private _rescanQr      = signal<string | null>(null);
  private _rescanLoading = signal(false);
  readonly rescanQr      = this._rescanQr.asReadonly();
  readonly rescanLoading = this._rescanLoading.asReadonly();

  private readonly _oauthAccounts = {
    google: [
      { email: 'sophie.martin@gmail.com',  firstName: 'Sophie', lastName: 'Martin', avatar: 'SM', color: '#4285F4' },
      { email: 'thomas.dupont@gmail.com',   firstName: 'Thomas', lastName: 'Dupont', avatar: 'TD', color: '#34A853' },
    ],
    microsoft: [
      { email: 'emma.petit@outlook.com',   firstName: 'Emma',   lastName: 'Petit',  avatar: 'EP', color: '#0078D4' },
      { email: 'lucas.moreau@hotmail.com', firstName: 'Lucas',  lastName: 'Moreau', avatar: 'LM', color: '#50E6FF' },
    ],
  };

  readonly currentOAuthAccounts = () =>
    this._oauthAccounts[this.oauthProvider() as 'google' | 'microsoft'] ?? [];

  particles: { style: string }[] = [];

  features = [
    { icon: 'lock',           text: 'Dossiers médicaux sécurisés et conformes' },
    { icon: 'calendar',       text: 'Planification intelligente des rendez-vous' },
    { icon: 'pill',           text: 'Ordonnances et historique numériques' },
    { icon: 'chart-bar',      text: 'Statistiques de la clinique en temps réel' },
  ];

  demoUsers = [
    { icon: 'stethoscope',   role: 'Médecin',     email: 'dr.chen@medisync.ma',      password: 'Doctor123!' },
    { icon: 'briefcase',     role: 'Admin',        email: 'admin@medisync.ma',        password: 'Admin123!' },
    { icon: 'user',          role: 'Patient',     email: 'alice.bernard@email.fr',   password: 'Patient123!' },
    { icon: 'clipboard-list',role: 'Secrétaire',   email: 'secretary@medisync.ma',    password: 'Secretary123!' },
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notifSvc: NotificationService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      remember: [false],
    });
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      const role = this.authService.userRole();
      if (role) {
        const map: Record<string, string> = {
          PATIENT:   '/patient/dashboard',
          DOCTOR:    '/doctor/dashboard',
          SECRETARY: '/secretary/dashboard',
          ADMIN:     '/admin/dashboard',
        };
        this.router.navigate([map[role] ?? '/']);
        return;
      }
    }
    this.particles = Array.from({ length: 22 }, (_, i) => ({
      style: `left:${Math.random() * 100}%;bottom:0;font-size:${12 + Math.random() * 16}px;animation-duration:${8 + Math.random() * 14}s;animation-delay:${Math.random() * 10}s;`,
    }));
    this.form.get('email')?.valueChanges.subscribe(v => this.loginEmailRole.set(detectRole(v || '')));
  }

  roleIconFor(role: string): string {
    const m: Record<string, string> = { PATIENT: 'user', DOCTOR: 'stethoscope', SECRETARY: 'clipboard-list', ADMIN: 'briefcase' };
    return m[role] || 'user';
  }

  roleLabelFor(role: string): string {
    const m: Record<string, string> = { PATIENT: 'Patient', DOCTOR: 'Médecin', SECRETARY: 'Secrétaire', ADMIN: 'Administrateur' };
    return m[role] || 'Patient';
  }

  togglePassword(): void {
    this._showPassword.update(v => !v);
  }

  onOtpInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const val = input.value.replace(/\D/g, '').slice(-1);
    input.value = val;
    this.otpValues[index] = val;
    this.otpCode = this.otpValues.join('');
    if (val && index < 5) {
      (document.getElementById(`login-otp-${index + 1}`) as HTMLInputElement)?.focus();
    }
  }

  onOtpBackspace(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (!input.value && index > 0) {
      this.otpValues[index - 1] = '';
      this.otpCode = this.otpValues.join('');
      const prev = document.getElementById(`login-otp-${index - 1}`) as HTMLInputElement;
      if (prev) { prev.value = ''; prev.focus(); }
    }
  }

  submitTwoFa(): void {
    if (this.otpCode.length !== 6) return;
    this._isLoading.set(true);
    this._twoFaError.set('');
    this.authService.verify2FA(this.pendingUserId, this.otpCode).subscribe({
      next: () => {
        this._isLoading.set(false);
        this.notifSvc.showToast('Bienvenue sur MediSync !', 'success');
      },
      error: (err: any) => {
        this._isLoading.set(false);
        this._twoFaError.set(err.error?.message || 'Code invalide. Veuillez réessayer.');
        this.otpValues = ['', '', '', '', '', ''];
        this.otpCode = '';
        [0, 1, 2, 3, 4, 5].forEach(i => {
          const el = document.getElementById(`login-otp-${i}`) as HTMLInputElement;
          if (el) el.value = '';
        });
        (document.getElementById('login-otp-0') as HTMLInputElement)?.focus();
      },
    });
  }

  cancelTwoFa(): void {
    this._showTwoFactor.set(false);
    this._twoFaError.set('');
    this._rescanQr.set(null);
    this.otpCode = '';
    this.otpValues = ['', '', '', '', '', ''];
  }

  showRescanQr(): void {
    if (this._rescanQr()) { this._rescanQr.set(null); return; }
    this._rescanLoading.set(true);
    this.authService.rescan2FA(this.pendingUserId).subscribe({
      next: (res: any) => {
        this._rescanQr.set(res.data?.qrCodeUrl ?? null);
        this._rescanLoading.set(false);
      },
      error: () => this._rescanLoading.set(false),
    });
  }

  hideRescan(): void {
    this._rescanQr.set(null);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this._isLoading.set(true);
    this._errorMsg.set('');

    const { email, password } = this.form.value;

    this.authService.login(email!, password!).subscribe({
      next: (res) => {
        this._isLoading.set(false);
        if (res.requiresTwoFactor) {
          this.pendingUserId = res.userId;
          this._showTwoFactor.set(true);
          return;
        }
        this.notifSvc.showToast('Bienvenue sur MediSync !', 'success');
      },
      error: (err) => {
        this._isLoading.set(false);
        this._errorMsg.set(err.error?.message || 'Identifiants invalides. Veuillez réessayer.');
      },
    });
  }

  loginAs(demo: { email: string; password: string }): void {
    this.form.patchValue({ email: demo.email, password: demo.password });
    setTimeout(() => this.onSubmit(), 100);
  }

  openOAuth(provider: 'google' | 'microsoft'): void {
    this.oauthProvider.set(provider);
  }

  closeOAuth(): void {
    if (this.oauthLoading()) return;
    this.oauthProvider.set(null);
  }

  selectOAuthAccount(acct: { email: string; firstName: string; lastName: string }): void {
    this.oauthLoading.set(true);
    this.authService.loginWithOAuth(acct.email, { firstName: acct.firstName, lastName: acct.lastName })
      .subscribe({
        next: () => {
          this.oauthLoading.set(false);
          this.oauthProvider.set(null);
          this.notifSvc.showToast('Bienvenue sur MediSync !', 'success');
        },
        error: () => {
          this.oauthLoading.set(false);
        },
      });
  }
}
