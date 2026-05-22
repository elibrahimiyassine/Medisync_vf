import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, TopbarComponent, DatePipe, LucideAngularModule],
  template: `
    <app-sidebar />
    <app-topbar />

    <main class="page-wrapper">
      <div class="page-content">

        <!-- ECG Header -->
        <div class="ecg-header glass-card animate-slide-down">
          <div class="ecg-content">
            <div>
              <p class="ecg-greeting">Dr. {{ doctorName() }} — {{ today | date:'EEEE, MMMM d, yyyy' }}</p>
              <h2 class="text-gradient" style="font-family:'Fraunces',Georgia,serif;font-size:22px;">Vue d'ensemble du jour</h2>
            </div>
            <div class="ecg-stats">
              <div class="ecg-stat"><span class="ecg-num">{{ stats().todayTotal }}</span><span class="ecg-lbl">Aujourd'hui</span></div>
              <div class="ecg-stat"><span class="ecg-num" style="color:#3D6B4F;">{{ stats().completedToday }}</span><span class="ecg-lbl">Terminés</span></div>
              <div class="ecg-stat"><span class="ecg-num" style="color:#B8792A;">{{ stats().pending }}</span><span class="ecg-lbl">En attente</span></div>
              <div class="ecg-stat"><span class="ecg-num" style="color:#C9633C;">{{ stats().totalPatients }}</span><span class="ecg-lbl">Patients</span></div>
            </div>
          </div>
          <!-- Animated ECG line -->
          <div class="ecg-line-container">
            <svg viewBox="0 0 800 60" preserveAspectRatio="none" class="ecg-svg">
              <path class="ecg-path" d="M0,30 L80,30 L100,30 L110,5 L120,55 L130,5 L140,30 L200,30 L210,30 L220,5 L230,55 L240,5 L250,30 L400,30 L410,5 L420,55 L430,5 L440,30 L600,30 L610,5 L620,55 L630,5 L640,30 L800,30"
                fill="none" stroke="#2A4A38" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
          </div>
        </div>

        <!-- Today's appointments -->
        <div class="section-title" style="margin-top:24px;"><h3>Planning du jour</h3>
          <a routerLink="/doctor/planning" style="font-size:12px;color:#2A4A38;">Calendrier complet →</a>
        </div>

        @if (loading()) {
          <div class="grid-2">
            @for (i of [1,2,3,4]; track i) {
              <div class="skeleton" style="height:100px;border-radius:14px;"></div>
            }
          </div>
        } @else if (todayAppointments().length === 0) {
          <div class="glass-card" style="padding:40px;text-align:center;color:#7A8A82;">
            <lucide-icon name="coffee" [size]="36" style="color:#7A8A82;" />
            <p style="margin-top:10px;">Aucun rendez-vous prévu aujourd'hui</p>
          </div>
        } @else {
          <div class="today-list stagger">
            @for (appt of todayAppointments(); track appt.id) {
              <div class="today-card glass-card">
                <div class="time-col">
                  <p class="appt-time-big">{{ appt.slot.startTime }}</p>
                  <p class="appt-time-duration">{{ appt.slot.duration }}min</p>
                </div>
                <div class="patient-col">
                  <div class="patient-avatar">{{ appt.patient.firstName[0] }}{{ appt.patient.lastName[0] }}</div>
                  <div>
                    <p class="patient-name">{{ appt.patient.firstName }} {{ appt.patient.lastName }}</p>
                    <p class="patient-motif">{{ appt.motif }}</p>
                    @if (appt.patient.allergies?.length) {
                      <p class="allergy-warn" style="display:flex;align-items:center;gap:4px;"><lucide-icon name="triangle-alert" [size]="11" /> {{ appt.patient.allergies.join(', ') }}</p>
                    }
                  </div>
                </div>
                <div class="actions-col">
                  <span class="badge {{ appt.status.toLowerCase() }}">{{ translateStatus(appt.status) }}</span>
                  @if (appt.status !== 'COMPLETED') {
                    <a [routerLink]="['/doctor/consultation', appt.id]" class="btn-primary" style="font-size:12px;padding:7px 14px;white-space:nowrap;">Démarrer →</a>
                  }
                </div>
              </div>
            }
          </div>
        }

        <!-- Recent patients -->
        <div class="grid-2" style="margin-top:24px;gap:20px;">
          <div class="glass-card" style="padding:24px;">
            <div class="section-title"><h3>Patients récents</h3><a routerLink="/doctor/patients" style="font-size:12px;color:#2A4A38;">Voir tout →</a></div>
            <div class="stagger">
              @for (appt of recentPatients(); track appt.patientId) {
                <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid rgba(42,74,56,0.06);">
                  <div class="patient-avatar" style="width:36px;height:36px;font-size:12px;">{{ appt.patient.firstName[0] }}{{ appt.patient.lastName[0] }}</div>
                  <div style="flex:1;">
                    <p style="font-size:13px;font-weight:600;color:#1B2520;">{{ appt.patient.firstName }} {{ appt.patient.lastName }}</p>
                    <p style="font-size:11px;color:#7A8A82;">{{ appt.slot?.date | date:'MMM d' }} · {{ appt.motif }}</p>
                  </div>
                  <span class="badge {{ appt.status.toLowerCase() }}" style="font-size:10px;">{{ translateStatus(appt.status) }}</span>
                </div>
              }
            </div>
          </div>

          <div class="glass-card" style="padding:24px;">
            <div class="section-title"><h3>Actions rapides</h3></div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
              @for (a of quickActions; track a.label) {
                <a [routerLink]="a.path" class="quick-action-btn">
                  <lucide-icon [name]="a.icon" [size]="22" />
                  <span style="font-size:12px;font-weight:600;margin-top:4px;">{{ a.label }}</span>
                </a>
              }
            </div>
          </div>
        </div>
      </div>
    </main>
  `,
  styles: [`
    .ecg-header { padding:24px;position:relative;overflow:hidden;background:linear-gradient(135deg,rgba(42,74,56,0.06),rgba(123,97,255,0.04)); }
    .ecg-content { display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px; }
    .ecg-greeting { font-size:13px;color:#7A8A82;margin-bottom:4px; }
    .ecg-stats { display:flex;gap:24px; }
    .ecg-stat { text-align:center; }
    .ecg-num { display:block;font-size:28px;font-weight:700;font-family:'Fraunces',Georgia,serif;color:#2A4A38;line-height:1; }
    .ecg-lbl { font-size:11px;color:#7A8A82;text-transform:uppercase;letter-spacing:.05em; }
    .ecg-line-container { height:40px;overflow:hidden; }
    .ecg-svg { width:100%;height:100%; }
    .ecg-path { stroke-dasharray:1200;animation:ecg-draw 3s linear infinite; }
    @keyframes ecg-draw { 0%{stroke-dashoffset:1200;opacity:.4} 50%{opacity:1} 100%{stroke-dashoffset:-1200;opacity:.4} }

    .today-list { display:flex;flex-direction:column;gap:10px; }
    .today-card { padding:16px 20px;display:flex;align-items:center;gap:20px; }
    .time-col { text-align:center;min-width:60px; }
    .appt-time-big { font-size:18px;font-weight:700;color:#2A4A38;font-family:'JetBrains Mono',monospace; }
    .appt-time-duration { font-size:11px;color:#7A8A82; }
    .patient-col { flex:1;display:flex;align-items:center;gap:14px; }
    .patient-avatar { width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#3D6B4F,#00A36C);display:flex;align-items:center;justify-content:center;font-weight:700;color:white;font-size:14px;flex-shrink:0; }
    .patient-name { font-size:14px;font-weight:600;color:#1B2520; }
    .patient-motif { font-size:12px;color:#7A8A82;margin-top:2px; }
    .allergy-warn { font-size:11px;color:#C24040;margin-top:3px; }
    .actions-col { display:flex;align-items:center;gap:10px;flex-shrink:0; }

    .quick-action-btn { display:flex;flex-direction:column;align-items:center;padding:16px 8px;background:rgba(42,74,56,0.05);border:1px solid rgba(42,74,56,0.1);border-radius:12px;text-decoration:none;color:#3A5248;transition:all .2s; &:hover{background:rgba(42,74,56,0.06);border-color:rgba(42,74,56,0.3);color:#1B2520;transform:translateY(-2px);} }
    .section-title { display:flex;justify-content:space-between;align-items:center;margin-bottom:14px; h3{font-size:16px;font-weight:600;color:#1B2520;} }
  `],
})
export class DoctorDashboardComponent implements OnInit {
  private _loading   = signal(true);
  private _todayAppts  = signal<any[]>([]);
  private _recentPats  = signal<any[]>([]);
  private _stats       = signal({ todayTotal: 0, completedToday: 0, pending: 0, totalPatients: 0 });

  readonly loading             = this._loading.asReadonly();
  readonly todayAppointments   = this._todayAppts.asReadonly();
  readonly recentPatients      = this._recentPats.asReadonly();
  readonly stats               = this._stats.asReadonly();
  readonly today               = new Date();
  readonly doctorName          = () => this.authService.user()?.profile?.firstName || 'Doctor';

  quickActions = [
    { icon: 'calendar',      label: 'Planning',    path: '/doctor/planning' },
    { icon: 'users',         label: 'Patients',    path: '/doctor/patients' },
    { icon: 'pill',          label: 'Ordonnances', path: '/doctor/prescriptions' },
    { icon: 'user',          label: 'Mon profil',  path: '/doctor/profile' },
  ];

  constructor(private api: ApiService, private authService: AuthService) {}

  ngOnInit(): void {
    this.api.get<any>('/doctors/me/dashboard').subscribe({
      next: (res) => {
        const data = res.data;
        this._todayAppts.set(data.todayAppointments || []);
        this._stats.set(data.stats || {});
        this._loading.set(false);
      },
      error: () => {
        this._loading.set(false);
        this.api.get<any>('/doctors/me/appointments').subscribe(r => {
          const all = r.data || [];
          this._recentPats.set(all.slice(0, 5));
        });
      },
    });

    this.api.get<any>('/doctors/me/appointments').subscribe(r => {
      this._recentPats.set((r.data || []).slice(0, 5));
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
