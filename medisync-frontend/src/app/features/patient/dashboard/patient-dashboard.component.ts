import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, SidebarComponent, TopbarComponent, DatePipe, LucideAngularModule],
  template: `
    <app-sidebar />
    <app-topbar />

    <main class="page-wrapper">
      <div class="page-content">

        <!-- Welcome banner -->
        <div class="welcome-banner glass-card animate-slide-down">
          <div class="welcome-content">
            <div>
              <p class="welcome-greeting">{{ greeting() }},</p>
              <h2 class="welcome-name">{{ patientName() }}</h2>
              <p class="welcome-sub">Voici l'état de votre santé aujourd'hui.</p>
            </div>
            <div class="welcome-illustration">
              <svg width="80" height="80" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="48" fill="rgba(42,74,56,0.06)" stroke="rgba(42,74,56,0.15)" stroke-width="2"/>
                <path d="M50 30 L50 70 M30 50 L70 50" stroke="#2A4A38" stroke-width="5" stroke-linecap="round"/>
                <circle cx="50" cy="50" r="20" fill="none" stroke="rgba(42,74,56,0.3)" stroke-width="2"/>
              </svg>
            </div>
          </div>
          <div class="ecg-bar" style="border-radius:0 0 16px 16px;"></div>
        </div>

        <!-- Stats row -->
        <div class="grid-4 stagger" style="margin-top:24px;">
          <div class="stat-card">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
              <div>
                <p class="stat-label">À venir</p>
                <p class="stat-value" style="color:#2A4A38;">{{ stats().upcoming }}</p>
                <p style="font-size:12px;color:#7A8A82;margin-top:4px;">rendez-vous</p>
              </div>
              <div class="stat-icon" style="background:rgba(42,74,56,0.1);width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#2A4A38;"><lucide-icon name="calendar" [size]="20" /></div>
            </div>
          </div>
          <div class="stat-card">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
              <div>
                <p class="stat-label">Ordonnances</p>
                <p class="stat-value" style="color:#3D6B4F;">{{ stats().prescriptions }}</p>
                <p style="font-size:12px;color:#7A8A82;margin-top:4px;">actives</p>
              </div>
              <div style="background:rgba(61,107,79,0.08);width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#3D6B4F;"><lucide-icon name="pill" [size]="20" /></div>
            </div>
          </div>
          <div class="stat-card">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
              <div>
                <p class="stat-label">Documents</p>
                <p class="stat-value" style="color:#C9633C;">{{ stats().documents }}</p>
                <p style="font-size:12px;color:#7A8A82;margin-top:4px;">dans le dossier</p>
              </div>
              <div style="background:rgba(201,99,60,0.1);width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#C9633C;"><lucide-icon name="file-text" [size]="20" /></div>
            </div>
          </div>
          <div class="stat-card">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
              <div>
                <p class="stat-label">Factures</p>
                <p class="stat-value" style="color:#B8792A;">{{ stats().pendingInvoices }}</p>
                <p style="font-size:12px;color:#7A8A82;margin-top:4px;">en attente</p>
              </div>
              <div style="background:rgba(255,184,0,0.1);width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#B8792A;"><lucide-icon name="receipt" [size]="20" /></div>
            </div>
          </div>
        </div>

        <div class="grid-2" style="margin-top:24px;gap:20px;">
          <!-- Upcoming Appointments -->
          <div class="glass-card" style="padding:24px;">
            <div class="section-title">
              <h3>Prochains rendez-vous</h3>
              <a routerLink="/patient/appointments" class="view-all-btn">Voir tout →</a>
            </div>

            @if (loadingAppts()) {
              @for (i of [1,2,3]; track i) {
                <div class="appt-skeleton">
                  <div class="skeleton" style="width:44px;height:44px;border-radius:12px;flex-shrink:0;"></div>
                  <div style="flex:1;display:flex;flex-direction:column;gap:6px;">
                    <div class="skeleton" style="width:60%;height:14px;"></div>
                    <div class="skeleton" style="width:40%;height:12px;"></div>
                  </div>
                </div>
              }
            } @else if (upcomingAppointments().length === 0) {
              <div class="empty-state">
                <lucide-icon name="calendar" [size]="36" style="color:#7A8A82;" />
                <p>Aucun rendez-vous à venir</p>
                <a routerLink="/patient/appointments" class="btn-primary" style="font-size:13px;padding:8px 18px;margin-top:8px;">Prendre rendez-vous</a>
              </div>
            } @else {
              <div class="appt-list stagger">
                @for (appt of upcomingAppointments(); track appt.id) {
                  <div class="appt-item">
                    <div class="appt-avatar">
                      {{ appt.doctor.firstName[0] }}{{ appt.doctor.lastName[0] }}
                    </div>
                    <div class="appt-info">
                      <p class="appt-doctor">Dr. {{ appt.doctor.firstName }} {{ appt.doctor.lastName }}</p>
                      <p class="appt-specialty">{{ appt.doctor.specialty }}</p>
                      <p class="appt-time">
                        <lucide-icon name="calendar" [size]="13" />
                        {{ appt.slot.date | date:'EEE, MMM d' }} at {{ appt.slot.startTime }}
                      </p>
                    </div>
                    <span class="badge {{ appt.status.toLowerCase() }}">{{ appt.status }}</span>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Recent Medical Records -->
          <div class="glass-card" style="padding:24px;">
            <div class="section-title">
              <h3>Historique médical récent</h3>
              <a routerLink="/patient/dossier" class="view-all-btn">Voir tout →</a>
            </div>

            @if (recentRecords().length === 0) {
              <div class="empty-state">
                <lucide-icon name="clipboard-list" [size]="36" style="color:#7A8A82;" />
                <p>Aucun dossier médical pour le moment</p>
              </div>
            } @else {
              <div class="timeline stagger">
                @for (rec of recentRecords(); track rec.id) {
                  <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                      <p class="timeline-title">{{ rec.diagnosis }}</p>
                      <p class="timeline-meta">Dr. {{ rec.doctor.firstName }} {{ rec.doctor.lastName }}</p>
<<<<<<< HEAD
                      <p class="timeline-date">{{ rec.createdAt | date:'d MMM yyyy' }}</p>
=======
                      <p class="timeline-date">{{ rec.createdAt | date:'MMM d, yyyy' }}</p>
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <!-- Quick actions -->
        <div class="quick-actions glass-card" style="padding:24px;margin-top:20px;">
          <div class="section-title"><h3>Actions rapides</h3></div>
          <div class="actions-grid">
            @for (action of quickActions; track action.label) {
              <a [routerLink]="action.path" class="action-card">
                <span class="action-icon" [style.background]="action.bg"><lucide-icon [name]="action.icon" [size]="22" /></span>
                <span class="action-label">{{ action.label }}</span>
              </a>
            }
          </div>
        </div>

        <!-- Signalement banner -->
        <div class="signal-banner glass-card" style="margin-top:20px;">
          <div class="signal-banner-left">
            <lucide-icon name="siren" [size]="28" class="signal-pulse" />
            <div>
              <p class="signal-title">Signalement de symptômes</p>
              <p class="signal-sub">Alertez votre médecin d'un problème de santé urgent ou inhabituel</p>
            </div>
          </div>
          <button class="btn-danger signal-cta" (click)="openSignalModal()">Signaler un symptôme</button>
        </div>

      </div>
    </main>

    <!-- Signalement modal -->
    @if (signalModalOpen()) {
<<<<<<< HEAD
      <div class="modal-backdrop" (click)="closeSignalModal()">
      <div class="signal-modal glass-card animate-scale-in" (click)="$event.stopPropagation()">
=======
      <div class="overlay" (click)="closeSignalModal()"></div>
      <div class="signal-modal glass-card animate-scale-in">
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
        <div class="modal-header">
          <h3>Signalement de symptôme</h3>
          <button class="btn-icon" (click)="closeSignalModal()"><lucide-icon name="x" [size]="16" /></button>
        </div>
        <form [formGroup]="signalForm" (ngSubmit)="submitSignal()">
          <div class="form-group" style="margin-bottom:14px;">
            <label>Niveau d'urgence *</label>
            <div class="urgency-btns">
              @for (u of urgencyLevels; track u.value) {
                <button type="button" class="urgency-btn"
                        [class.selected]="signalForm.get('urgency')?.value === u.value"
                        [style.border-color]="signalForm.get('urgency')?.value === u.value ? u.color : ''"
                        [style.background]="signalForm.get('urgency')?.value === u.value ? u.bg : ''"
                        (click)="signalForm.patchValue({ urgency: u.value })"
                        style="display:inline-flex;align-items:center;justify-content:center;gap:5px;">
                  <lucide-icon [name]="u.iconName" [size]="13" /> {{ u.label }}
                </button>
              }
            </div>
          </div>
          <div class="form-group" style="margin-bottom:14px;">
            <label>Description des symptômes *</label>
            <textarea formControlName="description" class="glass-input" style="min-height:110px;resize:vertical;"
                      placeholder="Décrivez vos symptômes, depuis quand, intensité..."></textarea>
            @if (signalForm.get('description')?.invalid && signalForm.get('description')?.touched) {
              <span class="error-msg">Ce champ est obligatoire</span>
            }
          </div>
          <div class="form-group" style="margin-bottom:16px;">
            <label>Médecin à notifier</label>
            <select formControlName="doctorId" class="glass-input">
              <option value="">— Mon médecin habituel —</option>
              @for (doc of recentDoctors(); track doc.id) {
                <option [value]="doc.id">Dr. {{ doc.firstName }} {{ doc.lastName }}</option>
              }
            </select>
          </div>
          @if (signalForm.get('urgency')?.value === 'CRITICAL') {
            <div class="critical-warning animate-slide-down" style="display:flex;align-items:flex-start;gap:8px;">
              <lucide-icon name="triangle-alert" [size]="14" style="flex-shrink:0;margin-top:2px;" /> En cas d'urgence vitale, appelez le <strong>15 (SAMU)</strong> ou le <strong>112</strong> immédiatement.
            </div>
          }
          <div style="display:flex;gap:10px;margin-top:4px;">
            <button type="button" class="btn-secondary" style="flex:1;" (click)="closeSignalModal()">Annuler</button>
            <button type="submit" class="btn-danger" style="flex:2;" [disabled]="signalForm.invalid || sendingSignal()">
              @if (sendingSignal()) { <span class="spinner"></span> Envoi... }
              @else { <lucide-icon name="siren" [size]="13" style="margin-right:5px;" /> Envoyer le signalement }
            </button>
          </div>
        </form>
      </div>
<<<<<<< HEAD
      </div>
=======
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
    }
  `,
  styles: [`
    .welcome-banner { padding: 28px; position: relative; overflow: hidden; background: linear-gradient(135deg, rgba(42,74,56,0.06), rgba(123,97,255,0.06)); }
    .welcome-content { display: flex; justify-content: space-between; align-items: center; }
    .welcome-greeting { font-size: 14px; color: #7A8A82; margin-bottom: 4px; }
    .welcome-name { font-size: 26px; font-weight: 700; color: #1B2520; font-family: 'Fraunces', Georgia, serif; }
    .welcome-sub { font-size: 13px; color: #3A5248; margin-top: 6px; }

    .appt-skeleton { display: flex; gap: 12px; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(42,74,56,0.06); }
    .appt-list { display: flex; flex-direction: column; gap: 2px; }
    .appt-item { display: flex; align-items: center; gap: 14px; padding: 12px; border-radius: 12px; transition: background 0.15s; cursor: default; &:hover { background: rgba(42,74,56,0.05); } }
    .appt-avatar { width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #2A4A38, #C9633C); display: flex; align-items: center; justify-content: center; font-weight: 700; color: white; font-size: 14px; flex-shrink: 0; }
    .appt-info { flex: 1; min-width: 0; }
    .appt-doctor { font-size: 14px; font-weight: 600; color: #1B2520; }
    .appt-specialty { font-size: 12px; color: #7A8A82; margin-top: 1px; }
    .appt-time { font-size: 12px; color: #3A5248; margin-top: 4px; display: flex; align-items: center; gap: 4px; }

    .timeline { display: flex; flex-direction: column; gap: 0; }
    .timeline-item { display: flex; gap: 16px; padding: 12px 0; position: relative; &::before { content: ''; position: absolute; left: 6px; top: 28px; bottom: -4px; width: 1px; background: rgba(42,74,56,0.15); } &:last-child::before { display: none; } }
    .timeline-dot { width: 13px; height: 13px; border-radius: 50%; background: #2A4A38; border: 2px solid #EFEAE0; box-shadow: 0 0 8px rgba(0,212,255,0.5); flex-shrink: 0; margin-top: 3px; }
    .timeline-content { flex: 1; }
    .timeline-title { font-size: 14px; font-weight: 600; color: #1B2520; }
    .timeline-meta { font-size: 12px; color: #7A8A82; margin-top: 2px; }
    .timeline-date { font-size: 11px; color: #3A5A7B; margin-top: 2px; }

    .section-title { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .view-all-btn { font-size: 12px; color: #2A4A38; cursor: pointer; text-decoration: none; &:hover { text-decoration: underline; } }

    .empty-state { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 32px; color: #7A8A82; font-size: 13px; }

    .actions-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; @media(max-width:768px){grid-template-columns:repeat(2,1fr);} }
    .action-card { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 20px 12px; background: rgba(42,74,56,0.05); border: 1px solid rgba(42,74,56,0.1); border-radius: 14px; text-decoration: none; color: #3A5248; transition: all 0.2s; &:hover { background: rgba(42,74,56,0.06); border-color: rgba(42,74,56,0.3); transform: translateY(-3px); color: #1B2520; } }
    .action-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: #2A4A38; }
    .action-label { font-size: 13px; font-weight: 600; }

    .signal-banner { padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; gap: 16px; background: linear-gradient(135deg, rgba(194,64,64,0.04), rgba(201,99,60,0.06)); border-left: 3px solid #C24040; }
    .signal-banner-left { display: flex; align-items: center; gap: 16px; }
    .signal-pulse { animation: pulse 1.8s infinite; display: flex; align-items: center; color: #C24040; }
    @keyframes pulse { 0%,100%{transform:scale(1);} 50%{transform:scale(1.15);} }
    .signal-title { font-size: 15px; font-weight: 700; color: #C24040; }
    .signal-sub { font-size: 12px; color: #7A8A82; margin-top: 2px; }
    .signal-cta { white-space: nowrap; flex-shrink: 0; }

<<<<<<< HEAD
    .modal-backdrop { position: fixed; inset: 0; background: rgba(27,37,32,0.45); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .signal-modal { position: relative; z-index: 1001; width: min(520px, 94vw); padding: 28px; }
=======
    .signal-modal { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1001; width: min(520px, 94vw); padding: 28px; }
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .modal-header h3 { font-size: 17px; font-weight: 700; color: #1B2520; font-family: 'Fraunces', Georgia, serif; }
    .btn-icon { background: none; border: none; font-size: 22px; cursor: pointer; color: #7A8A82; line-height: 1; padding: 0 4px; &:hover { color: #C24040; } }

    .urgency-btns { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 8px; }
    .urgency-btn { flex: 1; min-width: 100px; padding: 10px 14px; border: 1.5px solid rgba(42,74,56,0.15); border-radius: 10px; background: transparent; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.18s; font-family: 'Geist', 'Inter', sans-serif; color: #3A5248; &:hover { border-color: rgba(42,74,56,0.35); } &.selected { font-weight: 700; } }

    .critical-warning { background: rgba(194,64,64,0.08); border: 1px solid rgba(194,64,64,0.25); border-radius: 10px; padding: 12px 14px; font-size: 13px; color: #C24040; margin-bottom: 14px; line-height: 1.5; }
<<<<<<< HEAD
=======

    .overlay { position: fixed; inset: 0; background: rgba(27,37,32,0.45); backdrop-filter: blur(4px); z-index: 1000; }
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
  `],
})
export class PatientDashboardComponent implements OnInit {
  private _loadingAppts       = signal(true);
  private _upcomingAppts      = signal<any[]>([]);
  private _recentRecords      = signal<any[]>([]);
  private _stats              = signal({ upcoming: 0, prescriptions: 0, documents: 0, pendingInvoices: 0 });
  private _signalModalOpen    = signal(false);
  private _sendingSignal      = signal(false);
  private _recentDoctors      = signal<any[]>([]);

  readonly loadingAppts          = this._loadingAppts.asReadonly();
  readonly upcomingAppointments  = this._upcomingAppts.asReadonly();
  readonly recentRecords         = this._recentRecords.asReadonly();
  readonly stats                 = this._stats.asReadonly();
  readonly signalModalOpen       = this._signalModalOpen.asReadonly();
  readonly sendingSignal         = this._sendingSignal.asReadonly();
  readonly recentDoctors         = this._recentDoctors.asReadonly();

  signalForm!: ReturnType<FormBuilder['group']>;

  urgencyLevels = [
    { value: 'INFO',     label: 'Information', iconName: 'alert-circle',  color: '#2A4A38', bg: 'rgba(42,74,56,0.08)' },
    { value: 'MODERATE', label: 'Modéré',      iconName: 'triangle-alert', color: '#B8792A', bg: 'rgba(184,121,42,0.08)' },
    { value: 'CRITICAL', label: 'Urgent',       iconName: 'siren',          color: '#C24040', bg: 'rgba(194,64,64,0.08)' },
  ];

  readonly patientName = () => {
    const p = this.authService.user()?.profile;
    return p ? `${p.firstName} ${p.lastName}` : 'Patient';
  };

  readonly greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  quickActions = [
    { icon: 'calendar',      label: 'Prendre RDV',     path: '/patient/appointments', bg: 'rgba(42,74,56,0.12)' },
    { icon: 'clipboard-list', label: 'Dossier médical', path: '/patient/dossier',      bg: 'rgba(123,97,255,0.12)' },
    { icon: 'pill',           label: 'Ordonnances',     path: '/patient/prescriptions', bg: 'rgba(0,245,160,0.12)' },
    { icon: 'star',           label: 'Laisser un avis', path: '/patient/feedback',     bg: 'rgba(255,184,0,0.12)' },
  ];

  constructor(
    private api: ApiService,
    private authService: AuthService,
    private fb: FormBuilder,
    private notifSvc: NotificationService,
  ) {
    this.signalForm = this.fb.group({
      urgency:     ['MODERATE', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]],
      doctorId:    [''],
    });
  }

  ngOnInit(): void {
    this.loadDashboard();
<<<<<<< HEAD
    this.api.get<any>('/doctors').subscribe({
      next: res => this._recentDoctors.set(res.data || []),
      error: () => {},
    });
=======
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
  }

  openSignalModal(): void {
    this.signalForm.reset({ urgency: 'MODERATE', description: '', doctorId: '' });
    this._signalModalOpen.set(true);
  }

  closeSignalModal(): void {
    this._signalModalOpen.set(false);
  }

  submitSignal(): void {
    if (this.signalForm.invalid) { this.signalForm.markAllAsTouched(); return; }
    this._sendingSignal.set(true);
    const payload = this.signalForm.value;
    this.api.post('/patients/signal', payload).subscribe({
      next: () => {
        this._sendingSignal.set(false);
        this._signalModalOpen.set(false);
        this.notifSvc.showToast('Signalement envoyé avec succès', 'success');
      },
      error: () => {
        this._sendingSignal.set(false);
        this.notifSvc.showToast('Erreur lors de l\'envoi du signalement', 'error');
      },
    });
  }

  private loadDashboard(): void {
    this.api.get<any>('/patients/me').subscribe({
      next: (res) => {
        const data = res.data;
        const upcoming = (data.appointments || []).filter((a: any) =>
          ['PENDING', 'CONFIRMED'].includes(a.status)
        );
        this._upcomingAppts.set(upcoming.slice(0, 4));
        this._recentRecords.set([]);
        this._stats.set({
          upcoming: upcoming.length,
          prescriptions: (data.prescriptions || []).length,
          documents: 0,
          pendingInvoices: 0,
        });
        this._loadingAppts.set(false);
<<<<<<< HEAD
=======

        const doctors: any[] = [];
        (data.appointments || []).forEach((a: any) => {
          if (a.doctor && !doctors.find(d => d.id === a.doctor.id)) {
            doctors.push(a.doctor);
          }
        });
        this._recentDoctors.set(doctors.slice(0, 5));
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
      },
      error: () => this._loadingAppts.set(false),
    });
  }
}
