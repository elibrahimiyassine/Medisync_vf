import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-admin-audit',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, TopbarComponent, DatePipe, LucideAngularModule],
  template: `
    <app-sidebar />
    <app-topbar />
    <main class="page-wrapper">
      <div class="page-content">

        <!-- Tab switcher -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
          <div>
            <h2 style="font-family:'Fraunces',Georgia,serif;">
              {{ activeTab() === 'audit' ? "Journal d'audit" : 'Signalements patients' }}
            </h2>
            <p style="color:#7A8A82;font-size:13px;margin-top:4px;">
              {{ activeTab() === 'audit' ? 'Toutes les actions sensibles sont tracées' : 'Symptômes et alertes soumis par les patients' }}
            </p>
          </div>
          <div style="display:flex;gap:10px;align-items:center;">
            <div class="period-tabs">
              <button class="period-btn" [class.active]="activeTab() === 'audit'"    (click)="setTab('audit')">Audit</button>
              <button class="period-btn" [class.active]="activeTab() === 'reports'"  (click)="setTab('reports')">
                Signalements
                @if (openReportCount() > 0) {
                  <span class="badge-count">{{ openReportCount() }}</span>
                }
              </button>
            </div>
            @if (activeTab() === 'audit') {
              <input class="glass-input" style="width:200px;" placeholder="Filtrer par action..." [(ngModel)]="actionFilter" (ngModelChange)="applyFilter()" />
              <select class="glass-input" style="width:150px;" [(ngModel)]="roleFilter" (ngModelChange)="applyFilter()">
                <option value="">Tous les rôles</option>
                <option value="ADMIN">Admin</option>
                <option value="DOCTOR">Médecin</option>
                <option value="SECRETARY">Secrétaire</option>
                <option value="PATIENT">Patient</option>
              </select>
            }
            @if (activeTab() === 'reports') {
              <select class="glass-input" style="width:160px;" [(ngModel)]="reportStatusFilter" (ngModelChange)="applyReportFilter()">
                <option value="">Tous les statuts</option>
                <option value="OPEN">Ouverts</option>
                <option value="IN_PROGRESS">En cours</option>
                <option value="RESOLVED">Résolus</option>
              </select>
            }
          </div>
        </div>

        <!-- ── AUDIT LOG TAB ── -->
        @if (activeTab() === 'audit') {
          <div class="glass-card" style="padding:0;overflow:hidden;">
            <table class="ms-table">
              <thead>
                <tr>
                  <th>Horodatage</th>
                  <th>Utilisateur</th>
                  <th>Rôle</th>
                  <th>Action</th>
                  <th>Cible</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                @for (log of filtered(); track log.id) {
                  <tr>
                    <td style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#7A8A82;white-space:nowrap;">
                      {{ log.createdAt | date:'d MMM, HH:mm:ss' }}
                    </td>
                    <td><strong style="color:#1B2520;">{{ log.user?.email || '—' }}</strong></td>
                    <td><span class="badge role-badge" [class]="getRoleClass(log.user?.role)">{{ log.user?.role }}</span></td>
                    <td><span class="action-chip" [class]="getActionClass(log.action)">{{ log.action }}</span></td>
                    <td style="color:#3A5248;font-size:12px;max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ log.target || '—' }}</td>
                    <td style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#7A8A82;">{{ log.ip || '—' }}</td>
                  </tr>
                }
                @empty {
                  <tr><td colspan="6" style="text-align:center;color:#7A8A82;padding:40px;">Aucun journal trouvé</td></tr>
                }
              </tbody>
            </table>
          </div>

          @if (totalPages() > 1) {
            <div style="display:flex;justify-content:center;gap:8px;margin-top:20px;">
              <button class="btn-secondary" style="padding:6px 14px;display:inline-flex;align-items:center;gap:4px;" (click)="prevPage()" [disabled]="page() === 1"><lucide-icon name="chevron-left" [size]="14" /> Préc.</button>
              <span style="color:#7A8A82;align-self:center;font-size:13px;">{{ page() }} / {{ totalPages() }}</span>
              <button class="btn-secondary" style="padding:6px 14px;display:inline-flex;align-items:center;gap:4px;" (click)="nextPage()" [disabled]="page() === totalPages()">Suiv. <lucide-icon name="chevron-right" [size]="14" /></button>
            </div>
          }
        }

        <!-- ── REPORTS TAB ── -->
        @if (activeTab() === 'reports') {
          <div class="glass-card" style="padding:0;overflow:hidden;">
            <table class="ms-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Patient</th>
                  <th>Urgence</th>
                  <th>Description</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                @for (r of filteredReports(); track r.id) {
                  <tr>
                    <td style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#7A8A82;white-space:nowrap;">
                      {{ r.createdAt | date:'d MMM yyyy, HH:mm' }}
                    </td>
                    <td>
                      <strong style="color:#1B2520;">{{ r.patient?.firstName }} {{ r.patient?.lastName }}</strong>
                    </td>
                    <td>
                      <span class="urgency-badge" [class]="'urgency-' + (r.urgency || 'INFO').toLowerCase()">
                        {{ r.urgency || 'INFO' }}
                      </span>
                    </td>
                    <td style="color:#3A5248;font-size:13px;max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" [title]="r.description">
                      {{ r.description }}
                    </td>
                    <td>
                      <select class="glass-input" style="font-size:12px;padding:4px 8px;height:auto;"
                        [value]="r.status"
                        (change)="onStatusChange(r, $any($event.target).value)">
                        <option value="OPEN">Ouvert</option>
                        <option value="IN_PROGRESS">En cours</option>
                        <option value="RESOLVED">Résolu</option>
                      </select>
                    </td>
                    <td>
                      <span class="report-status-dot" [class]="'dot-' + (r.status || 'OPEN').toLowerCase()"></span>
                    </td>
                  </tr>
                }
                @empty {
                  <tr><td colspan="6" style="text-align:center;color:#7A8A82;padding:40px;">Aucun signalement trouvé</td></tr>
                }
              </tbody>
            </table>
          </div>
        }

      </div>
    </main>
  `,
  styles: [`
    .action-chip { padding:3px 8px;border-radius:6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em; }
    .action-chip.create { background:rgba(61,107,79,0.08);color:#3D6B4F; }
    .action-chip.update { background:rgba(42,74,56,0.1);color:#2A4A38; }
    .action-chip.delete { background:rgba(194,64,64,0.08);color:#C24040; }
    .action-chip.login  { background:rgba(201,99,60,0.1);color:#C9633C; }
    .action-chip.other  { background:rgba(90,122,155,0.1);color:#7A8A82; }

    .period-tabs { display:flex;border:1px solid rgba(42,74,56,0.15);border-radius:10px;overflow:hidden; }
    .period-btn  { position:relative;padding:7px 16px;background:transparent;border:none;font-size:13px;font-weight:600;color:#7A8A82;cursor:pointer;transition:all .2s;font-family:'Geist','Inter',sans-serif; }
    .period-btn.active  { background:#2A4A38;color:#F2EDE4; }
    .period-btn:hover:not(.active) { background:rgba(42,74,56,0.06);color:#3A5248; }

    .badge-count { position:absolute;top:4px;right:4px;background:#C24040;color:#fff;border-radius:50%;width:16px;height:16px;font-size:10px;display:flex;align-items:center;justify-content:center;font-weight:700; }

    .urgency-badge { padding:3px 8px;border-radius:6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em; }
    .urgency-info     { background:rgba(90,122,155,0.1);color:#5A7A9B; }
    .urgency-low      { background:rgba(61,107,79,0.1);color:#3D6B4F; }
    .urgency-medium   { background:rgba(184,121,42,0.12);color:#B8792A; }
    .urgency-high     { background:rgba(201,99,60,0.12);color:#C9633C; }
    .urgency-critical { background:rgba(194,64,64,0.12);color:#C24040; }

    .report-status-dot { display:inline-block;width:8px;height:8px;border-radius:50%; }
    .dot-open        { background:#C24040; }
    .dot-in_progress { background:#B8792A; }
    .dot-resolved    { background:#3D6B4F; }

    select.glass-input option { background:#FAF7F1;color:#1B2520; }
  `],
})
export class AdminAuditComponent implements OnInit {
  private _all      = signal<any[]>([]);
  private _filtered = signal<any[]>([]);
  private _reports         = signal<any[]>([]);
  private _filteredReports = signal<any[]>([]);

  readonly filtered        = this._filtered.asReadonly();
  readonly filteredReports = this._filteredReports.asReadonly();

  activeTab   = signal<'audit' | 'reports'>('audit');
  page        = signal(1);
  totalPages  = signal(1);
  actionFilter      = '';
  roleFilter        = '';
  reportStatusFilter = '';

  readonly openReportCount = () =>
    this._reports().filter(r => r.status === 'OPEN').length;

  private readonly PAGE_SIZE = 50;

  constructor(
    private api: ApiService,
    private notifSvc: NotificationService,
  ) {}

  ngOnInit(): void { this.load(); this.loadReports(); }

  setTab(tab: 'audit' | 'reports'): void {
    this.activeTab.set(tab);
    if (tab === 'reports') this.loadReports();
  }

  load(): void {
    this.api.get<any>('/admin/audit', { limit: 500 }).subscribe(res => {
      this._all.set(res.data || []);
      this.applyFilter();
    });
  }

  loadReports(): void {
    this.api.get<any>('/admin/reports').subscribe(res => {
      this._reports.set(res.data || []);
      this.applyReportFilter();
    });
  }

  applyFilter(): void {
    let logs = this._all();
    if (this.actionFilter) logs = logs.filter(l => l.action?.toLowerCase().includes(this.actionFilter.toLowerCase()));
    if (this.roleFilter)   logs = logs.filter(l => l.user?.role === this.roleFilter);
    this.totalPages.set(Math.max(1, Math.ceil(logs.length / this.PAGE_SIZE)));
    this.page.set(1);
    this._filtered.set(logs.slice(0, this.PAGE_SIZE));
  }

  applyReportFilter(): void {
    let r = this._reports();
    if (this.reportStatusFilter) r = r.filter(x => x.status === this.reportStatusFilter);
    this._filteredReports.set(r);
  }

  onStatusChange(report: any, newStatus: string): void {
    this.api.patch<any>(`/admin/reports/${report.id}`, { status: newStatus }).subscribe({
      next: (res) => {
        report.status = res.data?.status || newStatus;
        this._reports.update(list => list.map(r => r.id === report.id ? { ...r, status: newStatus } : r));
        this.applyReportFilter();
        this.notifSvc.showToast('Statut mis à jour', 'success');
      },
      error: () => this.notifSvc.showToast('Échec de la mise à jour', 'error'),
    });
  }

  prevPage(): void {
    if (this.page() > 1) { this.page.update(p => p - 1); this.paginate(); }
  }

  nextPage(): void {
    if (this.page() < this.totalPages()) { this.page.update(p => p + 1); this.paginate(); }
  }

  private paginate(): void {
    let logs = this._all();
    if (this.actionFilter) logs = logs.filter(l => l.action?.toLowerCase().includes(this.actionFilter.toLowerCase()));
    if (this.roleFilter)   logs = logs.filter(l => l.user?.role === this.roleFilter);
    const start = (this.page() - 1) * this.PAGE_SIZE;
    this._filtered.set(logs.slice(start, start + this.PAGE_SIZE));
  }

  getRoleClass(role: string): string {
    const map: Record<string, string> = { ADMIN: 'no_show', DOCTOR: 'confirmed', SECRETARY: 'pending', PATIENT: 'completed' };
    return map[role] || '';
  }

  getActionClass(action: string): string {
    const a = (action || '').toLowerCase();
    if (a.includes('create') || a.includes('register')) return 'create';
    if (a.includes('update') || a.includes('edit'))     return 'update';
    if (a.includes('delete') || a.includes('remove'))   return 'delete';
    if (a.includes('login')  || a.includes('auth'))     return 'login';
    return 'other';
  }
}
