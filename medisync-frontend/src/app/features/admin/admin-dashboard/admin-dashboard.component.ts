import { Component, OnInit, AfterViewInit, ElementRef, QueryList, ViewChildren, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, Chart } from 'chart.js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
);

ChartJS.defaults.color       = '#5A7A9B';
ChartJS.defaults.borderColor = 'rgba(255,255,255,0.06)';

interface AuditLog {
  id: number;
  user: string;
  action: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE';
  resource: string;
  timestamp: string;
  ip: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './admin-dashboard.component.html',
  styleUrls:  ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements AfterViewInit {
  @ViewChildren('kpiCard') kpiCards!: QueryList<ElementRef>;

  displayValues = [0, 0, 0, 0];

  kpis = [
    { label: 'Consultations',   value: 1284, suffix: '',  color: '#00D4FF', trend: '+12% ce mois',  trendUp: true,  icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { label: 'Revenus (MAD)',    value: 284600, suffix: '', color: '#00F5A0', trend: '+8% vs N-1',    trendUp: true,  icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z' },
    { label: 'Nouveaux patients',value: 94,   suffix: '',  color: '#7B61FF', trend: '+24 ce mois',   trendUp: true,  icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0' },
    { label: 'Taux no-show',    value: 7,    suffix: '%', color: '#FFB800', trend: '-2% vs dernier', trendUp: false, icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  barData: ChartData<'bar'> = {
    labels: ['Dr. Alaoui', 'Dr. Benali', 'Dr. Fassi', 'Dr. Rahimi', 'Dr. Tazi'],
    datasets: [{
      label: 'Consultations',
      data: [124, 98, 87, 145, 76],
      backgroundColor: 'rgba(0,212,255,0.5)',
      borderColor: '#00D4FF',
      borderWidth: 1.5,
      borderRadius: 6,
    }]
  };

  barOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.04)' } },
      y: { grid: { color: 'rgba(255,255,255,0.04)' } }
    }
  };

  doughnutData: ChartData<'doughnut'> = {
    labels: ['Confirmé', 'En attente', 'Annulé', 'No-show'],
    datasets: [{
      data: [68, 15, 10, 7],
      backgroundColor: ['#00F5A0', '#00D4FF', '#FF4D6D', '#FFB800'],
      borderWidth: 0,
      hoverOffset: 6,
    }]
  };

  doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' as const, labels: { padding: 16, boxWidth: 12 } } },
    cutout: '70%',
  };

  lineData: ChartData<'line'> = {
    labels: ['Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai'],
    datasets: [{
      label: 'Revenus (MAD)',
      data: [18000, 21000, 19500, 24000, 22000, 26000, 28000, 23000, 25000, 27000, 30000, 28460],
      borderColor: '#00D4FF',
      borderWidth: 2,
      pointRadius: 4,
      pointBackgroundColor: '#00D4FF',
      fill: true,
      backgroundColor: (context: any) => {
        const chart = context.chart;
        const { ctx, chartArea } = chart;
        if (!chartArea) return 'transparent';
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, 'rgba(0,212,255,0.2)');
        gradient.addColorStop(1, 'rgba(0,212,255,0)');
        return gradient;
      },
      tension: 0.4,
    }]
  };

  lineOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.04)' } },
      y: { grid: { color: 'rgba(255,255,255,0.04)' } }
    }
  };

  auditLogs: AuditLog[] = [
    { id: 1, user: 'admin@demo.com',   action: 'DELETE', resource: 'Patient #4821', timestamp: '09:14:32', ip: '192.168.1.12' },
    { id: 2, user: 'doctor@demo.com',  action: 'CREATE', resource: 'Ordonnance #991', timestamp: '09:02:11', ip: '192.168.1.8' },
    { id: 3, user: 'sec@demo.com',     action: 'UPDATE', resource: 'RDV #3302',       timestamp: '08:57:44', ip: '192.168.1.20' },
    { id: 4, user: 'doctor@demo.com',  action: 'READ',   resource: 'Dossier #2201',   timestamp: '08:45:19', ip: '192.168.1.8' },
    { id: 5, user: 'admin@demo.com',   action: 'CREATE', resource: 'Staff #107',       timestamp: '08:30:02', ip: '192.168.1.12' },
    { id: 6, user: 'patient@demo.com', action: 'READ',   resource: 'Ordonnance #988', timestamp: '08:22:56', ip: '192.168.1.44' },
    { id: 7, user: 'doctor@demo.com',  action: 'UPDATE', resource: 'Dossier #2201',   timestamp: '08:10:37', ip: '192.168.1.8' },
  ];

  actionBadge(a: string) {
    return { READ: 'badge-cyan', CREATE: 'badge-green', UPDATE: 'badge-yellow', DELETE: 'badge-red' }[a] ?? 'badge-muted';
  }

  ngAfterViewInit() {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const idx = Number((entry.target as HTMLElement).dataset['idx']);
          this.animateCount(idx);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    this.kpiCards.forEach((ref, i) => {
      (ref.nativeElement as HTMLElement).dataset['idx'] = String(i);
      obs.observe(ref.nativeElement);
    });
  }

  animateCount(idx: number) {
    const target = this.kpis[idx].value;
    const steps  = 50;
    let step     = 0;
    const timer  = setInterval(() => {
      step++;
      this.displayValues[idx] = Math.round((step / steps) * target);
      if (step >= steps) { this.displayValues[idx] = target; clearInterval(timer); }
    }, 25);
  }

  formatValue(v: number, idx: number) {
    if (idx === 1) return v.toLocaleString('fr-MA');
    return v.toString();
  }
}
