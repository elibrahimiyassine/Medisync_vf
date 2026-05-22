import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-secretary-appointments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent, TopbarComponent, DatePipe, LucideAngularModule],
  template: `
    <app-sidebar />
    <app-topbar />
    <main class="page-wrapper">
      <div class="page-content">

        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;flex-wrap:wrap;gap:12px;">
          <h2 style="font-family:'Fraunces',Georgia,serif;">Gestion des rendez-vous</h2>
          <div style="display:flex;gap:10px;align-items:center;">
            <input type="date" class="glass-input" style="width:180px;" (change)="filterDate($event)" />
            <button class="btn-primary" (click)="openNewAppt()">+ Nouveau RDV</button>
          </div>
        </div>

        <div class="glass-card" style="padding:0;overflow:hidden;">
          <table class="ms-table">
            <thead><tr>
              <th>Patient</th><th>Médecin</th><th>Date & Heure</th><th>Motif</th><th>Statut</th><th>Actions</th>
            </tr></thead>
            <tbody>
              @for (a of appointments(); track a.id) {
                <tr>
                  <td><strong style="color:#1B2520;">{{ a.patient?.firstName }} {{ a.patient?.lastName }}</strong></td>
                  <td style="color:#3A5248;">Dr. {{ a.doctor?.firstName }} {{ a.doctor?.lastName }}</td>
                  <td style="font-family:'JetBrains Mono',monospace;font-size:12px;color:#7A8A82;">{{ a.slot?.date | date:'MMM d' }} · {{ a.slot?.startTime }}</td>
                  <td style="color:#3A5248;max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{{ a.motif }}</td>
                  <td><span class="badge {{ a.status.toLowerCase() }}">{{ translateStatus(a.status) }}</span></td>
                  <td>
                    <div style="display:flex;gap:6px;">
                      @if (a.status === 'PENDING') {
                        <button class="btn-primary" style="font-size:11px;padding:5px 10px;" (click)="confirm(a.id)">Confirmer</button>
                        <button class="btn-danger" style="font-size:11px;padding:5px 10px;" (click)="cancel(a.id)">Annuler</button>
                      }
                      @if (a.status === 'CONFIRMED') {
                        <button class="btn-danger" style="font-size:11px;padding:5px 10px;" (click)="cancel(a.id)">Annuler</button>
                      }
                    </div>
                  </td>
                </tr>
              }
              @empty {
                <tr><td colspan="6" style="text-align:center;color:#7A8A82;padding:40px;">Aucun rendez-vous trouvé</td></tr>
              }
            </tbody>
          </table>
        </div>

      </div>
    </main>

    <!-- New appointment modal -->
    @if (showModal()) {
      <div class="overlay" (click)="closeModal()">
      <div class="glass-card new-appt-modal animate-scale-in" (click)="$event.stopPropagation()">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
          <h3 style="font-size:17px;font-weight:700;color:#1B2520;font-family:'Fraunces',Georgia,serif;">Nouveau rendez-vous</h3>
          <button class="modal-close" (click)="closeModal()"><lucide-icon name="x" [size]="16" /></button>
        </div>
        <form [formGroup]="newApptForm" (ngSubmit)="createAppt()">
          <div class="modal-grid">
            <div class="form-group">
              <label>Patient *</label>
              <select formControlName="patientId" class="glass-input">
                <option value="">— Sélectionner —</option>
                @for (p of patients(); track p.id) {
                  <option [value]="p.id">{{ p.firstName }} {{ p.lastName }}</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label>Médecin *</label>
              <select formControlName="doctorId" class="glass-input">
                <option value="">— Sélectionner —</option>
                @for (d of doctors(); track d.id) {
                  <option [value]="d.id">Dr. {{ d.firstName }} {{ d.lastName }} ({{ d.specialty }})</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label>Date *</label>
              <input type="date" formControlName="date" class="glass-input" [min]="today" />
            </div>
            <div class="form-group">
              <label>Heure *</label>
              <input type="time" formControlName="time" class="glass-input" />
            </div>
            <div class="form-group">
              <label>Durée</label>
              <select formControlName="duration" class="glass-input">
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="60">1 heure</option>
              </select>
            </div>
            <div class="form-group">
              <label>Type</label>
              <select formControlName="type" class="glass-input">
                <option value="GENERAL">Consultation générale</option>
                <option value="SUIVI">Suivi</option>
                <option value="BILAN">Bilan</option>
                <option value="URGENCE">Urgence</option>
              </select>
            </div>
            <div class="form-group" style="grid-column:1/-1;">
              <label>Motif</label>
              <input type="text" formControlName="motif" class="glass-input" placeholder="Motif de la consultation..." />
            </div>
          </div>
          <div style="display:flex;gap:10px;margin-top:20px;justify-content:flex-end;">
            <button type="button" class="btn-secondary" (click)="closeModal()">Annuler</button>
            <button type="submit" class="btn-primary" [disabled]="newApptForm.invalid || saving()">
              {{ saving() ? 'Création...' : '+ Créer le rendez-vous' }}
            </button>
          </div>
        </form>
      </div>
      </div>
    }
  `,
  styles: [`
    .overlay { position:fixed;inset:0;background:rgba(27,37,32,0.45);backdrop-filter:blur(4px);z-index:1000;display:flex;align-items:center;justify-content:center;padding:24px; }
    .new-appt-modal { width:min(560px,94vw);padding:28px; }
    .modal-close { background:none;border:none;font-size:22px;cursor:pointer;color:#7A8A82;line-height:1;padding:0 4px; &:hover{color:#C24040;} }
    .modal-grid { display:grid;grid-template-columns:1fr 1fr;gap:14px; }
    .form-group { display:flex;flex-direction:column;gap:5px; label{font-size:12px;font-weight:600;color:#3A5248;} }
    select.glass-input option { background:#FAF7F1;color:#1B2520; }
  `],
})
export class SecretaryAppointmentsComponent implements OnInit {
  private _appointments = signal<any[]>([]);
  private _patients     = signal<any[]>([]);
  private _doctors      = signal<any[]>([]);

  readonly appointments = this._appointments.asReadonly();
  readonly patients     = this._patients.asReadonly();
  readonly doctors      = this._doctors.asReadonly();

  showModal = signal(false);
  saving    = signal(false);
  today     = new Date().toISOString().slice(0, 10);

  newApptForm!: ReturnType<FormBuilder['group']>;

  constructor(
    private api: ApiService,
    private notifSvc: NotificationService,
    private fb: FormBuilder,
  ) {
    this.newApptForm = this.fb.group({
      patientId: ['', Validators.required],
      doctorId:  ['', Validators.required],
      date:      ['', Validators.required],
      time:      ['', Validators.required],
      duration:  [30],
      type:      ['GENERAL'],
      motif:     [''],
    });
  }

  ngOnInit(): void {
    this.load();
    this.api.get<any>('/patients').subscribe(r => this._patients.set(r.data || []));
    this.api.get<any>('/doctors').subscribe(r => this._doctors.set(r.data || []));
  }

  load(): void {
    this.api.get<any>('/appointments').subscribe(r => this._appointments.set(r.data || []));
  }

  filterDate(e: Event): void {
    const date = (e.target as HTMLInputElement).value;
    this.api.get<any>('/appointments', { date }).subscribe(r => this._appointments.set(r.data || []));
  }

  openNewAppt(): void {
    this.newApptForm.reset({ duration: 30, type: 'GENERAL' });
    this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); }

  createAppt(): void {
    if (this.newApptForm.invalid) return;
    this.saving.set(true);
    const v = this.newApptForm.value;
    this.api.post<any>('/appointments', {
      patientId: v.patientId,
      doctorId:  v.doctorId,
      type:      v.type,
      motif:     v.motif || '',
      slot:      { date: v.date, startTime: v.time, duration: Number(v.duration) },
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.load();
        this.notifSvc.showToast('Rendez-vous créé', 'success');
      },
      error: () => { this.saving.set(false); this.notifSvc.showToast('Échec de la création', 'error'); },
    });
  }

  confirm(id: string): void {
    this.api.put<any>(`/appointments/${id}`, { status: 'CONFIRMED' }).subscribe({
      next: () => { this.load(); this.notifSvc.showToast('Rendez-vous confirmé', 'success'); },
    });
  }

  cancel(id: string): void {
    this.api.put<any>(`/appointments/${id}`, { status: 'CANCELLED' }).subscribe({
      next: () => { this.load(); this.notifSvc.showToast('Rendez-vous annulé', 'info'); },
    });
  }

  translateStatus(s: string): string {
    const m: Record<string, string> = { PENDING: 'En attente', CONFIRMED: 'Confirmé', COMPLETED: 'Terminé', CANCELLED: 'Annulé' };
    return m[s] || s;
  }
}
