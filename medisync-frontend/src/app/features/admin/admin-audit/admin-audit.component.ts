import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-audit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page page-enter">
      <h1 class="display" style="margin-bottom:8px;">Journal d'Audit</h1>
      <p class="text-muted" style="margin-bottom:20px;">Toutes les actions sensibles sont tracées ici.</p>
      <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
        <input class="input-field" placeholder="Rechercher utilisateur…" [(ngModel)]="q" style="max-width:280px;"/>
        <select class="input-field" [(ngModel)]="filterAction" style="max-width:180px;">
          <option value="">Toutes actions</option>
          @for (a of ['READ','CREATE','UPDATE','DELETE']; track a) { <option [value]="a">{{ a }}</option> }
        </select>
      </div>
      <div class="card" style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;">
          <thead><tr>
            @for (h of ['#','Utilisateur','Action','Ressource','IP','Heure']; track h) {
              <th style="text-align:left;padding:10px 14px;color:#5A7A9B;font-size:0.75rem;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,0.06);">{{ h }}</th>
            }
          </tr></thead>
          <tbody>
            @for (log of filtered; track log.id) {
              <tr style="border-bottom:1px solid rgba(255,255,255,0.03);">
                <td style="padding:10px 14px;font-family:monospace;color:#2E4A6B;font-size:0.8rem;">#{{ log.id }}</td>
                <td style="padding:10px 14px;font-family:monospace;font-size:0.82rem;">{{ log.user }}</td>
                <td style="padding:10px 14px;"><span [class]="'badge ' + actionBadge(log.action)">{{ log.action }}</span></td>
                <td style="padding:10px 14px;font-size:0.84rem;">{{ log.resource }}</td>
                <td style="padding:10px 14px;font-family:monospace;color:#5A7A9B;font-size:0.78rem;">{{ log.ip }}</td>
                <td style="padding:10px 14px;font-family:monospace;color:#5A7A9B;font-size:0.78rem;">{{ log.ts }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`.page{padding:32px;max-width:1200px;margin:0 auto;}`]
})
export class AdminAuditComponent {
  q = '';
  filterAction = '';

  logs = [
    { id: 1, user: 'admin@demo.com',   action: 'DELETE', resource: 'Patient #4821',     ip: '192.168.1.12', ts: '09:14:32' },
    { id: 2, user: 'doctor@demo.com',  action: 'CREATE', resource: 'Ordonnance #991',   ip: '192.168.1.8',  ts: '09:02:11' },
    { id: 3, user: 'sec@demo.com',     action: 'UPDATE', resource: 'RDV #3302',         ip: '192.168.1.20', ts: '08:57:44' },
    { id: 4, user: 'doctor@demo.com',  action: 'READ',   resource: 'Dossier #2201',     ip: '192.168.1.8',  ts: '08:45:19' },
    { id: 5, user: 'admin@demo.com',   action: 'CREATE', resource: 'Staff #107',        ip: '192.168.1.12', ts: '08:30:02' },
    { id: 6, user: 'patient@demo.com', action: 'READ',   resource: 'Ordonnance #988',   ip: '192.168.1.44', ts: '08:22:56' },
    { id: 7, user: 'doctor@demo.com',  action: 'UPDATE', resource: 'Dossier #2201',     ip: '192.168.1.8',  ts: '08:10:37' },
    { id: 8, user: 'sec@demo.com',     action: 'CREATE', resource: 'RDV #3310',         ip: '192.168.1.20', ts: '07:58:01' },
    { id: 9, user: 'admin@demo.com',   action: 'READ',   resource: 'Finance report Q1', ip: '192.168.1.12', ts: '07:42:18' },
  ];

  get filtered() {
    return this.logs.filter(l => {
      const matchQ = !this.q || l.user.includes(this.q);
      const matchA = !this.filterAction || l.action === this.filterAction;
      return matchQ && matchA;
    });
  }

  actionBadge(a: string) {
    return { READ: 'badge-cyan', CREATE: 'badge-green', UPDATE: 'badge-yellow', DELETE: 'badge-red' }[a] ?? 'badge-muted';
  }
}
