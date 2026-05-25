import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page page-enter">
      <h1 class="display" style="margin-bottom:8px;">Planning</h1>
      <p class="text-muted" style="margin-bottom:28px;">Gérez vos créneaux de consultation</p>
      <div class="week-grid">
        @for (day of weekDays; track day.key) {
          <div class="day-col card">
            <div class="day-header">
              <span class="day-name">{{ day.name }}</span>
              <span class="day-date mono text-muted">{{ day.date }}</span>
            </div>
            @for (slot of day.slots; track slot.time) {
              <div class="slot" [class.slot--booked]="slot.booked" [class.slot--free]="!slot.booked">
                <span class="mono" style="font-size:0.78rem;">{{ slot.time }}</span>
                @if (slot.booked) { <span style="font-size:0.75rem;">{{ slot.patient }}</span> }
                @if (!slot.booked) { <span class="text-muted" style="font-size:0.75rem;">Libre</span> }
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 32px; max-width: 1200px; margin: 0 auto; }
    .week-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
    .day-col { padding: 16px; display: flex; flex-direction: column; gap: 8px; }
    .day-header { margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px; }
    .day-name { font-weight: 600; font-size: 0.88rem; display: block; }
    .day-date { font-size: 0.72rem; }
    .slot { padding: 8px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; gap: 2px; transition: all 0.2s; cursor: pointer; }
    .slot--booked { border-color: rgba(0,212,255,0.2); background: rgba(0,212,255,0.06); }
    .slot--free:hover { border-color: rgba(0,245,160,0.3); background: rgba(0,245,160,0.04); }
    @media (max-width: 899px) { .week-grid { grid-template-columns: repeat(3,1fr); } }
    @media (max-width: 599px) { .week-grid { grid-template-columns: 1fr 1fr; } }
  `]
})
export class PlanningComponent {
  weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'].map((name, i) => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) + i;
    d.setDate(diff);
    return {
      key: name,
      name,
      date: d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      slots: [
        { time: '08:30', booked: i < 2, patient: 'Y. Jabouri' },
        { time: '09:00', booked: i === 0, patient: 'S. El Amrani' },
        { time: '09:30', booked: i === 1 || i === 3, patient: 'M. Chraibi' },
        { time: '10:00', booked: i === 2, patient: 'F. Benali' },
        { time: '14:00', booked: i < 3, patient: 'O. Fassi' },
        { time: '14:30', booked: i === 4, patient: 'L. Rahimi' },
        { time: '15:00', booked: false, patient: '' },
      ]
    };
  });
}
