import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
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

        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
          <div>
            <h2 style="font-family:'Fraunces',Georgia,serif;">Journal d'audit</h2>
            <p style="color:#7A8A82;font-size:13px;margin-top:4px;">Toutes les actions sensibles sont tracées</p>
          </div>
          <div style="display:flex;gap:10px;">
            <input class="glass-input" style="width:200px;" placeholder="Filtrer par action..." [(ngModel)]="actionFilter" (ngModelChange)="applyFilter()" />
            <select class="glass-input" style="width:150px;" [(ngModel)]="roleFilter" (ngModelChange)="applyFilter()">
              <option value="">Tous les rôles</option>
              <option value="ADMIN">Admin</option>
              <option value="DOCTOR">Médecin</option>
              <option value="SECRETARY">Secrétaire</option>
              <option value="PATIENT">Patient</option>
            </select>
          </div>
        </div>

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
                    {{ log.createdAt | date:'MMM d, HH:mm:ss' }}
                  </td>
                  <td>
                    <strong style="color:#1B2520;">{{ log.user?.email || '—' }}</strong>
                  </td>
                  <td>
                    <span class="badge role-badge" [class]="getRoleClass(log.user?.role)">{{ log.user?.role }}</span>
                  </td>
                  <td>
                    <span class="action-chip" [class]="getActionClass(log.action)">{{ log.action }}</span>
                  </td>
                  <td style="color:#3A5248;font-size:12px;max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                    {{ log.target || '—' }}
                  </td>
                  <td style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#7A8A82;">
                    {{ log.ip || '—' }}
                  </td>
                </tr>
              }
              @empty {
                <tr><td colspan="6" style="text-align:center;color:#7A8A82;padding:40px;">Aucun journal trouvé</td></tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div style="display:flex;justify-content:center;gap:8px;margin-top:20px;">
            <button class="btn-secondary" style="padding:6px 14px;display:inline-flex;align-items:center;gap:4px;" (click)="prevPage()" [disabled]="page() === 1"><lucide-icon name="chevron-left" [size]="14" /> Préc.</button>
            <span style="color:#7A8A82;align-self:center;font-size:13px;">{{ page() }} / {{ totalPages() }}</span>
            <button class="btn-secondary" style="padding:6px 14px;display:inline-flex;align-items:center;gap:4px;" (click)="nextPage()" [disabled]="page() === totalPages()">Suiv. <lucide-icon name="chevron-right" [size]="14" /></button>
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
  `],
})
export class AdminAuditComponent implements OnInit {
  private _all    = signal<any[]>([]);
  private _filtered = signal<any[]>([]);

  readonly filtered   = this._filtered.asReadonly();

  page        = signal(1);
  totalPages  = signal(1);
  actionFilter = '';
  roleFilter   = '';

  private readonly PAGE_SIZE = 50;

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.api.get<any>('/admin/audit', { limit: 500 }).subscribe(res => {
      this._all.set(res.data || []);
      this.applyFilter();
    });
  }

  applyFilter(): void {
    let logs = this._all();
    if (this.actionFilter) {
      logs = logs.filter(l => l.action?.toLowerCase().includes(this.actionFilter.toLowerCase()));
    }
    if (this.roleFilter) {
      logs = logs.filter(l => l.user?.role === this.roleFilter);
    }
    this.totalPages.set(Math.max(1, Math.ceil(logs.length / this.PAGE_SIZE)));
    this.page.set(1);
    this._filtered.set(logs.slice(0, this.PAGE_SIZE));
  }

  prevPage(): void {
    if (this.page() > 1) {
      this.page.update(p => p - 1);
      this.paginate();
    }
  }

  nextPage(): void {
    if (this.page() < this.totalPages()) {
      this.page.update(p => p + 1);
      this.paginate();
    }
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
