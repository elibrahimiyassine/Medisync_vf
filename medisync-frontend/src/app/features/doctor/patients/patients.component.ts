import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page page-enter">
      <h1 class="display" style="margin-bottom:20px;">Mes Patients</h1>
      <input class="input-field" placeholder="Rechercher un patient…" [(ngModel)]="q" style="max-width:340px; margin-bottom:20px;"/>
      <div style="display:flex; flex-direction:column; gap:10px;">
        @for (p of filtered; track p.id) {
          <div class="card" style="display:flex; align-items:center; gap:16px; padding:16px 20px;">
            <div class="avatar" [style.background]="'linear-gradient(135deg,' + p.color + '40,#0D1526)'">
              <span [style.color]="p.color">{{ p.initials }}</span>
            </div>
            <div style="flex:1;">
              <div style="font-weight:600;">{{ p.name }}</div>
              <div class="text-muted" style="font-size:0.78rem;">{{ p.dob }} · {{ p.diagnoses }}</div>
            </div>
            <span class="mono text-muted" style="font-size:0.75rem;">Dernière visite: {{ p.lastVisit }}</span>
            <button class="btn-ghost" style="padding:6px 14px;font-size:0.8rem;">Dossier →</button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 32px; max-width: 900px; margin: 0 auto; }
    .avatar { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 700; flex-shrink: 0; }
  `]
})
export class PatientsComponent {
  q = '';
  patients = [
    { id: 1, name: 'Yass Jabouri',    initials: 'YJ', color: '#00D4FF', dob: '15 Mar 1990', diagnoses: 'Hypertension, Diabète type 2', lastVisit: '28 Avr 2026' },
    { id: 2, name: 'Sara El Amrani',  initials: 'SE', color: '#7B61FF', dob: '22 Jun 1985',  diagnoses: 'Insuffisance cardiaque', lastVisit: '15 Avr 2026' },
    { id: 3, name: 'Mohamed Chraibi', initials: 'MC', color: '#00F5A0', dob: '08 Nov 1972',  diagnoses: 'Post-chirurgie valvulaire', lastVisit: '10 Mar 2026' },
    { id: 4, name: 'Fatima Benali',   initials: 'FB', color: '#FFB800', dob: '30 Jan 1995',  diagnoses: 'Arythmie', lastVisit: '05 Jan 2026' },
    { id: 5, name: 'Omar El Fassi',   initials: 'OE', color: '#FF4D6D', dob: '12 Sep 1968',  diagnoses: 'Coronaropathie', lastVisit: '20 Jan 2026' },
  ];

  get filtered() {
    return this.patients.filter(p => p.name.toLowerCase().includes(this.q.toLowerCase()));
  }
}
