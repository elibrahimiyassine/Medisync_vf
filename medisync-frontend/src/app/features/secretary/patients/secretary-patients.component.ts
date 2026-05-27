import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';

@Component({
  selector: 'app-secretary-patients',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarComponent, TopbarComponent],
  template: `
    <app-sidebar />
    <app-topbar />
    <main class="page-wrapper">
      <div class="page-content">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
          <h2 style="font-family:'Fraunces',Georgia,serif;">Registre des patients</h2>
          <div style="display:flex;gap:10px;">
            <input type="text" class="glass-input" style="width:240px;" placeholder="Rechercher un patient..." (input)="search($event)" />
            <button class="btn-primary" (click)="showModal.set(true)">+ Créer un patient</button>
          </div>
        </div>
        <div class="glass-card" style="padding:0;overflow:hidden;">
          <table class="ms-table">
            <thead><tr><th>Nom</th><th>E-mail</th><th>Téléphone</th><th>Convention</th><th>Groupe sanguin</th><th>Allergies</th></tr></thead>
            <tbody>
              @for (p of patients(); track p.id) {
                <tr>
                  <td><strong style="color:#1B2520;">{{ p.firstName }} {{ p.lastName }}</strong></td>
                  <td style="color:#7A8A82;">{{ p.user?.email }}</td>
                  <td>{{ p.phone || '—' }}</td>
                  <td>
                    @if (p.company) {
                      <div>
                        <span style="font-size:12px;font-weight:600;color:#2A4A38;">{{ p.company }}</span>
                        @if (p.conventionRate) {
                          <span style="display:block;font-size:11px;color:#7A8A82;">Prise en charge : {{ p.conventionRate }}%</span>
                        }
                      </div>
                    } @else {
                      <span style="color:#7A8A82;">—</span>
                    }
                  </td>
                  <td>
                    @if (p.bloodType) {
                      <span class="badge" style="background:rgba(194,64,64,0.12);color:#C24040;border:1px solid rgba(194,64,64,0.3);">{{ p.bloodType.replace('_POS','+').replace('_NEG','-') }}</span>
                    } @else { <span style="color:#7A8A82;">—</span> }
                  </td>
                  <td>{{ p.allergies?.join(', ') || '—' }}</td>
                </tr>
              }
              @empty {
                <tr><td colspan="6" style="text-align:center;color:#7A8A82;padding:40px;">Aucun patient trouvé</td></tr>
              }
            </tbody>
          </table>
        </div>

      </div>
    </main>

    @if (showModal()) {
      <div class="overlay" (click)="closeModal()">
        <div class="glass-card modal-card" (click)="$event.stopPropagation()">
          <h3 style="font-family:'Fraunces',Georgia,serif;margin-bottom:20px;">Créer un compte patient</h3>
          <p style="font-size:12px;color:#7A8A82;margin:-8px 0 14px;line-height:1.5;">
            Un mot de passe temporaire sera généré automatiquement et envoyé par e-mail au patient.
          </p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
            <div class="form-group"><label>Prénom *</label><input class="glass-input" [(ngModel)]="form.firstName" placeholder="Alice" /></div>
            <div class="form-group"><label>Nom *</label><input class="glass-input" [(ngModel)]="form.lastName" placeholder="Bernard" /></div>
            <div class="form-group"><label>E-mail *</label><input class="glass-input" type="email" [(ngModel)]="form.email" placeholder="alice@example.fr" /></div>
            <div class="form-group"><label>Téléphone</label><input class="glass-input" [(ngModel)]="form.phone" placeholder="06 12 34 56 78" /></div>
            <div class="form-group"><label>Date de naissance</label><input class="glass-input" type="date" [(ngModel)]="form.dateOfBirth" /></div>
            <div class="form-group">
              <label>Groupe sanguin</label>
              <select class="glass-input" [(ngModel)]="form.bloodType">
                <option value="">— Non renseigné —</option>
                <option value="A_POS">A+</option><option value="A_NEG">A-</option>
                <option value="B_POS">B+</option><option value="B_NEG">B-</option>
                <option value="AB_POS">AB+</option><option value="AB_NEG">AB-</option>
                <option value="O_POS">O+</option><option value="O_NEG">O-</option>
              </select>
            </div>
          </div>
          <div style="display:flex;gap:10px;margin-top:20px;justify-content:flex-end;">
            <button class="btn-secondary" (click)="closeModal()">Annuler</button>
            <button class="btn-primary" (click)="createPatient()" [disabled]="saving()">
              {{ saving() ? 'Création...' : 'Créer le patient' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .overlay { position:fixed;inset:0;background:rgba(27,37,32,0.45);backdrop-filter:blur(4px);z-index:200;display:flex;align-items:center;justify-content:center;padding:24px; }
    .modal-card { width:560px;max-width:95vw;padding:28px; }
    .form-group { display:flex;flex-direction:column;gap:5px; label{font-size:12px;font-weight:600;color:#3A5248;} }
    select.glass-input option { background:#FAF7F1;color:#1B2520; }
  `],
})
export class SecretaryPatientsComponent implements OnInit {
  private _all      = signal<any[]>([]);
  private _patients = signal<any[]>([]);
  readonly patients  = this._patients.asReadonly();

  showModal = signal(false);
  saving    = signal(false);
  form = { firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '', bloodType: '' };

  constructor(private api: ApiService, private notif: NotificationService) {}

  ngOnInit(): void {
    this.api.get<any>('/patients').subscribe(res => {
      this._all.set(res.data || []);
      this._patients.set(res.data || []);
    });
  }

  search(e: Event): void {
    const q = (e.target as HTMLInputElement).value.toLowerCase();
    this._patients.set(this._all().filter(p =>
      `${p.firstName} ${p.lastName} ${p.user?.email}`.toLowerCase().includes(q)
    ));
  }

  closeModal(): void {
    this.showModal.set(false);
    this.form = { firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '', bloodType: '' };
  }

  createPatient(): void {
    if (!this.form.firstName || !this.form.lastName || !this.form.email) {
      this.notif.showToast('Veuillez remplir les champs obligatoires (prénom, nom, e-mail)', 'warning');
      return;
    }
    this.saving.set(true);
    this.api.post<any>('/secretary/patients', this.form).subscribe({
      next: (res) => {
        const newP = res.data || { ...this.form, id: Date.now().toString() };
        this._all.update(l => [newP, ...l]);
        this._patients.update(l => [newP, ...l]);
        this.notif.showToast('Compte patient créé avec succès', 'success');
        this.closeModal();
        this.saving.set(false);
      },
      error: (err: any) => {
        const msg = err?.error?.errors?.[0]?.message || err?.error?.message || 'Échec de la création du compte';
        this.notif.showToast(msg, 'error');
        this.saving.set(false);
      },
    });
  }
}
