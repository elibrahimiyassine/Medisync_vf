import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page page-enter">
      <div class="greeting">
        <div>
          <h1 class="display">Bonjour, <span class="text-cyan">Dr. Alaoui</span> 👋</h1>
          <p class="text-muted">Vous avez <strong style="color:#E8F4FD;">8 consultations</strong> aujourd'hui</p>
        </div>
        <div class="date-chip mono text-muted">{{ today }}</div>
      </div>

      <div class="kpi-grid">
        @for (k of kpis; track k.label) {
          <div class="card kpi">
            <div class="kpi-val display" [style.color]="k.color">{{ k.value }}</div>
            <div class="text-muted" style="font-size:0.84rem;">{{ k.label }}</div>
          </div>
        }
      </div>

      <div class="card">
        <h3 class="display" style="margin-bottom:16px;">Planning du jour</h3>
        @for (appt of todayAppts; track appt.id) {
          <div class="appt-row" [style.border-left-color]="appt.color">
            <span class="mono text-cyan" style="font-size:0.85rem; width:48px;">{{ appt.time }}</span>
            <div style="flex:1;">
              <div style="font-weight:600; font-size:0.9rem;">{{ appt.patient }}</div>
              <div class="text-muted" style="font-size:0.78rem;">{{ appt.motif }}</div>
            </div>
            <span [class]="'badge ' + appt.badge">{{ appt.status }}</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 32px; max-width: 1100px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; }
    .greeting { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; padding: 28px; background: #111D35; border-radius: 24px; border: 1px solid rgba(255,255,255,0.06); }
    .greeting h1 { font-size: 1.7rem; font-weight: 700; margin-bottom: 4px; }
    .date-chip { font-size: 0.8rem; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }
    .kpi { text-align: center; }
    .kpi-val { font-size: 2.2rem; font-weight: 700; margin-bottom: 4px; }
    .appt-row { display: flex; align-items: center; gap: 16px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.04); border-left: 3px solid transparent; padding-left: 12px; transition: padding-left 0.2s; }
    .appt-row:last-child { border-bottom: none; }
    .appt-row:hover { padding-left: 18px; }
  `]
})
export class DoctorDashboardComponent {
  today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  kpis = [
    { label: 'Consultations aujourd\'hui', value: '8',  color: '#00D4FF' },
    { label: 'Patients cette semaine',     value: '42', color: '#7B61FF' },
    { label: 'Ordonnances émises',         value: '17', color: '#00F5A0' },
    { label: 'Taux de présence',           value: '94%', color: '#FFB800' },
  ];

  todayAppts = [
    { id: 1, time: '08:30', patient: 'Yass Jabouri',    motif: 'Bilan cardiaque annuel',  status: 'Confirmé',  badge: 'badge-green',  color: '#00F5A0' },
    { id: 2, time: '09:15', patient: 'Sara El Amrani',  motif: 'Suivi traitement',        status: 'En attente', badge: 'badge-yellow', color: '#FFB800' },
    { id: 3, time: '10:00', patient: 'Mohamed Chraibi', motif: 'Consultation urgente',    status: 'Confirmé',  badge: 'badge-green',  color: '#00F5A0' },
    { id: 4, time: '11:30', patient: 'Fatima Benali',   motif: 'Contrôle post-opératoire',status: 'Confirmé',  badge: 'badge-green',  color: '#00F5A0' },
    { id: 5, time: '14:00', patient: 'Omar Fassi',      motif: 'Résultats analyses',      status: 'Annulé',    badge: 'badge-red',    color: '#FF4D6D' },
    { id: 6, time: '15:30', patient: 'Leila Rahimi',    motif: 'Renouvellement ordonnance',status:'Confirmé',  badge: 'badge-green',  color: '#00F5A0' },
  ];
}
