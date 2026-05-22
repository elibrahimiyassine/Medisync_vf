import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { LucideAngularModule } from 'lucide-angular';

interface MedRow { name: string; dosage: string; duration: string; }

@Component({
  selector: 'app-doctor-prescriptions',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, TopbarComponent, DatePipe, LucideAngularModule],
  template: `
    <app-sidebar />
    <app-topbar />
    <main class="page-wrapper">
      <div class="page-content">

        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
          <h2 style="font-family:'Fraunces',Georgia,serif;">Ordonnances émises</h2>
          <button class="btn-primary" style="display:inline-flex;align-items:center;gap:7px;" (click)="showModal.set(true)">
            <lucide-icon name="plus" [size]="14" /> Nouvelle ordonnance
          </button>
        </div>

        <div class="glass-card" style="padding:0;overflow:hidden;">
          <table class="ms-table">
            <thead>
              <tr>
                <th>Patient</th><th>Date</th><th>Médicament</th><th>Dosage</th><th>Durée</th><th>Instructions</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              @for (rx of prescriptions(); track rx.id) {
                <tr>
                  <td><strong style="color:#1B2520;">{{ rx.patient?.firstName }} {{ rx.patient?.lastName }}</strong></td>
                  <td>{{ rx.createdAt | date:'d MMM yyyy' }}</td>
                  <td style="color:#2A4A38;font-weight:600;">{{ rx.medication || '—' }}</td>
                  <td style="color:#3A5248;">{{ rx.dosage || '—' }}</td>
                  <td style="color:#3A5248;">{{ rx.duration || '—' }}</td>
                  <td style="color:#3A5248;max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{{ rx.instructions || '—' }}</td>
                  <td>
                    <button class="btn-secondary" style="font-size:11px;padding:6px 12px;display:inline-flex;align-items:center;gap:4px;" (click)="printRx(rx)">
                      <lucide-icon name="download" [size]="12" /> PDF
                    </button>
                  </td>
                </tr>
              }
              @empty {
                <tr><td colspan="7" style="text-align:center;color:#7A8A82;padding:40px;">Aucune ordonnance</td></tr>
              }
            </tbody>
          </table>
        </div>

      </div>
    </main>

    @if (showModal()) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal-box glass-card" (click)="$event.stopPropagation()">

          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
            <h3 style="font-family:'Fraunces',Georgia,serif;font-size:17px;">Nouvelle ordonnance</h3>
            <button class="btn-icon" (click)="closeModal()"><lucide-icon name="x" [size]="16" /></button>
          </div>

          <div class="modal-form">

            <!-- Patient -->
            <div class="form-group">
              <label>Patient *</label>
              <select class="glass-input" [(ngModel)]="patientId">
                <option value="">— Sélectionner un patient —</option>
                @for (p of patients(); track p.id) {
                  <option [value]="p.id">{{ p.firstName }} {{ p.lastName }}</option>
                }
              </select>
            </div>

            <!-- Medication rows -->
            <div>
              <div class="med-header">
                <span class="form-label">Médicaments *</span>
                <button type="button" class="btn-add-med" (click)="addMed()">
                  <lucide-icon name="plus" [size]="12" /> Ajouter
                </button>
              </div>

              @for (med of meds(); track $index) {
                <div class="med-row">
                  <input class="glass-input med-name"  [ngModel]="med.name"     (ngModelChange)="updateMed($index, 'name', $event)"     placeholder="Médicament (ex. Amoxicilline 500 mg)" />
                  <input class="glass-input med-small" [ngModel]="med.dosage"   (ngModelChange)="updateMed($index, 'dosage', $event)"   placeholder="Dosage (ex. 3×/j)" />
                  <input class="glass-input med-small" [ngModel]="med.duration" (ngModelChange)="updateMed($index, 'duration', $event)" placeholder="Durée (ex. 7j)" />
                  @if (meds().length > 1) {
                    <button type="button" class="med-del" (click)="removeMed($index)" title="Supprimer">
                      <lucide-icon name="x" [size]="12" />
                    </button>
                  }
                </div>
              }
            </div>

            <!-- Global instructions -->
            <div class="form-group">
              <label>Instructions particulières</label>
              <textarea class="glass-input" style="height:68px;resize:none;" [(ngModel)]="instructions"
                placeholder="Prendre avec un repas, éviter l'alcool..."></textarea>
            </div>

          </div>

          <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:20px;">
            <button class="btn-secondary" (click)="closeModal()">Annuler</button>
            <button class="btn-primary" (click)="createRx()" [disabled]="saving() || !patientId || !hasValidMed()">
              @if (saving()) { <span class="spinner"></span> Sauvegarde... }
              @else { ✓ Sauvegarder }
            </button>
          </div>

        </div>
      </div>
    }
  `,
  styles: [`
    .modal-overlay { position:fixed;inset:0;background:rgba(27,37,32,0.4);backdrop-filter:blur(4px);z-index:200;display:flex;align-items:center;justify-content:center;padding:24px; }
    .modal-box { width:100%;max-width:560px;padding:28px;border-radius:20px;max-height:90vh;overflow-y:auto; }
    .modal-form { display:flex;flex-direction:column;gap:14px; }
    .form-group { display:flex;flex-direction:column;gap:5px; }
    .form-label { font-size:12px;font-weight:600;color:#3A5248;text-transform:uppercase;letter-spacing:.04em; }
    label { font-size:12px;font-weight:600;color:#3A5248; }
    select.glass-input option { background:#FAF7F1;color:#1B2520; }

    .med-header { display:flex;justify-content:space-between;align-items:center;margin-bottom:8px; }
    .btn-add-med {
      display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:600;
      color:#2A4A38;background:rgba(42,74,56,0.08);border:1px solid rgba(42,74,56,0.2);
      border-radius:8px;padding:4px 10px;cursor:pointer;transition:background .15s;
      &:hover { background:rgba(42,74,56,0.14); }
    }

    .med-row {
      display:flex;align-items:center;gap:8px;margin-bottom:8px;
      &:last-child { margin-bottom:0; }
    }
    .med-name  { flex:2;min-width:0; }
    .med-small { flex:1;min-width:0; }
    .med-del {
      flex-shrink:0;width:28px;height:28px;border-radius:8px;
      background:rgba(194,64,64,0.07);border:1px solid rgba(194,64,64,0.2);
      color:#C24040;display:flex;align-items:center;justify-content:center;
      cursor:pointer;transition:background .15s;padding:0;
      &:hover { background:rgba(194,64,64,0.14); }
    }

    .spinner { width:13px;height:13px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;display:inline-block;margin-right:4px; }
    @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  `],
})
export class DoctorPrescriptionsComponent implements OnInit {
  private _prescriptions = signal<any[]>([]);
  private _patients      = signal<any[]>([]);
  readonly prescriptions = this._prescriptions.asReadonly();
  readonly patients      = this._patients.asReadonly();

  showModal = signal(false);
  saving    = signal(false);

  patientId    = '';
  instructions = '';
  meds = signal<MedRow[]>([{ name: '', dosage: '', duration: '' }]);

  constructor(
    private api: ApiService,
    private authService: AuthService,
    private notifSvc: NotificationService,
  ) {}

  ngOnInit(): void {
    this.api.get<any>('/prescriptions').subscribe(res => this._prescriptions.set(res.data || []));
    this.api.get<any>('/patients').subscribe(res => this._patients.set(res.data || []));
  }

  addMed(): void {
    this.meds.update(list => [...list, { name: '', dosage: '', duration: '' }]);
  }

  removeMed(i: number): void {
    this.meds.update(list => list.filter((_, idx) => idx !== i));
  }

  updateMed(i: number, field: keyof MedRow, value: string): void {
    this.meds.update(list => list.map((m, idx) => idx === i ? { ...m, [field]: value } : m));
  }

  hasValidMed(): boolean {
    return this.meds().some(m => m.name.trim().length > 0);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.patientId    = '';
    this.instructions = '';
    this.meds.set([{ name: '', dosage: '', duration: '' }]);
  }

  createRx(): void {
    if (!this.patientId || !this.hasValidMed()) return;
    const validMeds = this.meds().filter(m => m.name.trim());
    this.saving.set(true);

    const pat = this._patients().find(p => p.id === this.patientId);
    let done   = 0;
    let failed = false;

    validMeds.forEach(med => {
      this.api.post<any>('/prescriptions', {
        patientId:    this.patientId,
        medication:   med.name.trim(),
        dosage:       med.dosage.trim(),
        duration:     med.duration.trim(),
        instructions: this.instructions,
      }).subscribe({
        next: (res) => {
          const rx = res.data;
          this._prescriptions.update(list => [{
            ...rx,
            patient: pat ? { firstName: pat.firstName, lastName: pat.lastName }
                         : { firstName: '—', lastName: '' },
          }, ...list]);
          done++;
          if (done === validMeds.length && !failed) {
            this.saving.set(false);
            this.notifSvc.showToast(
              validMeds.length > 1
                ? `Ordonnance créée (${validMeds.length} médicaments)`
                : 'Ordonnance créée',
              'success',
            );
            this.closeModal();
          }
        },
        error: () => {
          if (!failed) {
            failed = true;
            this.saving.set(false);
            this.notifSvc.showToast("Échec de la création", 'error');
          }
        },
      });
    });
  }

  printRx(rx: any): void {
    const w = window.open('', '_blank')!;
    const doctor = this.authService.user()?.profile;
    w.document.write(`<html><head><title>Ordonnance</title>
      <style>body{font-family:sans-serif;padding:40px;color:#111}h1{color:#0066cc}p{margin:6px 0}hr{border:none;border-top:1px solid #ddd;margin:16px 0}</style>
      </head><body>
      <h1>MediSync — Ordonnance médicale</h1>
      <p><strong>Patient :</strong> ${rx.patient?.firstName || ''} ${rx.patient?.lastName || ''}</p>
      <p><strong>Médecin :</strong> Dr. ${rx.doctor?.firstName || doctor?.firstName || ''} ${rx.doctor?.lastName || doctor?.lastName || ''}</p>
      <p><strong>Date :</strong> ${new Date(rx.createdAt).toLocaleDateString('fr-MA')}</p>
      <hr/>
      <p><strong>Médicament :</strong> ${rx.medication || '—'}</p>
      <p><strong>Dosage :</strong> ${rx.dosage || '—'}</p>
      <p><strong>Durée :</strong> ${rx.duration || '—'}</p>
      ${rx.instructions ? `<p><strong>Instructions :</strong> ${rx.instructions}</p>` : ''}
    </body></html>`);
    w.document.close();
    w.print();
  }
}
