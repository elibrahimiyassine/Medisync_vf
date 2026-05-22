import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';

@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent, TopbarComponent],
  template: `
    <app-sidebar />
    <app-topbar />
    <main class="page-wrapper">
      <div class="page-content">
        <h2 style="font-family:'Fraunces',Georgia,serif;margin-bottom:24px;">Mon Profil Médecin</h2>
        <div class="grid-2 stagger" style="align-items:start;">

          <!-- Informations personnelles -->
          <div class="glass-card" style="padding:28px;">
            <h3 style="margin-bottom:20px;font-size:16px;font-weight:600;">Informations personnelles</h3>
            <form [formGroup]="form" (ngSubmit)="save()">
              <div class="grid-2" style="gap:14px;">
                <div class="form-group"><label>Prénom</label><input formControlName="firstName" class="glass-input" /></div>
                <div class="form-group"><label>Nom</label><input formControlName="lastName" class="glass-input" /></div>
              </div>
              <div class="form-group" style="margin-top:14px;"><label>Spécialité</label><input formControlName="specialty" class="glass-input" /></div>
              <div class="form-group" style="margin-top:14px;"><label>Téléphone</label><input formControlName="phone" class="glass-input" type="tel" /></div>
              <div class="form-group" style="margin-top:14px;">
                <label>Biographie</label>
                <textarea formControlName="bio" class="glass-input" rows="4" style="resize:vertical;"></textarea>
              </div>
              <button type="submit" class="btn-primary" style="width:100%;margin-top:20px;justify-content:center;" [disabled]="saving()">
                {{ saving() ? 'Enregistrement...' : 'Enregistrer les modifications' }}
              </button>
            </form>
          </div>

          <!-- Détails du compte -->
          <div style="display:flex;flex-direction:column;gap:16px;">
            <div class="glass-card" style="padding:28px;">
              <h3 style="margin-bottom:20px;font-size:16px;font-weight:600;">Détails du compte</h3>
              <div style="display:flex;flex-direction:column;gap:14px;">
                <div>
                  <p style="font-size:11px;color:#7A8A82;font-weight:700;text-transform:uppercase;letter-spacing:.07em;margin-bottom:4px;">E-mail</p>
                  <p style="font-size:14px;color:#1B2520;">{{ authService.user()?.email }}</p>
                </div>
                <div>
                  <p style="font-size:11px;color:#7A8A82;font-weight:700;text-transform:uppercase;letter-spacing:.07em;margin-bottom:4px;">Rôle</p>
                  <span class="badge" style="background:rgba(61,107,79,0.12);color:#3D6B4F;border:1px solid rgba(61,107,79,0.3);">Médecin</span>
                </div>
                <div>
                  <p style="font-size:11px;color:#7A8A82;font-weight:700;text-transform:uppercase;letter-spacing:.07em;margin-bottom:4px;">Spécialité</p>
                  <p style="font-size:14px;color:#3A5248;">{{ authService.user()?.profile?.specialty || '—' }}</p>
                </div>
              </div>
            </div>

            <!-- Statistiques -->
            <div class="glass-card" style="padding:28px;">
              <h3 style="margin-bottom:20px;font-size:16px;font-weight:600;">Statistiques</h3>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                <div style="text-align:center;padding:16px;background:rgba(42,74,56,0.05);border-radius:12px;border:1px solid rgba(42,74,56,0.1);">
                  <p style="font-size:28px;font-weight:800;color:#2A4A38;font-family:'JetBrains Mono',monospace;">{{ doctorStats().consultations }}</p>
                  <p style="font-size:11px;color:#7A8A82;margin-top:4px;">Consultations</p>
                </div>
                <div style="text-align:center;padding:16px;background:rgba(255,184,0,0.05);border-radius:12px;border:1px solid rgba(255,184,0,0.1);">
                  <p style="font-size:28px;font-weight:800;color:#B8792A;font-family:'JetBrains Mono',monospace;">{{ doctorStats().rating }}</p>
                  <p style="font-size:11px;color:#7A8A82;margin-top:4px;">Note moyenne</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  `,
  styles: [`
    textarea.glass-input { padding-top: 10px; }
    .form-group { display:flex;flex-direction:column;gap:6px; label{font-size:13px;font-weight:600;color:#3A5248;} }
  `],
})
export class DoctorProfileComponent implements OnInit {
  private _saving = signal(false);
  readonly saving = this._saving.asReadonly();

  private _doctorStats = signal({ consultations: 2340, rating: 4.9 });
  readonly doctorStats = this._doctorStats.asReadonly();

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
      specialty: [p?.specialty || ''],
      phone:     [p?.phone     || ''],
      bio:       [p?.bio       || ''],
    });
  }

  ngOnInit(): void {
    this.api.get<any>('/doctors/me/profile').subscribe(res => {
      if (res?.data) {
        const d = res.data;
        this.form.patchValue({
          firstName: d.firstName,
          lastName:  d.lastName,
          specialty: d.specialty,
          phone:     d.phone || '',
          bio:       d.bio   || '',
        });
        this._doctorStats.set({ consultations: d.consultations || 2340, rating: d.rating || 4.9 });
      }
    });
  }

  save(): void {
    this._saving.set(true);
    this.api.put<any>('/doctors/me', this.form.value).subscribe({
      next: () => { this._saving.set(false); this.notifSvc.showToast('Profil mis à jour !', 'success'); },
      error: () => { this._saving.set(false); this.notifSvc.showToast('Échec de l\'enregistrement', 'error'); },
    });
  }
}
