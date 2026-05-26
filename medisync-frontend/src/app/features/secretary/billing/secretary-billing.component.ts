import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
<<<<<<< HEAD
import { forkJoin } from 'rxjs';
=======
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { environment } from '../../../../environments/environment';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-secretary-billing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent, TopbarComponent, DatePipe, LucideAngularModule],
  template: `
    <app-sidebar />
    <app-topbar />
    <main class="page-wrapper">
      <div class="page-content">

        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
          <h2 style="font-family:'Fraunces',Georgia,serif;">Facturation & Factures</h2>
          <button class="btn-primary" (click)="openActModal()">+ Créer une facture</button>
        </div>

        <div class="glass-card" style="padding:0;overflow:hidden;">
          <table class="ms-table">
            <thead><tr><th>Patient</th><th>Mutuelle</th><th>Médecin</th><th>Date</th><th>Montant</th><th>Statut</th><th>Actions</th></tr></thead>
            <tbody>
              @for (inv of invoices(); track inv.id) {
                <tr>
                  <td><strong style="color:#1B2520;">{{ inv.patient?.firstName }} {{ inv.patient?.lastName }}</strong></td>
                  <td style="color:#3A5248;font-size:12px;">{{ inv.mutuelle || '—' }}</td>
                  <td style="color:#3A5248;">Dr. {{ inv.appointment?.doctor?.lastName }}</td>
                  <td style="color:#7A8A82;">{{ inv.issuedAt | date:'d MMM yyyy' }}</td>
                  <td style="font-family:'JetBrains Mono',monospace;color:#2A4A38;font-weight:700;">{{ inv.amount | number:'1.2-2' }} DH</td>
                  <td><span class="badge {{ inv.status.toLowerCase() }}">{{ translateStatus(inv.status) }}</span></td>
                  <td>
                    <div style="display:flex;gap:6px;">
                      @if (inv.status === 'PENDING') {
                        <button class="btn-primary" style="font-size:11px;padding:5px 10px;" (click)="markPaid(inv.id)">Marquer payé</button>
                      }
                      <button class="btn-secondary" style="font-size:11px;padding:5px 10px;display:inline-flex;align-items:center;gap:4px;" (click)="printInvoice(inv)"><lucide-icon name="download" [size]="12" /> PDF</button>
<<<<<<< HEAD
                      <button class="btn-secondary" style="font-size:11px;padding:5px 10px;display:inline-flex;align-items:center;gap:4px;" (click)="downloadFeuilleSoins(inv.id)"><lucide-icon name="file-text" [size]="12" /> Feuille</button>
=======
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
                      <button class="btn-secondary" style="font-size:11px;padding:5px 10px;display:inline-flex;align-items:center;gap:4px;" (click)="sendEmail(inv.id)" [disabled]="sendingEmailId() === inv.id">
                        @if (sendingEmailId() !== inv.id) { <lucide-icon name="mail" [size]="12" /> } {{ sendingEmailId() === inv.id ? '...' : 'E-mail' }}
                      </button>
                    </div>
                  </td>
                </tr>
              }
              @if (invoices().length === 0) {
                <tr><td colspan="7" style="text-align:center;color:#7A8A82;padding:32px;">Aucune facture pour l'instant</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- Act entry modal -->
    @if (actModalOpen()) {
      <div class="overlay" (click)="closeActModal()">
      <div class="act-modal glass-card animate-scale-in" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Nouvelle facture</h3>
          <button class="btn-icon" (click)="closeActModal()"><lucide-icon name="x" [size]="16" /></button>
        </div>

        <form [formGroup]="actForm" (ngSubmit)="submitInvoice()">

          <!-- Appointment selector -->
          <div class="form-group" style="margin-bottom:16px;">
            <label>Rendez-vous lié *</label>
            <select formControlName="appointmentId" class="glass-input">
              <option value="">— Sélectionner un rendez-vous —</option>
              @for (appt of appointments(); track appt.id) {
                <option [value]="appt.id">
                  {{ appt.patient?.firstName }} {{ appt.patient?.lastName }} —
                  Dr. {{ appt.doctor?.lastName }} —
                  {{ appt.slot?.date | date:'d MMM yyyy' }} {{ appt.slot?.startTime }}
                </option>
              }
            </select>
            @if (actForm.get('appointmentId')?.invalid && actForm.get('appointmentId')?.touched) {
              <span class="error-msg">Veuillez sélectionner un rendez-vous</span>
            }
          </div>

          <!-- Mutuelle -->
          <div class="form-group" style="margin-bottom:16px;">
            <label>Mutuelle / Assurance</label>
            <select formControlName="mutuelle" class="glass-input">
              <option value="">— Pas d'assurance —</option>
              <option value="CNSS">CNSS</option>
              <option value="CNOPS">CNOPS</option>
              <option value="FAR">FAR (Forces Armées Royales)</option>
              <option value="AMO">AMO</option>
              <option value="RAMED">RAMED</option>
              <option value="AXA">AXA Assurance Maroc</option>
              <option value="Wafa">Wafa Assurance</option>
              <option value="RMA">RMA Assurance</option>
              <option value="Saham">Saham Assurance</option>
            </select>
          </div>

          <!-- Acts list -->
          <div style="margin-bottom:12px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
              <p style="font-size:12px;font-weight:700;color:#2A4A38;text-transform:uppercase;letter-spacing:.06em;">Actes réalisés</p>
              <button type="button" class="btn-secondary" style="font-size:11px;padding:5px 12px;" (click)="addAct()">+ Ajouter un acte</button>
            </div>

            <div class="acts-header">
              <span style="flex:3;">Description</span>
              <span style="flex:1;text-align:center;">Qté</span>
              <span style="flex:1.5;text-align:right;">Prix unitaire</span>
              <span style="flex:1;text-align:right;">Sous-total</span>
              <span style="width:28px;"></span>
            </div>

            <div formArrayName="acts">
              @for (act of actsArray.controls; track $index; let i = $index) {
                <div [formGroupName]="i" class="act-row">
                  <input formControlName="description" class="glass-input act-input" placeholder="ex. Consultation, Radiographie..." style="flex:3;" />
                  <input formControlName="quantity" type="number" min="1" class="glass-input act-input" style="flex:1;text-align:center;" />
                  <input formControlName="unitPrice" type="number" min="0" step="0.01" class="glass-input act-input" placeholder="0.00" style="flex:1.5;text-align:right;" />
                  <span class="act-subtotal" style="flex:1;text-align:right;">{{ getSubtotal(i) | number:'1.2-2' }} DH</span>
                  <button type="button" class="act-del" (click)="removeAct(i)" [disabled]="actsArray.length === 1"><lucide-icon name="x" [size]="13" /></button>
                </div>
              }
            </div>

            <!-- Total row -->
            <div class="total-row">
              <span>Total</span>
              <span class="total-amount">{{ computeTotal() | number:'1.2-2' }} DH</span>
            </div>
          </div>

          @if (actForm.invalid && actForm.touched) {
            <div class="error-banner" style="margin-bottom:12px;">
              <span>⚠</span> Veuillez remplir tous les champs obligatoires
            </div>
          }

          <div style="display:flex;gap:10px;margin-top:4px;">
            <button type="button" class="btn-secondary" style="flex:1;" (click)="closeActModal()">Annuler</button>
            <button type="submit" class="btn-primary" style="flex:2;" [disabled]="submitting() || actForm.invalid || computeTotal() === 0">
              @if (submitting()) { <span class="spinner"></span> Création... }
              @else { ✓ Créer la facture }
            </button>
          </div>
        </form>
      </div>
      </div>
    }
  `,
  styles: [`
    .overlay { position:fixed;inset:0;background:rgba(27,37,32,0.45);backdrop-filter:blur(4px);z-index:200;display:flex;align-items:center;justify-content:center;padding:24px; }
    .act-modal { width:90%;max-width:640px;max-height:90vh;overflow-y:auto;padding:28px; }
    .modal-header { display:flex;justify-content:space-between;align-items:center;margin-bottom:20px; h3{font-size:18px;font-weight:700;font-family:'Fraunces',Georgia,serif;} }

    .acts-header { display:flex;align-items:center;gap:8px;padding:6px 10px;background:rgba(42,74,56,0.04);border-radius:8px;font-size:10px;font-weight:700;color:#7A8A82;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px; }
    .act-row { display:flex;align-items:center;gap:8px;margin-bottom:6px; }
    .act-input { padding:8px 10px;font-size:13px;min-width:0; }
    .act-subtotal { font-size:13px;font-weight:600;color:#2A4A38;font-family:'JetBrains Mono',monospace;white-space:nowrap;padding:0 4px; }
    .act-del { background:none;border:1px solid rgba(194,64,64,0.3);border-radius:6px;color:#C24040;font-size:15px;width:28px;height:28px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s; &:hover:not(:disabled){background:rgba(194,64,64,0.08);} &:disabled{opacity:.3;cursor:not-allowed;} }

    .total-row { display:flex;justify-content:space-between;align-items:center;padding:12px 10px;background:rgba(42,74,56,0.06);border-radius:10px;margin-top:8px;border:1px solid rgba(42,74,56,0.12); }
    .total-amount { font-size:18px;font-weight:700;color:#2A4A38;font-family:'JetBrains Mono',monospace; }

    .error-banner { display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(194,64,64,0.08);border:1px solid rgba(194,64,64,0.25);border-radius:10px;font-size:13px;color:#C24040; }
    .spinner { width:14px;height:14px;border:2px solid rgba(0,0,0,0.3);border-top-color:#000;border-radius:50%;animation:spin .7s linear infinite;display:inline-block; }
    @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}

    select.glass-input option { background:#FAF7F1;color:#1B2520; }
    .form-group { display:flex;flex-direction:column;gap:5px; label{font-size:12px;font-weight:600;color:#3A5248;text-transform:uppercase;letter-spacing:.04em;} }
  `],
})
export class SecretaryBillingComponent implements OnInit {
  private _invoices     = signal<any[]>([]);
  private _appointments = signal<any[]>([]);
  private _actModalOpen = signal(false);
  private _submitting   = signal(false);

  readonly invoices     = this._invoices.asReadonly();
  readonly appointments = this._appointments.asReadonly();
  readonly actModalOpen = this._actModalOpen.asReadonly();
  readonly submitting      = this._submitting.asReadonly();
  readonly apiBase         = environment.apiUrl;
  sendingEmailId           = signal<string | null>(null);

  actForm!: ReturnType<FormBuilder['group']>;

  get actsArray(): FormArray {
    return this.actForm.get('acts') as FormArray;
  }

  constructor(
    private api: ApiService,
    private notifSvc: NotificationService,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.api.get<any>('/invoices').subscribe(res => this._invoices.set(res.data || []));
  }

  private buildActForm(): void {
    this.actForm = this.fb.group({
      appointmentId: ['', Validators.required],
      mutuelle:      [''],
      acts: this.fb.array([this.newActGroup()]),
    });
  }

  private newActGroup() {
    return this.fb.group({
      description: ['', Validators.required],
      quantity:    [1,  [Validators.required, Validators.min(1)]],
      unitPrice:   [0,  [Validators.required, Validators.min(0.01)]],
    });
  }

  openActModal(): void {
    this.buildActForm();
    this._actModalOpen.set(true);
<<<<<<< HEAD

    forkJoin({
      appts: this.api.get<any>('/appointments'),
      invs:  this.api.get<any>('/invoices'),
    }).subscribe(({ appts, invs }) => {
      const all: any[] = appts?.data || [];
      const invoicedIds = new Set((invs?.data || []).map((inv: any) => inv.appointmentId));
      this._appointments.set(all.filter(a =>
        (a.status === 'CONFIRMED' || a.status === 'COMPLETED' || a.status === 'PENDING')
        && !invoicedIds.has(a.id)
      ));
=======
    this.api.get<any>('/appointments').subscribe(res => {
      const all: any[] = res.data || [];
      this._appointments.set(all.filter(a => a.status === 'CONFIRMED' || a.status === 'COMPLETED'));
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
    });
  }

  closeActModal(): void { this._actModalOpen.set(false); }

  addAct(): void { this.actsArray.push(this.newActGroup()); }

  removeAct(i: number): void {
    if (this.actsArray.length > 1) this.actsArray.removeAt(i);
  }

  getSubtotal(i: number): number {
    const ctrl = this.actsArray.at(i);
    return (ctrl.value.quantity || 0) * (ctrl.value.unitPrice || 0);
  }

  computeTotal(): number {
    return this.actsArray.controls.reduce((sum, _, i) => sum + this.getSubtotal(i), 0);
  }

  submitInvoice(): void {
    if (this.actForm.invalid || this.computeTotal() === 0) {
      this.actForm.markAllAsTouched();
      return;
    }
    this._submitting.set(true);
    const payload = {
      appointmentId: this.actForm.value.appointmentId,
      mutuelle:      this.actForm.value.mutuelle || '',
      acts:          this.actForm.value.acts,
      amount:        this.computeTotal(),
    };

    this.api.post<any>('/invoices', payload).subscribe({
      next: (res) => {
        this._submitting.set(false);
        this._invoices.update(list => [res.data, ...list]);
        this.closeActModal();
        this.notifSvc.showToast('Facture créée avec succès', 'success');
      },
      error: (err) => {
        this._submitting.set(false);
        this.notifSvc.showToast(err.error?.message || 'Échec de la création', 'error');
      },
    });
  }

  markPaid(id: string): void {
    this.api.put<any>(`/invoices/${id}`, { status: 'PAID' }).subscribe({
      next: () => {
        this._invoices.update(list => list.map(i => i.id === id ? { ...i, status: 'PAID' } : i));
        this.notifSvc.showToast('Facture marquée comme payée', 'success');
      },
    });
  }

  translateStatus(s: string): string {
    const map: Record<string, string> = { PAID: 'Payée', PENDING: 'En attente', CANCELLED: 'Annulée' };
    return map[s] || s;
  }

<<<<<<< HEAD
  downloadFeuilleSoins(id: string): void {
    const token = localStorage.getItem('accessToken');
    const url = `${this.apiBase}/invoices/${id}/feuille-soins`;
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    if (token) a.href = `${url}?token=${encodeURIComponent(token)}`;
    // Use fetch to handle auth header properly
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `feuille-soins-${id.slice(0, 8)}.pdf`;
        link.click();
        URL.revokeObjectURL(link.href);
      })
      .catch(() => this.notifSvc.showToast('Échec du téléchargement', 'error'));
  }

  sendEmail(id: string): void {
    this.sendingEmailId.set(id);
    this.api.post<any>(`/invoices/${id}/send-email`, {}).subscribe({
      next: () => { this.sendingEmailId.set(null); this.notifSvc.showToast('Facture envoyée par e-mail', 'success'); },
      error: () => { this.sendingEmailId.set(null); this.notifSvc.showToast('Échec de l\'envoi', 'error'); },
=======
  sendEmail(id: string): void {
    this.sendingEmailId.set(id);
    this.api.post<any>(`/invoices/${id}/send-email`, {}).subscribe({
      next: () => this.notifSvc.showToast('Facture envoyée par e-mail', 'success'),
      error: () => this.notifSvc.showToast('Échec de l\'envoi', 'error'),
      complete: () => this.sendingEmailId.set(null),
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
    });
  }

  printInvoice(inv: any): void {
    const acts: string = (inv.acts || []).map((a: any) =>
      `<tr><td>${a.description}</td><td>${a.quantity}</td><td>${a.unitPrice?.toFixed(2)} DH</td><td>${(a.quantity * a.unitPrice)?.toFixed(2)} DH</td></tr>`
    ).join('');
    const w = window.open('', '_blank')!;
    w.document.write(`<html><head><title>Facture</title><style>body{font-family:sans-serif;padding:40px;color:#111}h1{color:#0066cc}table{width:100%;border-collapse:collapse}td,th{padding:8px 12px;border:1px solid #ddd}.total{font-weight:700;font-size:16px;text-align:right;margin-top:12px}</style></head><body>
      <h1>MediSync — Facture</h1>
      <p><strong>Patient :</strong> ${inv.patient?.firstName} ${inv.patient?.lastName}</p>
      <p><strong>Médecin :</strong> Dr. ${inv.appointment?.doctor?.lastName || '—'}</p>
      <p><strong>Date :</strong> ${new Date(inv.issuedAt).toLocaleDateString('fr-MA')}</p>
      ${inv.mutuelle ? `<p><strong>Mutuelle :</strong> ${inv.mutuelle}</p>` : ''}
      ${acts ? `<table><thead><tr><th>Acte</th><th>Qté</th><th>P.U.</th><th>Total</th></tr></thead><tbody>${acts}</tbody></table>` : ''}
      <p class="total">Montant total : ${inv.amount?.toFixed(2)} DH</p>
      <p><strong>Statut :</strong> ${this.translateStatus(inv.status)}</p>
    </body></html>`);
    w.document.close();
    w.print();
  }
}
