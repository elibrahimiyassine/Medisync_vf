import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LucideAngularModule],
  template: `
    <div class="auth-page">
      <div class="fp-card glass-card animate-scale-in">
        @if (!sent()) {
          <div class="fp-icon"><lucide-icon name="key" [size]="44" /></div>
          <h2>Réinitialiser le mot de passe</h2>
          <p class="sub">Saisissez votre e-mail pour recevoir un lien de réinitialisation</p>

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label>Adresse e-mail</label>
              <input type="email" formControlName="email" class="glass-input" placeholder="vous@exemple.ma" />
            </div>

            @if (errorMsg()) {
              <div class="error-banner" style="margin-top:12px;display:flex;align-items:center;gap:8px;"><lucide-icon name="triangle-alert" [size]="14" /> {{ errorMsg() }}</div>
            }

            <button type="submit" class="btn-primary submit-btn" [disabled]="isLoading() || form.invalid" style="margin-top:16px;">
              @if (isLoading()) { <span class="spinner"></span> Envoi... }
              @else { Envoyer le lien → }
            </button>
          </form>
        } @else {
          <div class="sent-state animate-scale-in">
            <div class="sent-icon"><lucide-icon name="mail" [size]="44" /></div>
            <h2>Vérifiez votre boite mail</h2>
            <p class="sub">Nous avons envoyé un lien de réinitialisation à <strong style="color:#2A4A38;">{{ form.value.email }}</strong></p>
            <p class="sub" style="margin-top:8px;">Vous ne l'avez pas reçu ? Vérifiez votre dossier spam.</p>
          </div>
        }

        <a routerLink="/auth/login" class="back-link" style="display:inline-flex;align-items:center;justify-content:center;gap:5px;"><lucide-icon name="arrow-left" [size]="13" /> Retour à la connexion</a>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height:100vh; display:flex; align-items:center; justify-content:center; background:#F2EDE4; }
    .fp-card { max-width:400px; width:100%; padding:48px 40px; margin:20px; }
    .fp-icon, .sent-icon { display:flex; align-items:center; justify-content:center; margin-bottom:16px; color:#2A4A38; }
    h2 { font-size:22px; font-weight:700; color:#1B2520; font-family:'Fraunces',Georgia,serif; margin-bottom:8px; text-align:center; }
    .sub { font-size:13px; color:#7A8A82; text-align:center; line-height:1.6; }
    .form-group { display:flex; flex-direction:column; gap:6px; label{font-size:13px;font-weight:600;color:#3A5248;} }
    .error-banner { background:rgba(194,64,64,0.08); border:1px solid rgba(194,64,64,0.3); border-radius:10px; padding:12px; font-size:13px; color:#C24040; }
    .submit-btn { width:100%; justify-content:center; padding:13px; }
    .spinner { width:15px; height:15px; border:2px solid rgba(0,0,0,0.3); border-top-color:#000; border-radius:50%; animation:spin .7s linear infinite; display:inline-block; }
    .back-link { display:block; margin-top:24px; font-size:13px; color:#7A8A82; text-align:center; &:hover{color:#2A4A38;} }
    .sent-state { text-align:center; display:flex; flex-direction:column; align-items:center; gap:8px; }
    @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  `],
})
export class ForgotPasswordComponent {
  private _sent      = signal(false);
  private _isLoading = signal(false);
  private _errorMsg  = signal('');
  readonly sent      = this._sent.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly errorMsg  = this._errorMsg.asReadonly();

  form!: ReturnType<FormBuilder['group']>;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.form = this.fb.group({ email: ['', [Validators.required, Validators.email]] });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this._isLoading.set(true);
    this.authService.forgotPassword(this.form.value.email!).subscribe({
      next: () => { this._isLoading.set(false); this._sent.set(true); },
      error: () => { this._isLoading.set(false); this._sent.set(true); },
    });
  }
}
