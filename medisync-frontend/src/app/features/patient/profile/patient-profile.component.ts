import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent, TopbarComponent],
  template: `
    <app-sidebar />
    <app-topbar />
    <main class="page-wrapper">
      <div class="page-content">
        <h2 style="font-family:'Fraunces',Georgia,serif;margin-bottom:24px;">Mon Profil</h2>
        @if (patient()) {
          <div class="grid-2 stagger" style="align-items:start;">
            <div class="glass-card" style="padding:28px;">
              <h3 style="margin-bottom:20px;font-size:16px;font-weight:600;">Informations personnelles</h3>
              <form [formGroup]="form" (ngSubmit)="save()">
                <div class="grid-2" style="gap:14px;">
                  <div class="form-group"><label>Prénom</label><input formControlName="firstName" class="glass-input" /></div>
                  <div class="form-group"><label>Nom</label><input formControlName="lastName" class="glass-input" /></div>
                </div>
                <div class="form-group" style="margin-top:14px;"><label>Téléphone</label><input formControlName="phone" class="glass-input" type="tel" /></div>
                <div class="form-group" style="margin-top:14px;"><label>Adresse</label><input formControlName="address" class="glass-input" /></div>
                <div class="form-group" style="margin-top:14px;"><label>Date de naissance</label><input formControlName="dateOfBirth" class="glass-input" type="date" /></div>
                <div class="form-group" style="margin-top:14px;">
                  <label>Groupe sanguin</label>
                  <select formControlName="bloodType" class="glass-input">
                    <option value="">Non défini</option>
                    @for (bt of bloodTypes; track bt.value) {
                      <option [value]="bt.value">{{ bt.label }}</option>
                    }
                  </select>
                </div>
                <div class="form-group" style="margin-top:14px;">
                  <label>Contact d'urgence</label>
                  <input formControlName="emergencyContact" class="glass-input" placeholder="Nom du contact" />
                </div>
                <div class="form-group" style="margin-top:14px;">
                  <label>Téléphone d'urgence</label>
                  <input formControlName="emergencyPhone" class="glass-input" type="tel" />
                </div>
                <button type="submit" class="btn-primary" style="width:100%;margin-top:20px;justify-content:center;" [disabled]="saving()">
                  {{ saving() ? 'Enregistrement...' : 'Enregistrer les modifications' }}
                </button>
              </form>
            </div>
            <div class="glass-card" style="padding:28px;">
              <h3 style="margin-bottom:20px;font-size:16px;font-weight:600;">Détails du compte</h3>
              <div style="display:flex;flex-direction:column;gap:14px;">
                <div><p style="font-size:11px;color:#7A8A82;font-weight:700;text-transform:uppercase;letter-spacing:.07em;margin-bottom:4px;">E-mail</p><p style="font-size:14px;color:#1B2520;">{{ authService.user()?.email }}</p></div>
                <div><p style="font-size:11px;color:#7A8A82;font-weight:700;text-transform:uppercase;letter-spacing:.07em;margin-bottom:4px;">Rôle</p><span class="badge confirmed">Patient</span></div>
                <div><p style="font-size:11px;color:#7A8A82;font-weight:700;text-transform:uppercase;letter-spacing:.07em;margin-bottom:4px;">Membre depuis</p><p style="font-size:14px;color:#3A5248;">{{ patient().createdAt ? (patient().createdAt | date:'MMMM yyyy') : '—' }}</p></div>
              </div>
            </div>
          </div>
        }
      </div>
    </main>
  `,
  styles: [`
    select.glass-input option { background: #FAF7F1; color: #1B2520; }
    .form-group { display:flex;flex-direction:column;gap:6px; label{font-size:13px;font-weight:600;color:#3A5248;} }
  `],
})
export class PatientProfileComponent implements OnInit {
  private _patient = signal<any>(null);
  private _saving  = signal(false);
  readonly patient  = this._patient.asReadonly();
  readonly saving   = this._saving.asReadonly();

  bloodTypes = [
    { value: 'A_POS', label: 'A+' }, { value: 'A_NEG', label: 'A-' },
    { value: 'B_POS', label: 'B+' }, { value: 'B_NEG', label: 'B-' },
    { value: 'AB_POS', label: 'AB+' }, { value: 'AB_NEG', label: 'AB-' },
    { value: 'O_POS', label: 'O+' }, { value: 'O_NEG', label: 'O-' },
  ];

  form!: ReturnType<FormBuilder['group']>;

  constructor(
    private api: ApiService,
    public authService: AuthService,
    private notifSvc: NotificationService,
    private fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      firstName: [''], lastName: [''], phone: [''], address: [''],
      dateOfBirth: [''], bloodType: [''], emergencyContact: [''], emergencyPhone: [''],
    });
  }

  ngOnInit(): void {
    this.api.get<any>('/patients/me').subscribe(res => {
      const p = res.data;
      this._patient.set(p);
      this.form.patchValue({
        firstName: p.firstName || '', lastName: p.lastName || '', phone: p.phone || '',
        address: p.address || '', dateOfBirth: p.dateOfBirth?.slice(0, 10) || '',
        bloodType: p.bloodType || '', emergencyContact: p.emergencyContact || '',
        emergencyPhone: p.emergencyPhone || '',
      });
    });
  }

  save(): void {
    this._saving.set(true);
    this.api.put<any>('/patients/me', this.form.value).subscribe({
      next: () => { this._saving.set(false); this.notifSvc.showToast('Profil mis à jour !', 'success'); },
      error: () => { this._saving.set(false); this.notifSvc.showToast('Échec de l\'enregistrement', 'error'); },
    });
  }
}
