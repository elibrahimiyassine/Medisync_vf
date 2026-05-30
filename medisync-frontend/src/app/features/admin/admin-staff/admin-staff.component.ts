import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-staff',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page page-enter">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:28px;">
        <div><h1 class="display">Personnel</h1><p class="text-muted">Gestion du personnel de la clinique</p></div>
        <button class="btn-primary">+ Ajouter un membre</button>
      </div>
      <div style="display:flex; flex-direction:column; gap:10px;">
        @for (s of staff; track s.id) {
          <div class="card" style="display:flex;align-items:center;gap:16px;padding:16px 20px;">
            <div class="avatar" [style.background]="'linear-gradient(135deg,' + s.color + '40,#0D1526)'">
              <span [style.color]="s.color">{{ s.initials }}</span>
            </div>
            <div style="flex:1;">
              <div style="font-weight:600;">{{ s.name }}</div>
              <div class="text-muted" style="font-size:0.78rem;">{{ s.role }} · {{ s.dept }}</div>
            </div>
            <span [class]="'badge ' + s.badge">{{ s.status }}</span>
            <div style="display:flex;gap:8px;">
              <button class="btn-ghost" style="padding:6px 12px;font-size:0.8rem;">Éditer</button>
              <button class="btn-danger" style="padding:6px 12px;font-size:0.8rem;">Retirer</button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 32px; max-width: 1000px; margin: 0 auto; }
    .avatar { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
  `]
})
export class AdminStaffComponent {
  staff = [
    { id: 1, name: 'Dr. Karim Alaoui',  initials: 'KA', color: '#00D4FF', role: 'Médecin',    dept: 'Cardiologie', status: 'Actif',     badge: 'badge-green'  },
    { id: 2, name: 'Dr. Sara Benali',   initials: 'SB', color: '#7B61FF', role: 'Médecin',    dept: 'Dermatologie',status: 'Actif',     badge: 'badge-green'  },
    { id: 3, name: 'Nour Sekkat',       initials: 'NS', color: '#00F5A0', role: 'Secrétaire', dept: 'Accueil',     status: 'Actif',     badge: 'badge-green'  },
    { id: 4, name: 'Hicham Bensouda',   initials: 'HB', color: '#FFB800', role: 'Infirmier',  dept: 'Urgences',    status: 'Congé',     badge: 'badge-yellow' },
    { id: 5, name: 'Aida El Idrissi',   initials: 'AE', color: '#FF4D6D', role: 'Médecin',    dept: 'Pédiatrie',   status: 'Inactif',   badge: 'badge-red'    },
  ];
}
