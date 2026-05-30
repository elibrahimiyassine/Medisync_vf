import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-finance',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page page-enter">
      <h1 class="display" style="margin-bottom:8px;">Finances</h1>
      <p class="text-muted" style="margin-bottom:28px;">Suivi des revenus et facturation</p>
      <div class="kpi-grid">
        @for (k of kpis; track k.label) {
          <div class="card" style="padding:24px;">
            <div class="display" style="font-size:2rem; font-weight:700; margin-bottom:4px;" [style.color]="k.color">{{ k.value }}</div>
            <div class="text-muted" style="font-size:0.84rem;">{{ k.label }}</div>
          </div>
        }
      </div>
      <div class="card" style="margin-top:20px;">
        <h3 class="display" style="margin-bottom:16px;">Dernières factures</h3>
        <table style="width:100%; border-collapse:collapse;">
          <thead><tr>
            <th style="text-align:left;padding:10px 14px;color:#5A7A9B;font-size:0.75rem;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,0.06);">Patient</th>
            <th style="text-align:left;padding:10px 14px;color:#5A7A9B;font-size:0.75rem;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,0.06);">Montant</th>
            <th style="text-align:left;padding:10px 14px;color:#5A7A9B;font-size:0.75rem;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,0.06);">Date</th>
            <th style="text-align:left;padding:10px 14px;color:#5A7A9B;font-size:0.75rem;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,0.06);">Statut</th>
          </tr></thead>
          <tbody>
            @for (inv of invoices; track inv.id) {
              <tr style="border-bottom:1px solid rgba(255,255,255,0.03);">
                <td style="padding:10px 14px; font-size:0.85rem;">{{ inv.patient }}</td>
                <td style="padding:10px 14px; font-family:monospace; color:#00D4FF;">{{ inv.amount }} MAD</td>
                <td style="padding:10px 14px; font-size:0.82rem; color:#5A7A9B;">{{ inv.date }}</td>
                <td style="padding:10px 14px;"><span [class]="'badge ' + inv.badge">{{ inv.status }}</span></td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`.page{padding:32px;max-width:1000px;margin:0 auto;} .kpi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}`]
})
export class AdminFinanceComponent {
  kpis = [
    { label: 'Revenus ce mois',   value: '28 460 MAD', color: '#00F5A0' },
    { label: 'Factures en attente', value: '12',      color: '#FFB800' },
    { label: 'Taux recouvrement',  value: '94%',       color: '#00D4FF' },
  ];

  invoices = [
    { id: 1, patient: 'Yass Jabouri',    amount: '350', date: '28 Avr 2026', status: 'Payée',    badge: 'badge-green'  },
    { id: 2, patient: 'Sara El Amrani',  amount: '500', date: '26 Avr 2026', status: 'En attente', badge: 'badge-yellow' },
    { id: 3, patient: 'M. Chraibi',      amount: '200', date: '25 Avr 2026', status: 'Payée',    badge: 'badge-green'  },
    { id: 4, patient: 'Fatima Benali',   amount: '750', date: '20 Avr 2026', status: 'En retard', badge: 'badge-red'    },
    { id: 5, patient: 'Omar El Fassi',   amount: '300', date: '15 Avr 2026', status: 'Payée',    badge: 'badge-green'  },
  ];
}
