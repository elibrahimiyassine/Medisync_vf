import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { LucideAngularModule } from 'lucide-angular';
import ExcelJS from 'exceljs';

@Component({
  selector: 'app-admin-finance',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, TopbarComponent, DatePipe, DecimalPipe, LucideAngularModule],
  template: `
    <app-sidebar />
    <app-topbar />
    <main class="page-wrapper">
      <div class="page-content">

        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
          <div>
            <h2 style="font-family:'Fraunces',Georgia,serif;">Rapport financier</h2>
            <p style="color:#7A8A82;font-size:13px;margin-top:4px;">Revenus et aperçu de la facturation</p>
          </div>
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
            <!-- Period tabs -->
            <div class="period-tabs">
              <button class="period-btn" [class.active]="period() === 'day'"   (click)="setPeriod('day')">Jour</button>
              <button class="period-btn" [class.active]="period() === 'week'"  (click)="setPeriod('week')">Semaine</button>
              <button class="period-btn" [class.active]="period() === 'month'" (click)="setPeriod('month')">Mois</button>
              <button class="period-btn" [class.active]="period() === 'year'"  (click)="setPeriod('year')">Année</button>
            </div>
            @if (period() === 'day') {
              <input type="date" class="glass-input" style="width:160px;" [(ngModel)]="selectedDay" (change)="load()" />
            }
            @if (period() === 'week') {
              <input type="date" class="glass-input" style="width:160px;" [(ngModel)]="selectedWeek" (change)="load()" />
            }
            @if (period() === 'month') {
              <input type="month" class="glass-input" style="width:160px;" [(ngModel)]="selectedMonth" (change)="load()" />
            }
            @if (period() === 'year') {
              <select class="glass-input" style="width:110px;" [(ngModel)]="selectedYear" (change)="load()">
                @for (y of years; track y) {
                  <option [value]="y">{{ y }}</option>
                }
              </select>
            }
            <button class="btn-secondary" style="display:inline-flex;align-items:center;gap:5px;" (click)="exportXlsx()"><lucide-icon name="download" [size]="13" /> Excel</button>
          </div>
        </div>

        <!-- KPI row -->
        <div class="grid-4 stagger" style="margin-bottom:24px;">
          <div class="stat-card">
            <p class="stat-label">Chiffre d'affaires</p>
            <p class="stat-value" style="color:#3D6B4F;">{{ report().totalRevenue | number:'1.0-0' }} DH</p>
          </div>
          <div class="stat-card">
            <p class="stat-label">Factures payées</p>
            <p class="stat-value" style="color:#2A4A38;">{{ report().paidCount }}</p>
          </div>
          <div class="stat-card">
            <p class="stat-label">Montant en attente</p>
            <p class="stat-value" style="color:#B8792A;">{{ report().pendingRevenue | number:'1.0-0' }} DH</p>
          </div>
          <div class="stat-card">
            <p class="stat-label">Moy. par facture</p>
            <p class="stat-value" style="color:#C9633C;">{{ report().avgAmount | number:'1.0-0' }} DH</p>
          </div>
        </div>

        <!-- Revenue by doctor -->
        @if (report().byDoctor?.length) {
          <div class="glass-card" style="padding:24px;margin-bottom:24px;">
            <div class="section-title"><h3>Revenus par médecin</h3></div>
            <div style="display:flex;flex-direction:column;gap:12px;">
              @for (d of report().byDoctor; track d.doctorId) {
                <div class="doctor-revenue-row">
                  <div style="width:180px;font-size:13px;font-weight:600;color:#3A5248;flex-shrink:0;">
                    Dr. {{ d.doctorName }}
                  </div>
                  <div style="flex:1;height:8px;background:rgba(239,234,224,0.95);border-radius:10px;overflow:hidden;">
                    <div class="rev-bar" [style.width]="(d.revenue / maxDoctorRevenue() * 100) + '%'"></div>
                  </div>
                  <div style="width:80px;text-align:right;font-family:'JetBrains Mono',monospace;font-size:12px;color:#3D6B4F;font-weight:700;">
                    {{ d.revenue | number:'1.0-0' }} DH
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Invoices table -->
        <div class="glass-card" style="padding:0;overflow:hidden;">
          <div style="padding:18px 24px;border-bottom:1px solid rgba(42,74,56,0.06);">
            <h3 style="font-size:15px;font-weight:600;">Toutes les factures</h3>
          </div>
          <table class="ms-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Médecin</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>PDF</th>
              </tr>
            </thead>
            <tbody>
              @for (inv of invoices(); track inv.id) {
                <tr>
                  <td><strong style="color:#1B2520;">{{ inv.patient?.firstName }} {{ inv.patient?.lastName }}</strong></td>
                  <td style="color:#3A5248;">Dr. {{ inv.appointment?.doctor?.lastName }}</td>
                  <td style="color:#7A8A82;font-size:12px;">{{ inv.issuedAt | date:'d MMM yyyy' }}</td>
                  <td style="font-family:'JetBrains Mono',monospace;color:#2A4A38;font-weight:700;">{{ inv.amount | number:'1.2-2' }} DH</td>
                  <td><span class="badge {{ inv.status.toLowerCase() }}">{{ translateStatus(inv.status) }}</span></td>
                  <td>
                    <button class="btn-secondary" style="font-size:11px;padding:4px 10px;display:inline-flex;align-items:center;gap:4px;" (click)="printInvoice(inv)"><lucide-icon name="download" [size]="12" /> PDF</button>
                  </td>
                </tr>
              }
              @empty {
                <tr><td colspan="6" style="text-align:center;color:#7A8A82;padding:40px;">Aucune facture pour cette période</td></tr>
              }
            </tbody>
          </table>
        </div>

      </div>
    </main>
  `,
  styles: [`
    .doctor-revenue-row { display:flex;align-items:center;gap:14px; }
    .rev-bar { height:100%;background:linear-gradient(90deg,#3D6B4F,#2A4A38);border-radius:10px;transition:width 1s cubic-bezier(.34,1.56,.64,1); }
    .period-tabs { display:flex;border:1px solid rgba(42,74,56,0.15);border-radius:10px;overflow:hidden; }
    .period-btn { padding:7px 16px;background:transparent;border:none;font-size:13px;font-weight:600;color:#7A8A82;cursor:pointer;transition:all .2s;font-family:'Geist','Inter',sans-serif; &.active{background:#2A4A38;color:#F2EDE4;} &:hover:not(.active){background:rgba(42,74,56,0.06);color:#3A5248;} }
    select.glass-input option { background:#FAF7F1;color:#1B2520; }
  `],
})
export class AdminFinanceComponent implements OnInit {
  private _report   = signal<any>({ totalRevenue: 0, paidCount: 0, pendingRevenue: 0, avgAmount: 0, byDoctor: [] });
  private _invoices = signal<any[]>([]);

  readonly report   = this._report.asReadonly();
  readonly invoices = this._invoices.asReadonly();

  private _period = signal<'day'|'week'|'month'|'year'>('month');
  readonly period = this._period.asReadonly();

  selectedMonth = this.currentMonth();
  selectedDay   = new Date().toISOString().slice(0, 10);
  selectedWeek  = new Date().toISOString().slice(0, 10);
  selectedYear  = new Date().getFullYear();
  readonly years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

  readonly maxDoctorRevenue = computed(() => {
    const doctors = this._report().byDoctor || [];
    return doctors.reduce((m: number, d: any) => Math.max(m, d.revenue), 1);
  });

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.load(); }

  setPeriod(p: 'day'|'week'|'month'|'year'): void {
    this._period.set(p);
    this.load();
  }

  load(): void {
    const p = this._period();
    const params =
      p === 'day'   ? { date:  this.selectedDay } :
      p === 'week'  ? { week:  this.selectedWeek } :
      p === 'year'  ? { year:  String(this.selectedYear) } :
                      { month: this.selectedMonth };
    this.api.get<any>('/admin/finance', params).subscribe(res => {
      this._report.set(res.data?.summary || {});
      this._invoices.set(res.data?.invoices || []);
    });
  }

  private currentMonth(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  translateStatus(s: string): string {
    const map: Record<string, string> = { PAID: 'Payée', PENDING: 'En attente', CANCELLED: 'Annulée' };
    return map[s] || s;
  }

  printInvoice(inv: any): void {
    const w = window.open('', '_blank')!;
    w.document.write(`<html><head><title>Facture</title><style>body{font-family:sans-serif;padding:40px;color:#111}h1{color:#0066cc}table{width:100%;border-collapse:collapse;margin-top:16px}td,th{padding:8px 12px;border:1px solid #ddd;text-align:left}th{background:#f5f5f5}</style></head><body>
      <h1>MediSync — Facture</h1>
      <p><strong>Patient :</strong> ${inv.patient?.firstName} ${inv.patient?.lastName}</p>
      <p><strong>Médecin :</strong> Dr. ${inv.appointment?.doctor?.lastName || '—'}</p>
      <p><strong>Date :</strong> ${new Date(inv.issuedAt).toLocaleDateString('fr-MA')}</p>
      <p><strong>Montant :</strong> ${inv.amount?.toFixed(2)} DH</p>
      <p><strong>Statut :</strong> ${this.translateStatus(inv.status)}</p>
    </body></html>`);
    w.document.close();
    w.print();
  }

  async exportXlsx(): Promise<void> {
    const wb = new ExcelJS.Workbook();
    wb.creator  = 'MediSync';
    wb.created  = new Date();
    const ws = wb.addWorksheet('Factures');

    ws.columns = [
      { header: 'Patient',  key: 'patient',  width: 28 },
      { header: 'Médecin',  key: 'doctor',   width: 28 },
      { header: 'Date',     key: 'date',     width: 16 },
      { header: 'Montant (DH)', key: 'amount', width: 16 },
      { header: 'Statut',   key: 'status',   width: 14 },
    ];

    const headerRow = ws.getRow(1);
    headerRow.eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2A4A38' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });
    headerRow.height = 20;

    this._invoices().forEach(inv => {
      const row = ws.addRow({
        patient: `${inv.patient?.firstName ?? ''} ${inv.patient?.lastName ?? ''}`.trim(),
        doctor:  `Dr. ${inv.appointment?.doctor?.lastName || '—'}`,
        date:    new Date(inv.issuedAt).toLocaleDateString('fr-FR'),
        amount:  inv.amount ?? 0,
        status:  this.translateStatus(inv.status),
      });
      row.getCell('amount').numFmt = '#,##0.00';
      row.getCell('status').fill = {
        type: 'pattern', pattern: 'solid',
        fgColor: { argb: inv.status === 'PAID' ? 'FFD4EDDA' : inv.status === 'OVERDUE' ? 'FFF8D7DA' : 'FFFFF3CD' },
      };
    });

    ws.eachRow((row, i) => {
      if (i > 1) row.eachCell(cell => { cell.border = { bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } } }; });
    });

    const buf = await wb.xlsx.writeBuffer();
    const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `factures-${this.selectedMonth}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
