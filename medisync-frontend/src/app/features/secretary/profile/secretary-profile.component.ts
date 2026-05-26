import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';

@Component({
  selector: 'app-secretary-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent, TopbarComponent],
  template: `
    <app-sidebar />
    <app-topbar />
    <main class="page-wrapper">
      <div class="page-content">
        <h2 style="font-family:'Fraunces',Georgia,serif;margin-bottom:24px;">Mon Profil Secrétaire</h2>
        <div class="grid-2 stagger" style="align-items:start;">

          <div class="glass-card" style="padding:28px;">
            <h3 style="margin-bottom:20px;font-size:16px;font-weight:600;">Informations personnelles</h3>
            <form [formGroup]="form" (ngSubmit)="save()">
              <div class="grid-2" style="gap:14px;">
                <div class="form-group"><label>Prénom</label><input formControlName="firstName" class="glass-input" /></div>
                <div class="form-group"><label>Nom</label><input formControlName="lastName" class="glass-input" /></div>
              </div>
              <div class="form-group" style="margin-top:14px;">
                <label>Téléphone</label>
                <input formControlName="phone" class="glass-input" type="tel" />
              </div>
              <button type="submit" class="btn-primary" style="width:100%;margin-top:20px;justify-content:center;" [disabled]="saving()">
                {{ saving() ? 'Enregistrement...' : 'Enregistrer les modifications' }}
              </button>
            </form>
          </div>

          <div class="glass-card" style="padding:28px;">
            <h3 style="margin-bottom:20px;font-size:16px;font-weight:600;">Détails du compte</h3>
            <div style="display:flex;flex-direction:column;gap:14px;">
              <div>
                <p style="font-size:11px;color:#7A8A82;font-weight:700;text-transform:uppercase;letter-spacing:.07em;margin-bottom:4px;">E-mail</p>
                <p style="font-size:14px;color:#1B2520;">{{ authService.user()?.email }}</p>
              </div>
              <div>
                <p style="font-size:11px;color:#7A8A82;font-weight:700;text-transform:uppercase;letter-spacing:.07em;margin-bottom:4px;">Rôle</p>
                <span class="badge" style="background:rgba(184,121,42,0.14);color:#B8792A;border:1px solid rgba(184,121,42,0.3);">Secrétaire</span>
              </div>
              <div>
                <p style="font-size:11px;color:#7A8A82;font-weight:700;text-transform:uppercase;letter-spacing:.07em;margin-bottom:4px;">Service</p>
                <p style="font-size:14px;color:#3A5248;">Accueil & Gestion administrative</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  `,
  styles: [`
    .form-group { display:flex;flex-direction:column;gap:6px; label{font-size:13px;font-weight:600;color:#3A5248;} }
  `],
})
export class SecretaryProfileComponent {
  private _saving = signal(false);
  readonly saving = this._saving.asReadonly();

  form!: ReturnType<FormBuilder['group']>;

  constructor(
    public authService: AuthService,
    private api: ApiService,
    private notifSvc: NotificationService,
    private fb: FormBuilder,
  ) {
    const p = this.authService.user()?.profile;
    this.form = this.fb.group({
      firstName: [p?.firstName || ''],
      lastName:  [p?.lastName  || ''],
      phone:     [p?.phone     || ''],
    });
  }

  save(): void {
    this._saving.set(true);
    this.api.put<any>('/secretary/me', this.form.value).subscribe({
      next: () => { this._saving.set(false); this.notifSvc.showToast('Profil mis à jour !', 'success'); },
      error: () => { this._saving.set(false); this.notifSvc.showToast('Échec de l\'enregistrement', 'error'); },
    });
  }
}
