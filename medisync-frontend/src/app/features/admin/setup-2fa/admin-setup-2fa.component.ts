import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-admin-setup-2fa',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  template: `
    <div class="setup-page">
      <div class="setup-card glass-card animate-scale-in">

        <div class="setup-icon">
          <lucide-icon name="shield-check" [size]="48" />
        </div>

        <h1 class="setup-title">Configuration de la 2FA obligatoire</h1>
        <p class="setup-sub">
          Scannez le QR code ci-dessous avec <strong>Google Authenticator</strong>,
          puis entrez le code à 6 chiffres pour activer la 2FA.
        </p>

        <div class="steps">
          <!-- Étape 1 : QR Code -->
          <div class="step">
            <div class="step-num">1</div>
            <p>Scannez ce QR code avec votre application d'authentification</p>
          </div>

          <div class="qr-container">
            @if (loading()) {
              <div class="qr-loading">
                <span class="spinner" style="width:32px;height:32px;border-width:3px;"></span>
              </div>
            }
            @if (totpData()) {
              <img [src]="totpData()!.qrCodeUrl" alt="QR Code 2FA" width="180" height="180" />
            }
          </div>

          @if (totpData()) {
            <div class="secret-box">
              <p class="secret-label">Clé manuelle (si scan impossible)</p>
              <code class="secret-code">{{ totpData()!.secret }}</code>
            </div>
          }

          <!-- Étape 2 : Code OTP -->
          <div class="step" style="margin-top:8px;">
            <div class="step-num">2</div>
            <p>Entrez le code à 6 chiffres affiché dans l'application</p>
          </div>

          <div class="otp-inputs">
            @for (i of [0,1,2,3,4,5]; track i) {
              <input
                type="text"
                maxlength="1"
                class="otp-box glass-input"
                [id]="'setup-otp-' + i"
                (input)="onOtpInput($event, i)"
                (keydown.backspace)="onBackspace($event, i)"
                autocomplete="off"
                inputmode="numeric"
                pattern="[0-9]*" />
            }
          </div>

          @if (errorMsg()) {
            <div class="error-banner">
              <lucide-icon name="triangle-alert" [size]="14" />
              {{ errorMsg() }}
            </div>
          }

          <button class="activate-btn" (click)="verify()" [disabled]="verifying() || otpCode.length !== 6">
            @if (verifying()) { <span class="spinner"></span> }
            {{ verifying() ? 'Vérification...' : 'Activer la 2FA et accéder au tableau de bord' }}
          </button>
        </div>

        <button class="logout-link" (click)="logout()">
          <lucide-icon name="log-out" [size]="13" /> Se déconnecter
        </button>
      </div>
    </div>
  `,
  styles: [`
    .setup-page { min-height:100vh; display:flex; align-items:center; justify-content:center; background:#F2EDE4; padding:20px; }
    .setup-card { max-width:480px; width:100%; padding:48px 40px; text-align:center; }
    .setup-icon { display:flex; align-items:center; justify-content:center; margin-bottom:20px; color:#2A4A38; }
    .setup-title { font-size:22px; font-weight:700; color:#1B2520; font-family:'Fraunces',Georgia,serif; margin-bottom:10px; }
    .setup-sub { font-size:13px; color:#7A8A82; margin-bottom:28px; line-height:1.6; }

    .steps { display:flex; flex-direction:column; gap:16px; width:100%; }
    .step { display:flex; align-items:center; gap:12px; text-align:left; }
    .step-num { width:28px; height:28px; border-radius:50%; background:#2A4A38; color:#fff; font-size:13px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .step p { font-size:13px; color:#3A5248; margin:0; }

    .qr-container { border:2px solid rgba(42,74,56,0.15); border-radius:12px; padding:16px; background:#fff; display:flex; align-items:center; justify-content:center; min-height:212px; margin:0 auto; }
    .qr-container img { display:block; border-radius:4px; }
    .qr-loading { display:flex; align-items:center; justify-content:center; }

    .secret-box { background:rgba(42,74,56,0.06); border-radius:10px; padding:12px 16px; text-align:left; }
    .secret-label { font-size:11px; font-weight:700; color:#7A8A82; text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px; }
    .secret-code { display:block; font-family:'JetBrains Mono',monospace; font-size:12px; color:#2A4A38; letter-spacing:.1em; word-break:break-all; }

    .otp-inputs { display:flex; gap:10px; justify-content:center; }
    .otp-box { width:50px; height:58px; text-align:center; font-size:22px; font-weight:700; font-family:'JetBrains Mono',monospace; border-radius:12px; padding:0; }

    .error-banner { display:flex; align-items:center; justify-content:center; gap:8px; background:rgba(194,64,64,0.08); border:1px solid rgba(194,64,64,0.3); border-radius:10px; padding:12px; font-size:13px; color:#C24040; }

    .activate-btn {
      width:100%; padding:14px; border:none; border-radius:12px;
      background:#2A4A38; color:#fff; font-size:14px; font-weight:600;
      cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;
      font-family:'Geist','Inter',sans-serif; transition:background .2s;
      &:hover:not(:disabled) { background:#1B3228; }
      &:disabled { opacity:0.5; cursor:not-allowed; }
    }
    .spinner { width:15px; height:15px; border:2px solid rgba(255,255,255,0.4); border-top-color:#fff; border-radius:50%; animation:spin .7s linear infinite; display:inline-block; flex-shrink:0; }

    .logout-link { display:flex; align-items:center; justify-content:center; gap:6px; margin-top:20px; background:none; border:none; font-size:13px; color:#7A8A82; cursor:pointer; font-family:'Geist','Inter',sans-serif; width:100%; &:hover{color:#C24040;} }

    @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  `],
})
export class AdminSetup2faComponent implements OnInit {
  private _loading   = signal(false);
  private _verifying = signal(false);
  private _errorMsg  = signal('');
  private _totpData  = signal<{ qrCodeUrl: string; secret: string } | null>(null);

  readonly loading   = this._loading.asReadonly();
  readonly verifying = this._verifying.asReadonly();
  readonly errorMsg  = this._errorMsg.asReadonly();
  readonly totpData  = this._totpData.asReadonly();

  otpCode = '';
  private otpValues = ['', '', '', '', '', ''];

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private notif: NotificationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    if (this.auth.user()?.twoFactorEnabled) {
      this.router.navigate(['/admin/dashboard']);
      return;
    }
    this.generateQR();
  }

  generateQR(): void {
    this._loading.set(true);
    this.api.get<any>('/admin/totp/setup').subscribe({
      next: (res) => {
        const secret = res.data?.secret;
        const qrCodeUrl = res.data?.qrCodeUrl || res.data?.qrCode;
        if (!secret || !qrCodeUrl) {
          this.notif.showToast('Erreur lors de la génération du QR code', 'error');
          return;
        }
        this._totpData.set({ qrCodeUrl, secret });
      },
      error: () => this.notif.showToast('Impossible de générer le QR code. Réessayez.', 'error'),
      complete: () => this._loading.set(false),
    });
  }

  onOtpInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const val = input.value.replace(/\D/g, '');
    input.value = val;
    this.otpValues[index] = val;
    if (val && index < 5) {
      (document.getElementById(`setup-otp-${index + 1}`) as HTMLInputElement)?.focus();
    }
    this.otpCode = this.otpValues.join('');
  }

  onBackspace(_event: Event, index: number): void {
    if (!this.otpValues[index] && index > 0) {
      (document.getElementById(`setup-otp-${index - 1}`) as HTMLInputElement)?.focus();
    }
  }

  verify(): void {
    if (this.otpCode.length !== 6) return;
    this._verifying.set(true);
    this._errorMsg.set('');

    this.api.post<any>('/admin/totp/verify', { code: this.otpCode }).subscribe({
      next: () => {
        this._verifying.set(false);
        this.notif.showToast('2FA activée avec succès !', 'success');
        this.auth.updateUser({ twoFactorEnabled: true });
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        this._verifying.set(false);
        this._errorMsg.set(err.error?.message || 'Code invalide. Vérifiez votre application et réessayez.');
      },
    });
  }

  logout(): void {
    this.auth.logout();
  }
}
