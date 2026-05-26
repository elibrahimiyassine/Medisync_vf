import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule, FormBuilder, Validators,
  AbstractControl, ValidatorFn, ValidationErrors,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService, detectRole } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LucideAngularModule } from 'lucide-angular';

// ── Custom validator ──────────────────────────────────────────────────────────
function nirValidator(): ValidatorFn {
  return (ctrl: AbstractControl): ValidationErrors | null => {
    const v = (ctrl.value || '').replace(/[\s\-]/g, '');
    if (!v) return null;
    return /^[12][0-9]{12}$/.test(v) ? null : { invalidNIR: true };
  };
}

function passwordStrengthValidator(): ValidatorFn {
  return (ctrl: AbstractControl): ValidationErrors | null => {
    const v: string = ctrl.value || '';
    if (!v) return null;
    const errors: Record<string, boolean> = {};
    if (!/[A-Z]/.test(v)) errors['noUppercase'] = true;
    if (!/[0-9]/.test(v)) errors['noDigit'] = true;
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(v)) errors['noSpecial'] = true;
    return Object.keys(errors).length ? { passwordStrength: errors } : null;
  };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LucideAngularModule],
  template: `
    <div class="auth-page">
      <div class="particles-container" aria-hidden="true">
        @for (p of particles; track $index) {
          <span class="particle" [style]="p.style">+</span>
        }
      </div>

      <div class="auth-container animate-scale-in">
        <div class="auth-brand">
          <div class="brand-top">
            <div class="logo-row">
              <div class="logo-mark">M</div>
              <h1 class="text-gradient" style="font-family:'Fraunces',Georgia,serif;font-size:24px;margin:0;">MediSync</h1>
            </div>
            <p style="color:#7A8A82;font-size:13px;margin-top:6px;">Créez votre compte patient</p>
          </div>
          <div class="brand-note glass-card" style="padding:16px;font-size:13px;color:#3A5248;line-height:1.6;">
            <p style="color:#2A4A38;font-weight:600;margin-bottom:6px;">🔒 Vos données sont sécurisées</p>
            Vos informations médicales sont chiffrées et accessibles uniquement aux professionnels de santé autorisés.
          </div>
        </div>

        <div class="auth-form-panel">
          <div class="auth-form-content">
            <div class="form-header">
              <h2>Créer un compte</h2>
              <p class="form-sub">Rejoignez MediSync en tant que patient</p>
            </div>

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="reg-form" novalidate>
              <div class="form-row-2">
                <div class="form-group">
                  <label>Prénom</label>
                  <input type="text" formControlName="firstName" class="glass-input" placeholder="Alice" />
                  @if (f['firstName'].invalid && f['firstName'].touched) {
                    <span class="error-msg">Obligatoire</span>
                  }
                </div>
                <div class="form-group">
                  <label>Nom</label>
                  <input type="text" formControlName="lastName" class="glass-input" placeholder="Bernard" />
                  @if (f['lastName'].invalid && f['lastName'].touched) {
                    <span class="error-msg">Obligatoire</span>
                  }
                </div>
              </div>

              <div class="form-group">
                <label>Adresse e-mail</label>
                <input type="email" formControlName="email" class="glass-input" placeholder="alice@example.fr" />
                @if (f['email'].invalid && f['email'].touched) {
                  <span class="error-msg">E-mail valide requis</span>
                }
              </div>

              <div class="form-row-2">
                <div class="form-group">
                  <label>Date de naissance</label>
                  <input type="date" formControlName="dateOfBirth" class="glass-input" />
                </div>
                <div class="form-group">
                  <label>Téléphone</label>
                  <input type="tel" formControlName="phone" class="glass-input" placeholder="06 12 34 56 78" />
                </div>
              </div>

              <div class="form-group">
                <label>N° de sécurité sociale <span style="color:#7A8A82;font-weight:400;font-family:'Geist',sans-serif;">(optionnel)</span></label>
                <input type="text" formControlName="numeroSecu" class="glass-input" placeholder="1 85 12 75 123 456" maxlength="17" />
                @if (f['numeroSecu'].errors?.['invalidNIR'] && f['numeroSecu'].touched) {
                  <span class="error-msg">Format invalide — 13 chiffres attendus</span>
                }
              </div>

              <div class="form-group">
                <label>Mot de passe</label>
                <div class="password-wrapper">
                  <input [type]="showPwd() ? 'text' : 'password'" formControlName="password" class="glass-input" placeholder="Créez un mot de passe fort" />
                  <button type="button" class="eye-toggle" (click)="showPwd.update(v => !v)">
                    {{ showPwd() ? '🙈' : '👁️' }}
                  </button>
                </div>
                <!-- Strength meter -->
                <div class="strength-meter">
                  <div class="strength-track">
                    <div class="strength-fill" [style.width]="strengthPct() + '%'" [class]="strengthClass()"></div>
                  </div>
                  <span class="strength-label" [class]="strengthClass()">{{ strengthLabel() }}</span>
                </div>
                <!-- Requirements checklist -->
                @if (f['password'].value) {
                  <div class="pwd-reqs">
                    <span [class.req-ok]="f['password'].value?.length >= 8">
                      {{ f['password'].value?.length >= 8 ? '✓' : '·' }} 8 caractères min.
                    </span>
                    <span [class.req-ok]="pwdHas('upper')">
                      {{ pwdHas('upper') ? '✓' : '·' }} 1 majuscule
                    </span>
                    <span [class.req-ok]="pwdHas('digit')">
                      {{ pwdHas('digit') ? '✓' : '·' }} 1 chiffre
                    </span>
                    <span [class.req-ok]="pwdHas('special')">
                      {{ pwdHas('special') ? '✓' : '·' }} 1 caractère spécial
                    </span>
                  </div>
                }
                @if (f['password'].errors?.['passwordStrength'] && f['password'].touched) {
                  <span class="error-msg">Le mot de passe ne respecte pas tous les critères</span>
                }
              </div>

              <div class="form-group">
                <label>Confirmer le mot de passe</label>
                <input [type]="showPwd() ? 'text' : 'password'" formControlName="confirmPassword" class="glass-input" [class.error]="passwordMismatch()" placeholder="Répétez votre mot de passe" />
                @if (passwordMismatch()) {
                  <span class="error-msg">Les mots de passe ne correspondent pas</span>
                }
              </div>

              <!-- RGPD consent banner -->
              <div class="rgpd-banner">
                <p style="font-size:12px;font-weight:700;color:#2A4A38;margin-bottom:6px;display:flex;align-items:center;gap:5px;"><lucide-icon name="shield" [size]="13" /> Informations RGPD</p>
                <p style="font-size:12px;color:#3A5248;line-height:1.6;">
                  MediSync collecte vos données personnelles (identité, coordonnées, données de santé) dans le but exclusif d'assurer votre suivi médical.
                  Ces données sont traitées conformément au <strong>Règlement Général sur la Protection des Données (RGPD)</strong>.
                  Vous disposez d'un droit d'accès, de rectification et d'effacement de vos données.
                </p>
              </div>
              <label class="terms-label">
                <input type="checkbox" formControlName="rgpd" class="checkbox" />
                <span>Je consens au traitement de mes données personnelles à des fins médicales conformément au RGPD <span style="color:#C24040;">*</span></span>
              </label>
              @if (f['rgpd'].invalid && f['rgpd'].touched) {
                <span class="error-msg" style="margin-top:-10px;">Ce consentement est obligatoire</span>
              }

              <label class="terms-label">
                <input type="checkbox" formControlName="terms" class="checkbox" />
                <span>J'accepte les <a href="#" style="color:#2A4A38;">Conditions d'utilisation</a> et la <a href="#" style="color:#2A4A38;">Politique de confidentialité</a></span>
              </label>

              @if (isStaffEmail()) {
                <div class="info-banner">
                  <lucide-icon name="info" [size]="14" style="flex-shrink:0;" />
                  Les comptes médecin et secrétaire sont créés par l'administrateur. Veuillez vous <a routerLink="/auth/login" style="color:#2A4A38;font-weight:600;">connecter directement</a>.
                </div>
              }

              @if (errorMsg()) {
                <div class="error-banner animate-slide-down">
                  <lucide-icon name="triangle-alert" [size]="14" style="flex-shrink:0;" /> {{ errorMsg() }}
                </div>
              }

              <button type="submit" class="btn-primary submit-btn" [disabled]="isLoading() || form.invalid || isStaffEmail()">
                @if (isLoading()) {
                  <span class="spinner"></span> Création en cours...
                } @else {
                  Créer un compte →
                }
              </button>
            </form>

            <p class="login-link">Déjà un compte ? <a routerLink="/auth/login">Se connecter →</a></p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height:100vh; display:flex; align-items:center; justify-content:center; position:relative; padding:20px; background:#F2EDE4; }
    .auth-container { display:grid; grid-template-columns:1fr 1.4fr; max-width:1000px; width:100%; background:#FAF7F1; backdrop-filter:blur(24px); border:1px solid rgba(42,74,56,0.15); border-radius:24px; overflow:hidden; box-shadow:0 0 60px rgba(42,74,56,0.06), 0 24px 80px rgba(27,37,32,0.14); @media(max-width:768px){grid-template-columns:1fr;} }
    .auth-brand { background:linear-gradient(160deg,rgba(42,74,56,0.06) 0%,rgba(201,99,60,0.08) 100%); border-right:1px solid rgba(42,74,56,0.12); padding:32px 28px; display:flex; flex-direction:column; gap:16px; @media(max-width:768px){display:none;} }
    .logo-row { display:flex; align-items:center; gap:12px; }
    .logo-mark { width:40px; height:40px; border-radius:12px; background:linear-gradient(135deg,#2A4A38,#C9633C); display:flex; align-items:center; justify-content:center; font-weight:900; font-size:18px; color:#1B2520; }
    .auth-form-panel { padding:40px 36px; overflow-y:auto; max-height:100vh; @media(max-width:480px){padding:28px 20px;} }
    .auth-form-content { width:100%; }
    .form-header { margin-bottom:24px; h2 { font-size:24px; font-weight:700; color:#1B2520; font-family:'Fraunces',Georgia,serif; } .form-sub { font-size:13px; color:#7A8A82; margin-top:4px; } }
    .reg-form { display:flex; flex-direction:column; gap:16px; }
    .form-row-2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .password-wrapper { position:relative; .glass-input { padding-right:46px; } }
    .eye-toggle { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; font-size:15px; color:#7A8A82; }
    .strength-meter { display:flex; align-items:center; gap:10px; margin-top:8px; }
    .strength-track { flex:1; height:5px; background:rgba(239,234,224,0.95); border-radius:10px; overflow:hidden; }
    .strength-fill { height:100%; border-radius:10px; transition:all 0.4s cubic-bezier(0.34,1.56,0.64,1); &.weak{background:#C24040;} &.fair{background:#B8792A;} &.strong{background:#2A4A38;} &.unbreakable{background:linear-gradient(90deg,#3D6B4F,#2A4A38);} }
    .strength-label { font-size:11px; font-weight:600; white-space:nowrap; &.weak{color:#C24040;} &.fair{color:#B8792A;} &.strong{color:#2A4A38;} &.unbreakable{color:#3D6B4F;} }
    .pwd-reqs { display:flex; flex-wrap:wrap; gap:6px 12px; margin-top:8px; }
    .pwd-reqs span { font-size:11px; color:#7A8A82; font-family:'JetBrains Mono',monospace; transition:color .2s; &.req-ok{color:#3D6B4F;font-weight:600;} }
    .terms-label { display:flex; align-items:flex-start; gap:8px; font-size:13px; color:#3A5248; cursor:pointer; line-height:1.5; }
    .checkbox { width:15px; height:15px; accent-color:#2A4A38; flex-shrink:0; margin-top:2px; }
    .info-banner  { display:flex; align-items:center; gap:10px; padding:12px 16px; background:rgba(42,74,56,0.07); border:1px solid rgba(42,74,56,0.25); border-radius:10px; font-size:13px; color:#2A4A38; }
    .error-banner { display:flex; align-items:center; gap:10px; padding:12px 16px; background:rgba(194,64,64,0.08); border:1px solid rgba(194,64,64,0.3); border-radius:10px; font-size:13px; color:#C24040; }
    .submit-btn { width:100%; justify-content:center; padding:13px; font-size:14px; }
    .spinner { width:15px; height:15px; border:2px solid rgba(0,0,0,0.3); border-top-color:#000; border-radius:50%; animation:spin 0.7s linear infinite; display:inline-block; }
    .rgpd-banner { padding:12px 14px;background:rgba(42,74,56,0.05);border:1px solid rgba(42,74,56,0.15);border-radius:10px; }
    .login-link { text-align:center; font-size:13px; color:#7A8A82; margin-top:16px; a { color:#2A4A38; font-weight:600; } }
    .particle { position:absolute; color:rgba(42,74,56,0.15); animation:float-up linear infinite; user-select:none; pointer-events:none; }
    @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    @keyframes float-up { 0%{transform:translateY(0) rotate(0deg);opacity:.6} 100%{transform:translateY(-100vh) rotate(360deg);opacity:0} }
  `],
})
export class RegisterComponent implements OnInit {
  showPwd   = signal(false);
  private _isLoading = signal(false);
  private _errorMsg  = signal('');
  readonly isLoading = this._isLoading.asReadonly();
  readonly errorMsg  = this._errorMsg.asReadonly();

  particles: { style: string }[] = [];
  form!: ReturnType<FormBuilder['group']>;

  get f() { return this.form.controls; }

  readonly passwordMismatch = () =>
    this.f['confirmPassword'].touched &&
    this.f['password'].value !== this.f['confirmPassword'].value;

  readonly isStaffEmail = () => {
    const email = (this.f['email']?.value || '') as string;
    if (!email) return false;
    const role = detectRole(email);
    return role === 'DOCTOR' || role === 'SECRETARY';
  };

  readonly strengthPct = () => {
    const pw = this.f['password'].value || '';
    let score = 0;
    if (pw.length >= 8)  score += 25;
    if (pw.length >= 12) score += 15;
    if (/[A-Z]/.test(pw)) score += 20;
    if (/[0-9]/.test(pw)) score += 20;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)) score += 20;
    return Math.min(100, score);
  };

  readonly strengthClass = () => {
    const pct = this.strengthPct();
    if (pct >= 90) return 'unbreakable';
    if (pct >= 65) return 'strong';
    if (pct >= 35) return 'fair';
    return 'weak';
  };

  readonly strengthLabel = () => {
    const map: Record<string, string> = { unbreakable: 'Très fort', strong: 'Fort', fair: 'Moyen', weak: 'Faible' };
    return map[this.strengthClass()] || '';
  };

  pwdHas(type: string): boolean {
    const v: string = this.f['password'].value || '';
    if (type === 'upper')   return /[A-Z]/.test(v);
    if (type === 'digit')   return /[0-9]/.test(v);
    if (type === 'special') return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(v);
    return false;
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notifSvc: NotificationService,
  ) {
    this.form = this.fb.group({
      firstName:       ['', Validators.required],
      lastName:        ['', Validators.required],
      email:           ['', [Validators.required, Validators.email]],
      dateOfBirth:     ['', Validators.required],
      phone:           [''],
      numeroSecu:      ['', nirValidator()],
      password:        ['', [Validators.required, Validators.minLength(8), passwordStrengthValidator()]],
      confirmPassword: ['', Validators.required],
      rgpd:            [false, Validators.requiredTrue],
      terms:           [false, Validators.requiredTrue],
    });
  }

  ngOnInit(): void {
    this.particles = Array.from({ length: 18 }, () => ({
      style: `left:${Math.random()*100}%;bottom:0;font-size:${12+Math.random()*14}px;animation-duration:${9+Math.random()*12}s;animation-delay:${Math.random()*8}s;`,
    }));
  }

  onSubmit(): void {
    if (this.form.invalid || this.passwordMismatch()) {
      this.form.markAllAsTouched();
      return;
    }
    this._isLoading.set(true);
    this._errorMsg.set('');

    const { confirmPassword, terms, ...data } = this.form.value;

    this.authService.register(data).subscribe({
      next: () => {
        this._isLoading.set(false);
        this.notifSvc.showToast('Compte créé ! Bienvenue sur MediSync !', 'success');
      },
      error: (err) => {
        this._isLoading.set(false);
        this._errorMsg.set(err.error?.message || 'Échec de l\'inscription. Veuillez réessayer.');
      },
    });
  }
}
