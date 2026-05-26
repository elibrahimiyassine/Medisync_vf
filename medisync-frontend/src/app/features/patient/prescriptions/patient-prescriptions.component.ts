import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-patient-prescriptions',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, TopbarComponent, DatePipe, LucideAngularModule],
  template: `
    <app-sidebar />
    <app-topbar />
    <main class="page-wrapper">
      <div class="page-content">
        <h2 style="font-family:'Fraunces',Georgia,serif;margin-bottom:24px;">Mes ordonnances</h2>

        @if (loading()) {
          <div class="grid-2">
            @for (i of [1,2,3,4]; track i) {
              <div class="skeleton" style="height:180px;border-radius:16px;"></div>
            }
          </div>
        } @else if (prescriptions().length === 0) {
          <div class="glass-card" style="padding:60px;text-align:center;color:#7A8A82;">
            <lucide-icon name="pill" [size]="40" style="color:#7A8A82;" />
            <p style="margin-top:12px;font-size:15px;">Aucune ordonnance pour le moment</p>
          </div>
        } @else {
          <div class="grid-2 stagger">
            @for (rx of prescriptions(); track rx.id) {
              <div class="rx-card glass-card">
                <div class="rx-header">
                  <div>
                    <p class="rx-doctor">Dr. {{ rx.doctor.firstName }} {{ rx.doctor.lastName }}</p>
                    <p class="rx-spec">{{ rx.doctor.specialty }}</p>
                  </div>
                  <div style="text-align:right;">
<<<<<<< HEAD
                    <p class="rx-date">{{ rx.issuedAt | date:'d MMM yyyy' }}</p>
                    @if (rx.expiresAt) {
                      <p class="rx-expiry" [class.expired]="isExpired(rx.expiresAt)">
                        {{ isExpired(rx.expiresAt) ? 'Expiré' : 'Exp : ' + (rx.expiresAt | date:'d MMM') }}
=======
                    <p class="rx-date">{{ rx.issuedAt | date:'MMM d, yyyy' }}</p>
                    @if (rx.expiresAt) {
                      <p class="rx-expiry" [class.expired]="isExpired(rx.expiresAt)">
                        {{ isExpired(rx.expiresAt) ? 'Expired' : 'Exp: ' + (rx.expiresAt | date:'MMM d') }}
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
                      </p>
                    }
                  </div>
                </div>
                <div class="rx-body">
                  @for (med of rx.medications; track med.name) {
                    <div class="med-item">
                      <lucide-icon name="pill" [size]="16" style="flex-shrink:0;color:#2A4A38;" />
                      <div>
                        <p class="med-name">{{ med.name }} — {{ med.dosage }}</p>
                        <p class="med-details">{{ med.frequency }} · {{ med.duration }}</p>
                      </div>
                    </div>
                  }
                  @if (rx.instructions) {
                    <p class="rx-instructions" style="display:flex;align-items:flex-start;gap:6px;"><lucide-icon name="clipboard-list" [size]="13" style="flex-shrink:0;margin-top:1px;" /> {{ rx.instructions }}</p>
                  }
                </div>
                <div class="rx-footer">
                  <button class="btn-secondary" style="font-size:12px;padding:8px 16px;display:inline-flex;align-items:center;gap:5px;" (click)="printRx(rx)">
                    <lucide-icon name="download" [size]="13" /> Télécharger PDF
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </main>
  `,
  styles: [`
    .rx-card { padding:20px; }
    .rx-header { display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid rgba(42,74,56,0.06); }
    .rx-doctor { font-size:15px;font-weight:700;color:#1B2520;font-family:'Fraunces',Georgia,serif; }
    .rx-spec { font-size:12px;color:#7A8A82;margin-top:2px; }
    .rx-date { font-size:12px;color:#3A5248; }
    .rx-expiry { font-size:11px;color:#3D6B4F;margin-top:2px; &.expired{color:#C24040;} }
    .rx-body { display:flex;flex-direction:column;gap:10px; }
    .med-item { display:flex;align-items:flex-start;gap:10px;padding:10px;background:rgba(42,74,56,0.04);border-radius:10px;border:1px solid rgba(42,74,56,0.06); }
    .med-icon { flex-shrink:0;color:#2A4A38;display:flex; }
    .med-name { font-size:13px;font-weight:600;color:#1B2520; }
    .med-details { font-size:12px;color:#7A8A82;margin-top:2px; }
    .rx-instructions { font-size:12px;color:#3A5248;padding:8px 12px;background:rgba(123,97,255,0.06);border-radius:8px;border-left:3px solid #C9633C; }
    .rx-footer { margin-top:14px;padding-top:14px;border-top:1px solid rgba(42,74,56,0.06);display:flex;justify-content:flex-end; }
  `],
})
export class PatientPrescriptionsComponent implements OnInit {
  private _loading       = signal(true);
  private _prescriptions = signal<any[]>([]);
  readonly loading        = this._loading.asReadonly();
  readonly prescriptions  = this._prescriptions.asReadonly();

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<any>('/prescriptions').subscribe({
      next: (res) => { this._prescriptions.set(res.data || []); this._loading.set(false); },
      error: () => this._loading.set(false),
    });
  }

  isExpired(date: string): boolean { return new Date(date) < new Date(); }

  printRx(rx: any): void {
    const meds = (rx.medications || []).map((m: any) =>
      `<tr><td>${m.name}</td><td>${m.dosage || '—'}</td><td>${m.frequency || '—'}</td><td>${m.duration || '—'}</td></tr>`
    ).join('');
    const w = window.open('', '_blank')!;
    w.document.write(`<html><head><title>Ordonnance</title><style>body{font-family:sans-serif;padding:40px;color:#111}h1{color:#0066cc}table{width:100%;border-collapse:collapse;margin-top:16px}td,th{padding:8px 12px;border:1px solid #ddd;text-align:left}th{background:#f5f5f5}</style></head><body>
      <h1>MediSync — Ordonnance médicale</h1>
      <p><strong>Médecin :</strong> Dr. ${rx.doctor?.firstName || ''} ${rx.doctor?.lastName || ''}</p>
      <p><strong>Spécialité :</strong> ${rx.doctor?.specialty || '—'}</p>
      <p><strong>Date :</strong> ${new Date(rx.issuedAt).toLocaleDateString('fr-FR')}</p>
      <table><thead><tr><th>Médicament</th><th>Dosage</th><th>Fréquence</th><th>Durée</th></tr></thead><tbody>${meds}</tbody></table>
      ${rx.instructions ? `<p style="margin-top:16px;"><strong>Instructions :</strong> ${rx.instructions}</p>` : ''}
    </body></html>`);
    w.document.close();
    w.print();
  }
}
