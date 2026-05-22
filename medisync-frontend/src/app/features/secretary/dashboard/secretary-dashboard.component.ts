import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-secretary-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, TopbarComponent, DatePipe, LucideAngularModule],
  template: `
    <app-sidebar />
    <app-topbar />
    <main class="page-wrapper">
      <div class="page-content">
        <div class="welcome-banner glass-card animate-slide-down" style="margin-bottom:24px;">
          <h2 style="font-family:'Fraunces',Georgia,serif;">Tableau de bord secrétaire</h2>
          <p style="color:#7A8A82;font-size:13px;margin-top:4px;">{{ today | date:'EEEE, MMMM d, yyyy' }}</p>
          <div class="ecg-bar" style="margin-top:16px;border-radius:0 0 16px 16px;"></div>
        </div>

        <div class="grid-4 stagger">
          <div class="stat-card"><p class="stat-label">RDV aujourd'hui</p><p class="stat-value" style="color:#2A4A38;">{{ stats().today }}</p></div>
          <div class="stat-card"><p class="stat-label">En attente</p><p class="stat-value" style="color:#B8792A;">{{ stats().pending }}</p></div>
          <div class="stat-card"><p class="stat-label">Total patients</p><p class="stat-value" style="color:#C9633C;">{{ stats().patients }}</p></div>
          <div class="stat-card"><p class="stat-label">Factures</p><p class="stat-value" style="color:#C24040;">{{ stats().invoices }}</p></div>
        </div>

        <div class="grid-2" style="margin-top:24px;gap:20px;">
          <div class="glass-card" style="padding:24px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:14px;"><h3 style="font-size:15px;font-weight:600;">Planning du jour</h3><a routerLink="/secretary/appointments" style="font-size:12px;color:#2A4A38;">Gérer →</a></div>
            @for (a of todayAppts().slice(0,5); track a.id) {
              <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid rgba(42,74,56,0.06);">
                <span style="font-size:13px;font-weight:700;color:#2A4A38;font-family:'JetBrains Mono',monospace;min-width:50px;">{{ a.slot?.startTime }}</span>
                <div style="flex:1;">
                  <p style="font-size:13px;font-weight:600;color:#1B2520;">{{ a.patient?.firstName }} {{ a.patient?.lastName }}</p>
                  <p style="font-size:11px;color:#7A8A82;">Dr. {{ a.doctor?.lastName }} · {{ a.motif }}</p>
                </div>
                <span class="badge {{ a.status.toLowerCase() }}" style="font-size:10px;">{{ translateStatus(a.status) }}</span>
              </div>
            }
            @if (todayAppts().length === 0) {
              <p style="text-align:center;color:#7A8A82;font-size:13px;padding:20px;">Aucun rendez-vous aujourd'hui</p>
            }
          </div>
          <div class="glass-card" style="padding:24px;">
            <div style="margin-bottom:14px;"><h3 style="font-size:15px;font-weight:600;">Actions rapides</h3></div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
              @for (a of actions; track a.label) {
                <a [routerLink]="a.path" style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:16px;background:rgba(42,74,56,0.05);border:1px solid rgba(42,74,56,0.1);border-radius:12px;text-decoration:none;color:#3A5248;transition:all .2s;font-size:12px;font-weight:600;" [style.hover]="''">
                  <lucide-icon [name]="a.icon" [size]="24" />{{ a.label }}
                </a>
              }
            </div>
          </div>
        </div>
      </div>
    </main>
  `,
  styles: [`
    .welcome-banner { padding:24px;position:relative;overflow:hidden; }
    .stat-label { font-size:11px;font-weight:700;color:#7A8A82;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px; }
    .stat-value { font-size:30px;font-weight:700;font-family:'Fraunces',Georgia,serif; }
  `],
})
export class SecretaryDashboardComponent implements OnInit {
  private _stats     = signal({ today: 0, pending: 0, patients: 0, invoices: 0 });
  private _todayAppts = signal<any[]>([]);
  readonly stats      = this._stats.asReadonly();
  readonly todayAppts = this._todayAppts.asReadonly();
  today = new Date();

  actions = [
    { icon: 'calendar', label: 'Nouveau RDV',      path: '/secretary/appointments' },
    { icon: 'user',     label: 'Ajouter patient',  path: '/secretary/patients' },
    { icon: 'receipt',  label: 'Créer facture',    path: '/secretary/billing' },
    { icon: 'users',    label: 'Liste patients',   path: '/secretary/patients' },
  ];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<any>('/appointments').subscribe(res => {
      const all = res.data || [];
      const today = new Date(); today.setHours(0,0,0,0);
      const todayAppts = all.filter((a: any) => a.slot?.date?.slice(0,10) === today.toISOString().slice(0,10));
      this._todayAppts.set(todayAppts);
      this._stats.set({
        today: todayAppts.length,
        pending: all.filter((a: any) => a.status === 'PENDING').length,
        patients: new Set(all.map((a: any) => a.patientId)).size,
        invoices: 0,
      });
    });
  }

  translateStatus(s: string): string {
    const map: Record<string, string> = {
      PENDING: 'En attente', CONFIRMED: 'Confirmé',
      COMPLETED: 'Terminé',  CANCELLED: 'Annulé',
    };
    return map[s] ?? s;
  }
}
