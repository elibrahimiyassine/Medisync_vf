import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LucideAngularModule } from 'lucide-angular';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-two-fa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LucideAngularModule],
  template: `
    <div class="auth-page">
      <div class="twofa-card glass-card animate-scale-in">
        <div class="twofa-icon"><lucide-icon name="lock-keyhole" [size]="48" /></div>
        <h2>Authentification en deux étapes</h2>
        <p class="sub">Saisissez le code à 6 chiffres de votre application d'authentification</p>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="twofa-form">
          <div class="otp-inputs">
            @for (i of [0,1,2,3,4,5]; track i) {
              <input
                type="text"
                maxlength="1"
                class="otp-box glass-input"
                [id]="'otp-' + i"
                (input)="onOtpInput($event, i)"
                (keydown.backspace)="onBackspace($event, i)"
                autocomplete="off"
                inputmode="numeric"
                pattern="[0-9]*" />
            }
          </div>

          @if (errorMsg()) {
            <div class="error-banner" style="display:flex;align-items:center;justify-content:center;gap:8px;"><lucide-icon name="triangle-alert" [size]="14" /> {{ errorMsg() }}</div>
          }

          <button type="submit" class="btn-primary submit-btn" [disabled]="isLoading() || form.invalid">
            @if (isLoading()) { <span class="spinner"></span> Vérification... }
            @else { Vérifier le code → }
          </button>
        </form>

        @if (rescanQr()) {
          <div style="text-align:center;margin:16px 0;">
            <p style="font-size:12px;color:#7A8A82;margin-bottom:10px;">Scannez ce QR code avec Google Authenticator</p>
            <img [src]="rescanQr()!" alt="QR Code" width="160" height="160"
              style="border:2px solid rgba(42,74,56,0.15);border-radius:10px;padding:8px;background:#fff;" />
            <button style="display:block;margin:8px auto 0;background:none;border:none;font-size:11px;color:#7A8A82;cursor:pointer;font-family:'Geist','Inter',sans-serif;"
              (click)="hideRescan()">Masquer le QR code</button>
          </div>
        }

        <button class="rescan-btn" (click)="showRescanQr()" [disabled]="rescanLoading()">
          @if (rescanLoading()) { <span class="spinner" style="width:13px;height:13px;border-width:2px;border-top-color:#7A8A82;border-color:rgba(0,0,0,0.15);"></span> Chargement... }
          @else { <lucide-icon name="smartphone" [size]="13" /> J'ai supprimé mon application — rescanner le QR code }
        </button>

        <a routerLink="/auth/login" class="back-link" style="display:inline-flex;align-items:center;justify-content:center;gap:5px;"><lucide-icon name="arrow-left" [size]="13" /> Retour à la connexion</a>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height:100vh; display:flex; align-items:center; justify-content:center; background:#F2EDE4; }
    .twofa-card { max-width:420px; width:100%; padding:48px 40px; text-align:center; margin:20px; }
    .twofa-icon { display:flex; align-items:center; justify-content:center; margin-bottom:16px; color:#2A4A38; }
    h2 { font-size:22px; font-weight:700; color:#1B2520; font-family:'Fraunces',Georgia,serif; margin-bottom:8px; }
    .sub { font-size:13px; color:#7A8A82; margin-bottom:32px; }
    .twofa-form { display:flex; flex-direction:column; gap:20px; }
    .otp-inputs { display:flex; gap:10px; justify-content:center; }
    .otp-box { width:50px; height:58px; text-align:center; font-size:22px; font-weight:700; font-family:'JetBrains Mono',monospace; border-radius:12px; padding:0; }
    .error-banner { background:rgba(194,64,64,0.08); border:1px solid rgba(194,64,64,0.3); border-radius:10px; padding:12px; font-size:13px; color:#C24040; }
    .submit-btn { width:100%; justify-content:center; padding:13px; }
    .spinner { width:15px; height:15px; border:2px solid rgba(0,0,0,0.3); border-top-color:#000; border-radius:50%; animation:spin .7s linear infinite; display:inline-block; }
    .back-link { display:block; margin-top:20px; font-size:13px; color:#7A8A82; &:hover{color:#2A4A38;} }
    .rescan-btn { display:flex; align-items:center; justify-content:center; gap:6px; margin-top:16px; background:none; border:1px solid rgba(42,74,56,0.15); border-radius:10px; padding:9px 14px; font-size:12px; color:#7A8A82; cursor:pointer; width:100%; font-family:'Geist','Inter',sans-serif; transition:all .2s; &:hover:not(:disabled){border-color:#2A4A38;color:#2A4A38;} &:disabled{opacity:.5;cursor:not-allowed;} }
    @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  `],
})
export class TwoFaComponent implements OnInit {
  private _isLoading    = signal(false);
  private _errorMsg     = signal('');
  private _rescanQr     = signal<string | null>(null);
  private _rescanLoading = signal(false);

  readonly isLoading     = this._isLoading.asReadonly();
  readonly errorMsg      = this._errorMsg.asReadonly();
  readonly rescanQr      = this._rescanQr.asReadonly();
  readonly rescanLoading = this._rescanLoading.asReadonly();

  private userId = '';
  private otpValues = ['', '', '', '', '', ''];

  form!: ReturnType<FormBuilder['group']>;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notif: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.form = this.fb.group({ code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]] });
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.queryParamMap.get('userId') || '';
    if (!this.userId) this.router.navigate(['/auth/login']);
  }

  onOtpInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const val = input.value.replace(/\D/g, '');
    input.value = val;
    this.otpValues[index] = val;

    if (val && index < 5) {
      (document.getElementById(`otp-${index + 1}`) as HTMLInputElement)?.focus();
    }

    this.form.patchValue({ code: this.otpValues.join('') });
  }

  onBackspace(_event: Event, index: number): void {
    if (!this.otpValues[index] && index > 0) {
      (document.getElementById(`otp-${index - 1}`) as HTMLInputElement)?.focus();
    }
  }

  onSubmit(): void {
    const code = this.form.value.code!;
    if (code.length !== 6) return;
    this._isLoading.set(true);

    this.authService.verify2FA(this.userId, code).subscribe({
      next: () => { this._isLoading.set(false); },
      error: (err) => {
        this._isLoading.set(false);
        this._errorMsg.set(err.error?.message || 'Code invalide. Veuillez réessayer.');
      },
    });
  }

  showRescanQr(): void {
    if (this._rescanQr()) { this._rescanQr.set(null); return; }
    this._rescanLoading.set(true);
    this.authService.rescan2FA(this.userId).subscribe({
      next: (res: any) => {
        this._rescanQr.set(res.data?.qrCodeUrl ?? null);
        this._rescanLoading.set(false);
      },
      error: () => {
        this.notif.showToast('Impossible de charger le QR code', 'error');
        this._rescanLoading.set(false);
      },
    });
  }

  hideRescan(): void {
    this._rescanQr.set(null);
  }
}
