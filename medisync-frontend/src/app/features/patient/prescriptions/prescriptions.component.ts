import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-prescriptions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page page-enter">
      <h1 class="display" style="margin-bottom:8px;">Ordonnances</h1>
      <p class="text-muted" style="margin-bottom:32px;">Toutes vos ordonnances actives et archivées</p>
      @for (p of prescriptions; track p.id) {
        <div class="card presc-row">
          <span style="font-size:1.4rem;">💊</span>
          <div style="flex:1;">
            <div style="font-weight:600;">{{ p.name }}</div>
            <div class="text-muted" style="font-size:0.8rem;">{{ p.doctor }} · {{ p.dosage }}</div>
          </div>
          <span class="mono text-muted" style="font-size:0.78rem;">{{ p.date }}</span>
          <span [class]="'badge ' + (p.active ? 'badge-green' : 'badge-muted')">{{ p.active ? 'Active' : 'Archivée' }}</span>
          <button class="btn-ghost" style="padding:6px 14px;font-size:0.8rem;">↓ PDF</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { padding: 32px; max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 12px; }
    .presc-row { display: flex; align-items: center; gap: 16px; padding: 16px 20px; }
  `]
})
export class PrescriptionsComponent {
  prescriptions = [
    { id: 1, name: 'Amoxicilline 500mg',  doctor: 'Dr. Karim Alaoui', date: '28 Avr 2026', dosage: '3x/jour – 7 jours',  active: true  },
    { id: 2, name: 'Metformine 850mg',    doctor: 'Dr. Sara Benali',  date: '10 Avr 2026', dosage: '2x/jour – 30 jours', active: true  },
    { id: 3, name: 'Doliprane 1000mg',    doctor: 'Dr. Omar Fassi',   date: '05 Avr 2026', dosage: 'Si douleur',         active: true  },
    { id: 4, name: 'Ibuprofène 400mg',    doctor: 'Dr. Leila Rahimi', date: '15 Fév 2026', dosage: '1x/jour – 5 jours',  active: false },
    { id: 5, name: 'Paracétamol 500mg',   doctor: 'Dr. Omar Fassi',   date: '10 Jan 2026', dosage: 'Si fièvre',          active: false },
  ];
}
