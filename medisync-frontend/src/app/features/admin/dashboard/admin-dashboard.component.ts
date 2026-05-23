import { Component, OnInit, signal, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, TopbarComponent, LucideAngularModule],
  template: `
    <app-sidebar />
    <app-topbar />

    <main class="page-wrapper">
      <div class="page-content">

        <!-- Header with ECG -->
        <div class="admin-header glass-card animate-slide-down">
          <div class="header-text">
            <h2 class="text-gradient" style="font-family:'Fraunces',Georgia,serif;font-size:24px;">Tableau de bord analytique</h2>
            <p style="color:#7A8A82;font-size:13px;margin-top:4px;">Vue en temps réel des performances de MediSync</p>
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
            <button class="btn-secondary" style="font-size:12px;padding:7px 14px;display:inline-flex;align-items:center;gap:5px;" (click)="exportCsv()"><lucide-icon name="download" [size]="13" /> CSV</button>
            <button class="btn-secondary" style="font-size:12px;padding:7px 14px;display:inline-flex;align-items:center;gap:5px;" (click)="exportChartsPdf()"><lucide-icon name="download" [size]="13" /> Exporter PDF</button>
            <div class="live-badge"><span class="pulse-dot"></span>En direct</div>
          </div>
          <div class="ecg-bar" style="position:absolute;bottom:0;left:0;right:0;border-radius:0 0 16px 16px;"></div>
        </div>

        <!-- KPI counters -->
        <div class="grid-4 stagger" style="margin-top:24px;">
          <div class="stat-card kpi-card">
            <div class="kpi-icon" style="background:rgba(42,74,56,0.1);color:#2A4A38;"><lucide-icon name="users" [size]="22" /></div>
            <div>
              <p class="stat-label">Total patients</p>
              <p class="stat-value counter" style="color:#2A4A38;">{{ animatedStats().totalPatients }}</p>
            </div>
          </div>
          <div class="stat-card kpi-card">
            <div class="kpi-icon" style="background:rgba(61,107,79,0.08);color:#3D6B4F;"><lucide-icon name="stethoscope" [size]="22" /></div>
            <div>
              <p class="stat-label">Médecins</p>
              <p class="stat-value counter" style="color:#3D6B4F;">{{ animatedStats().totalDoctors }}</p>
            </div>
          </div>
          <div class="stat-card kpi-card">
            <div class="kpi-icon" style="background:rgba(201,99,60,0.1);color:#C9633C;"><lucide-icon name="calendar" [size]="22" /></div>
            <div>
              <p class="stat-label">Ce mois</p>
              <p class="stat-value counter" style="color:#C9633C;">{{ animatedStats().monthAppointments }}</p>
            </div>
          </div>
          <div class="stat-card kpi-card">
            <div class="kpi-icon" style="background:rgba(61,107,79,0.08);color:#3D6B4F;"><lucide-icon name="euro" [size]="22" /></div>
            <div>
              <p class="stat-label">Chiffre d'affaires</p>
              <p class="stat-value counter" style="color:#3D6B4F;">{{ animatedStats().totalRevenue }} DH</p>
            </div>
          </div>
        </div>

        <div class="grid-2" style="margin-top:24px;gap:20px;">

          <!-- Appointments by status (donut + bars) -->
          <div class="glass-card" style="padding:24px;">
            <div class="section-title"><h3>Rendez-vous par statut</h3></div>
            <div style="display:flex;align-items:center;gap:20px;margin-bottom:16px;">
              <svg width="110" height="110" viewBox="0 0 110 110" style="flex-shrink:0;">
                <circle cx="55" cy="55" r="40" fill="none" stroke="rgba(239,234,224,0.95)" stroke-width="16"/>
                @for (arc of donutArcs(); track arc.status) {
                  <circle cx="55" cy="55" r="40" fill="none"
                    [attr.stroke]="arc.color" stroke-width="16" stroke-linecap="butt"
                    [attr.stroke-dasharray]="arc.dash + ' ' + arc.gap"
                    [attr.stroke-dashoffset]="arc.offset"
                    style="transform:rotate(-90deg);transform-origin:55px 55px;transition:all 1s ease;"/>
                }
                <text x="55" y="50" text-anchor="middle" fill="#1B2520" font-size="14" font-weight="700" font-family="'Clash Display',sans-serif">{{ totalAppts() }}</text>
                <text x="55" y="64" text-anchor="middle" fill="#7A8A82" font-size="9">total</text>
              </svg>
              <div class="status-breakdown" style="flex:1;">
                @for (s of statusBreakdown(); track s.status) {
                  <div class="status-row">
                    <div class="status-info">
                      <span class="status-dot" [style.background]="s.color"></span>
                      <span class="status-name">{{ translateStatus(s.status) }}</span>
                    </div>
                    <div class="status-bar-wrap">
                      <div class="status-bar" [style.width]="s.pct + '%'" [style.background]="s.color"></div>
                    </div>
                    <span class="status-count">{{ s.count }}</span>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Quick admin actions -->
          <div class="glass-card" style="padding:24px;">
            <div class="section-title"><h3>Administration</h3></div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
              @for (a of adminActions; track a.label) {
                <a [routerLink]="a.path" class="admin-action-card">
                  <lucide-icon [name]="a.icon" [size]="24" />
                  <span style="font-size:12px;font-weight:600;margin-top:4px;text-align:center;">{{ a.label }}</span>
                  @if (a.badge) {
                    <span class="action-badge">{{ a.badge }}</span>
                  }
                </a>
              }
            </div>
          </div>
        </div>

        <!-- Charts row -->
        <div class="grid-2" style="margin-top:20px;gap:20px;">

          <!-- Bar chart: consultations per month -->
          <div class="glass-card" style="padding:24px;">
            <div class="section-title"><h3>Consultations / mois</h3></div>
            <svg viewBox="0 0 396 165" width="100%" height="160" preserveAspectRatio="none">
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#2A4A38" stop-opacity="0.85"/>
                  <stop offset="100%" stop-color="#3D6B4F" stop-opacity="0.5"/>
                </linearGradient>
              </defs>
              @for (bar of barChartData(); track bar.month) {
                <rect [attr.x]="bar.x" [attr.y]="bar.y" width="26" [attr.height]="bar.h"
                      fill="url(#barGrad)" rx="4" style="transition:all .9s ease;">
                  <title>{{ bar.month }} : {{ bar.consultations }}</title>
                </rect>
                <text [attr.x]="bar.x + 13" y="158" text-anchor="middle" fill="#7A8A82" font-size="9" font-family="'JetBrains Mono',monospace">{{ bar.month }}</text>
              }
            </svg>
          </div>

          <!-- Line chart: revenue trend -->
          <div class="glass-card" style="padding:24px;">
            <div class="section-title"><h3>Chiffre d'affaires — tendance</h3></div>
            <svg viewBox="0 0 380 115" width="100%" height="115" preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#C9633C" stop-opacity="0.18"/>
                  <stop offset="100%" stop-color="#C9633C" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <!-- Gridlines -->
              @for (g of [0,1,2,3]; track g) {
                <line x1="0" [attr.x2]="380" [attr.y1]="g*24" [attr.y2]="g*24"
                      stroke="rgba(42,74,56,0.06)" stroke-width="1"/>
              }
              <path [attr.d]="areaPathD()" fill="url(#areaGrad)"/>
              <path [attr.d]="linePathD()" fill="none" stroke="#C9633C" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round"/>
              @for (pt of lineChartPoints(); track pt.month) {
                <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="3.5" fill="#C9633C" stroke="#FAF7F1" stroke-width="1.5">
                  <title>{{ pt.month }} : {{ pt.revenue }} DH</title>
                </circle>
                <text [attr.x]="pt.x" y="112" text-anchor="middle" fill="#7A8A82" font-size="9" font-family="'JetBrains Mono',monospace">{{ pt.month }}</text>
              }
            </svg>
          </div>
        </div>

        <!-- No-show & stats row -->
        <div class="grid-4 stagger" style="margin-top:20px;">
          <div class="stat-card" style="border-color:rgba(255,77,109,0.2);">
            <p class="stat-label">Taux d'absences</p>
            <p class="stat-value" style="color:#C24040;">{{ stats().noShowRate }}%</p>
          </div>
          <div class="stat-card" style="border-color:rgba(255,184,0,0.2);">
            <p class="stat-label">Factures en attente</p>
            <p class="stat-value" style="color:#B8792A;">{{ stats().pendingInvoices }}</p>
          </div>
          <div class="stat-card" style="border-color:rgba(42,74,56,0.15);">
            <p class="stat-label">Rendez-vous (total)</p>
            <p class="stat-value" style="color:#2A4A38;">{{ stats().totalAppointments }}</p>
          </div>
          <div class="stat-card" style="border-color:rgba(61,107,79,0.2);">
            <p class="stat-label">Personnel actif</p>
            <p class="stat-value" style="color:#3D6B4F;">{{ stats().totalDoctors }}</p>
          </div>
        </div>

        <!-- Room occupancy -->
        <div class="glass-card" style="padding:24px;margin-top:20px;">
          <div class="section-title" style="margin-bottom:16px;">
            <h3>Occupation des salles — 7 derniers jours</h3>
            <span style="font-size:11px;color:#7A8A82;">{{ roomOccupancy().length }} salle(s) active(s)</span>
          </div>
          @if (roomOccupancy().length === 0) {
            <p style="color:#7A8A82;font-size:13px;text-align:center;padding:20px 0;">Aucune salle configurée</p>
          }
          @for (r of roomOccupancy(); track r.id) {
            <div style="margin-bottom:14px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
                <span style="font-size:13px;font-weight:600;color:#1B2520;">{{ r.name }}</span>
                <div style="display:flex;align-items:center;gap:10px;">
                  <span style="font-size:11px;color:#7A8A82;">{{ r.usedSlots }} / {{ r.totalSlots }} créneaux</span>
                  <span style="font-size:13px;font-weight:700;"
                        [style.color]="r.occupancyRate >= 80 ? '#C24040' : r.occupancyRate >= 50 ? '#B8792A' : '#3D6B4F'">
                    {{ r.occupancyRate }}%
                  </span>
                </div>
              </div>
              <div style="height:8px;background:rgba(239,234,224,0.95);border-radius:10px;overflow:hidden;">
                <div style="height:100%;border-radius:10px;transition:width 1s ease;"
                     [style.width]="r.occupancyRate + '%'"
                     [style.background]="r.occupancyRate >= 80 ? '#C24040' : r.occupancyRate >= 50 ? '#B8792A' : '#3D6B4F'">
                </div>
              </div>
              @if (r.equipment?.length > 0) {
                <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:5px;">
                  @for (eq of r.equipment.slice(0,3); track eq) {
                    <span style="background:rgba(42,74,56,0.06);color:#3A5248;border-radius:999px;padding:1px 8px;font-size:10px;font-weight:600;">{{ eq }}</span>
                  }
                </div>
              }
            </div>
          }
        </div>
      </div>
    </main>
  `,
  styles: [`
    .admin-header { padding:24px;position:relative;overflow:hidden;display:flex;justify-content:space-between;align-items:center; }
    .live-badge { display:flex;align-items:center;gap:8px;background:rgba(61,107,79,0.08);border:1px solid rgba(61,107,79,0.3);border-radius:999px;padding:6px 14px;font-size:12px;font-weight:700;color:#3D6B4F; }
    .pulse-dot { width:8px;height:8px;border-radius:50%;background:#3D6B4F;animation:pulse-dot 1.5s ease-in-out infinite; }
    @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.8)} }

    .kpi-card { display:flex;align-items:center;gap:16px; }
    .kpi-icon { width:52px;height:52px;border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0; }

    .status-breakdown { display:flex;flex-direction:column;gap:12px; }
    .status-row { display:flex;align-items:center;gap:12px; }
    .status-info { display:flex;align-items:center;gap:8px;width:110px;flex-shrink:0; }
    .status-dot { width:8px;height:8px;border-radius:50%;flex-shrink:0; }
    .status-name { font-size:12px;font-weight:600;color:#3A5248;text-transform:capitalize; }
    .status-bar-wrap { flex:1;height:6px;background:rgba(239,234,224,0.95);border-radius:10px;overflow:hidden; }
    .status-bar { height:100%;border-radius:10px;transition:width 1s cubic-bezier(.34,1.56,.64,1); }
    .status-count { font-size:12px;font-weight:700;color:#1B2520;width:30px;text-align:right;flex-shrink:0; }

    .admin-action-card { display:flex;flex-direction:column;align-items:center;padding:16px 8px;background:rgba(42,74,56,0.05);border:1px solid rgba(42,74,56,0.1);border-radius:12px;text-decoration:none;color:#3A5248;transition:all .2s;position:relative; &:hover{background:rgba(42,74,56,0.06);border-color:rgba(42,74,56,0.3);color:#1B2520;transform:translateY(-2px);} }
    .action-badge { position:absolute;top:8px;right:8px;background:#C24040;color:white;font-size:10px;font-weight:700;width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center; }
    .section-title { display:flex;justify-content:space-between;align-items:center;margin-bottom:14px; h3{font-size:15px;font-weight:600;} }

    .counter { font-variant-numeric:tabular-nums;transition:all .5s; }
    .stat-label { font-size:11px;font-weight:700;color:#7A8A82;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px; }
    .stat-value { font-size:30px;font-weight:700;font-family:'Fraunces',Georgia,serif;line-height:1; }
  `],
})
export class AdminDashboardComponent implements OnInit {
  private _stats = signal<any>({
    totalPatients: 0, totalDoctors: 0, totalAppointments: 0,
    monthAppointments: 0, pendingInvoices: 0, totalRevenue: 0,
    noShowRate: 0, appointmentsByStatus: [],
  });
  private _animated    = signal<any>({ totalPatients: 0, totalDoctors: 0, monthAppointments: 0, totalRevenue: 0 });
  private _roomOccupancy = signal<any[]>([]);
  readonly roomOccupancy = this._roomOccupancy.asReadonly();

  private readonly MONTHS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
  private _monthlyStats = signal<any[]>(this.MONTHS.map((month, i) => ({
    month,
    consultations: [42,38,55,61,47,70,63,45,78,82,68,91][i],
    revenue:       [2100,1900,2750,3050,2350,3500,3150,2250,3900,4100,3400,4550][i],
  })));

  readonly stats         = this._stats.asReadonly();
  readonly animatedStats = this._animated.asReadonly();

  readonly statusBreakdown = () => {
    const statuses = this._stats().appointmentsByStatus || [];
    const total = statuses.reduce((s: number, x: any) => s + x._count, 0) || 1;
    const colors: Record<string, string> = {
      CONFIRMED: '#2A4A38', COMPLETED: '#3D6B4F', PENDING: '#B8792A',
      CANCELLED: '#C24040', NO_SHOW: '#7A8A82',
    };
    return statuses.map((x: any) => ({
      status: x.status.toLowerCase(),
      count: x._count,
      pct: Math.round((x._count / total) * 100),
      color: colors[x.status] || '#7A8A82',
    }));
  };

  adminActions: { icon: string; label: string; path: string; badge?: string }[] = [
    { icon: 'users',     label: 'Gestion du personnel', path: '/admin/staff' },
    { icon: 'chart-bar', label: 'Rapport finance',       path: '/admin/finance' },
    { icon: 'search',    label: "Journal d'audit",       path: '/admin/audit' },
    { icon: 'settings',  label: 'Paramètres',            path: '/admin/settings' },
  ];

  readonly totalAppts = () => {
    return (this._stats().appointmentsByStatus || []).reduce((s: number, x: any) => s + x._count, 0);
  };

  translateStatus(s: string): string {
    const map: Record<string, string> = {
      confirmed: 'Confirmé', completed: 'Terminé', pending: 'En attente',
      cancelled: 'Annulé', no_show: 'Absent',
    };
    return map[s] || s;
  }

  readonly donutArcs = () => {
    const data = this.statusBreakdown();
    if (!data.length) return [];
    const circ = 251.3;
    let cumulative = 0;
    return data.map((x: any) => {
      const dash = (x.pct / 100) * circ;
      const offset = circ - cumulative * circ / 100;
      cumulative += x.pct;
      return { ...x, dash, gap: circ - dash, offset };
    });
  };

  readonly barChartData = () => {
    const data = this._monthlyStats();
    const max = Math.max(...data.map(d => d.consultations), 1);
    return data.map((d, i) => ({
      ...d,
      x: i * 33 + 4,
      h: Math.round((d.consultations / max) * 120),
      y: 135 - Math.round((d.consultations / max) * 120),
    }));
  };

  readonly lineChartPoints = () => {
    const data = this._monthlyStats();
    const max = Math.max(...data.map(d => d.revenue), 1);
    const n = data.length - 1 || 1;
    return data.map((d, i) => ({
      ...d,
      x: Math.round(i * (380 / n)),
      y: Math.round(95 - (d.revenue / max) * 80),
    }));
  };

  readonly linePathD = () => {
    const pts = this.lineChartPoints();
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  };

  readonly areaPathD = () => {
    const pts = this.lineChartPoints();
    if (!pts.length) return '';
    const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
    return `${line} L${pts[pts.length - 1].x},95 L${pts[0].x},95 Z`;
  };

  exportCsv(): void {
    const bars = this.barChartData();
    const pts  = this.lineChartPoints();
    const rows = bars.map((b, i) => [b.month, b.consultations, pts[i]?.revenue ?? 0]);
    const csv  = ['Mois,Consultations,Chiffre d\'affaires (DH)', ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `medisync-stats-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  exportChartsPdf(): void {
    const bars = this.barChartData();
    const pts  = this.lineChartPoints();
    const s    = this._stats();

    const barSvg = `<svg viewBox="0 0 396 165" width="100%" height="160">
      <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2A4A38" stop-opacity="0.85"/>
        <stop offset="100%" stop-color="#3D6B4F" stop-opacity="0.5"/>
      </linearGradient></defs>
      ${bars.map(b => `<rect x="${b.x}" y="${b.y}" width="26" height="${b.h}" fill="url(#bg)" rx="4"/>
        <text x="${b.x + 13}" y="158" text-anchor="middle" fill="#7A8A82" font-size="9">${b.month}</text>`).join('')}
    </svg>`;

    const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
    const areaPath = `${linePath} L${pts[pts.length - 1].x},95 L${pts[0].x},95 Z`;
    const lineSvg = `<svg viewBox="0 0 380 115" width="100%" height="115">
      <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#C9633C" stop-opacity="0.18"/>
        <stop offset="100%" stop-color="#C9633C" stop-opacity="0"/>
      </linearGradient></defs>
      ${[0,1,2,3].map(g => `<line x1="0" x2="380" y1="${g*24}" y2="${g*24}" stroke="rgba(42,74,56,0.06)" stroke-width="1"/>`).join('')}
      <path d="${areaPath}" fill="url(#ag)"/>
      <path d="${linePath}" fill="none" stroke="#C9633C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      ${pts.map(p => `<circle cx="${p.x}" cy="${p.y}" r="3.5" fill="#C9633C" stroke="white" stroke-width="1.5"/>
        <text x="${p.x}" y="112" text-anchor="middle" fill="#7A8A82" font-size="9">${p.month}</text>`).join('')}
    </svg>`;

    const w = window.open('', '_blank')!;
    w.document.write(`<!DOCTYPE html><html><head><title>MediSync — Rapport analytique</title>
    <style>
      body{font-family:'Segoe UI',sans-serif;padding:32px;color:#1B2520;background:#fff;}
      h1{color:#2A4A38;font-size:22px;margin-bottom:4px;}
      .sub{color:#7A8A82;font-size:12px;margin-bottom:24px;}
      .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px;}
      .kpi{border:1px solid #e0e0e0;border-radius:8px;padding:14px;}
      .kpi-label{font-size:11px;color:#7A8A82;text-transform:uppercase;letter-spacing:.06em;}
      .kpi-value{font-size:26px;font-weight:700;color:#2A4A38;margin-top:4px;}
      .chart-wrap{border:1px solid #e0e0e0;border-radius:8px;padding:16px;margin-bottom:16px;}
      .chart-title{font-size:13px;font-weight:700;color:#3A5248;margin-bottom:10px;}
      @media print{@page{margin:20mm;}}
    </style></head><body>
    <h1>MediSync — Rapport analytique</h1>
    <p class="sub">Exporté le ${new Date().toLocaleDateString('fr-FR', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
    <div class="kpis">
      <div class="kpi"><div class="kpi-label">Patients</div><div class="kpi-value">${s.totalPatients}</div></div>
      <div class="kpi"><div class="kpi-label">Médecins</div><div class="kpi-value">${s.totalDoctors}</div></div>
      <div class="kpi"><div class="kpi-label">RDV ce mois</div><div class="kpi-value">${s.monthAppointments}</div></div>
      <div class="kpi"><div class="kpi-label">Chiffre d'affaires</div><div class="kpi-value">${s.totalRevenue} DH</div></div>
    </div>
    <div class="chart-wrap"><div class="chart-title">Consultations par mois</div>${barSvg}</div>
    <div class="chart-wrap"><div class="chart-title">Chiffre d'affaires — tendance</div>${lineSvg}</div>
    <script>window.onload=()=>window.print();<\/script>
    </body></html>`);
    w.document.close();
  }

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<any>('/admin/stats').subscribe({
      next: (res) => {
        this._stats.set(res.data);
        this.animateCounters(res.data);
      },
    });
    this.api.get<any>('/admin/stats/monthly').subscribe({
      next: (res) => {
        if (res.data?.length) this._monthlyStats.set(res.data);
      },
    });
    this.api.get<any>('/admin/rooms/occupancy').subscribe({
      next: (res) => { if (res.data) this._roomOccupancy.set(res.data); },
    });
  }

  private animateCounters(data: any): void {
    const targets = {
      totalPatients: data.totalPatients || 0,
      totalDoctors: data.totalDoctors || 0,
      monthAppointments: data.monthAppointments || 0,
      totalRevenue: Math.round(data.totalRevenue || 0),
    };

    const duration = 1200;
    const steps = 40;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const ease = 1 - Math.pow(1 - progress, 3);

      this._animated.set({
        totalPatients:     Math.round(targets.totalPatients * ease),
        totalDoctors:      Math.round(targets.totalDoctors * ease),
        monthAppointments: Math.round(targets.monthAppointments * ease),
        totalRevenue:      Math.round(targets.totalRevenue * ease),
      });

      if (step >= steps) clearInterval(timer);
    }, duration / steps);
  }
}
