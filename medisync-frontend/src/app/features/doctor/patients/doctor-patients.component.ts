import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';

@Component({
  selector: 'app-doctor-patients',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, TopbarComponent, DatePipe],
  template: `
    <app-sidebar />
    <app-topbar />
    <main class="page-wrapper">
      <div class="page-content">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
          <h2 style="font-family:'Fraunces',Georgia,serif;">Mes patients</h2>
          <input type="text" class="glass-input" style="width:280px;" placeholder="Rechercher un patient..." (input)="search($event)" />
        </div>

        @if (loading()) {
          <div class="patients-grid">
            @for (i of [1,2,3,4,6]; track i) {
              <div class="skeleton" style="height:220px;border-radius:16px;"></div>
            }
          </div>
        } @else {
          <div class="patients-grid stagger">
            @for (appt of filteredList(); track appt.id) {
              <div class="flip-card" [class.flipped]="flipped[appt.patientId]">
                <div class="flip-inner">
                  <!-- Front face -->
                  <div class="flip-front glass-card">
                    <div class="patient-avatar-lg">{{ appt.patient.firstName[0] }}{{ appt.patient.lastName[0] }}</div>
                    <h4 class="patient-name">{{ appt.patient.firstName }} {{ appt.patient.lastName }}</h4>
                    <p class="patient-age">{{ calcAge(appt.patient.dateOfBirth) }} ans</p>
                    <p class="patient-last">Dernière visite : {{ appt.slot?.date | date:'d MMM yyyy' }}</p>
                    <div style="display:flex;gap:6px;justify-content:center;margin-top:10px;">
                      @if (appt.patient.bloodType) {
                        <span class="mini-badge blood">{{ formatBT(appt.patient.bloodType) }}</span>
                      }
                    </div>
                    <button class="flip-hint" (click)="toggleFlip(appt.patientId)">Voir infos médicales</button>
                  </div>

                  <!-- Back face -->
                  <div class="flip-back glass-card">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                      <h4 style="font-size:14px;font-weight:700;color:#1B2520;">Infos médicales</h4>
                      <button class="flip-hint" (click)="toggleFlip(appt.patientId)">Retourner</button>
                    </div>
                    <div class="back-grid">
                      <div class="back-field"><p class="back-label">Groupe sanguin</p><p class="back-value blood">{{ formatBT(appt.patient.bloodType) || '—' }}</p></div>
                      <div class="back-field"><p class="back-label">Allergies</p>
                        @if (appt.patient.allergies?.length) {
                          <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:2px;">
                            @for (a of appt.patient.allergies; track a) {
                              <span class="allergy-pill">{{ a }}</span>
                            }
                          </div>
                        } @else { <p class="back-value">Aucune</p> }
                      </div>
                      <div class="back-field"><p class="back-label">Motif</p><p class="back-value">{{ appt.motif }}</p></div>
                      <div class="back-field"><p class="back-label">Statut</p><span class="badge {{ appt.status.toLowerCase() }}" style="font-size:10px;">{{ translateStatus(appt.status) }}</span></div>
                    </div>
                    @if (appt.status !== 'COMPLETED') {
                      <a [routerLink]="['/doctor/consultation', appt.id]" class="btn-primary" style="width:100%;justify-content:center;margin-top:12px;font-size:12px;padding:9px;">Démarrer la consultation</a>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </main>
  `,
  styles: [`
    .patients-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px; }

    .flip-card { perspective:1000px;height:240px; }
    .flip-inner { position:relative;width:100%;height:100%;transform-style:preserve-3d;transition:transform .5s cubic-bezier(.4,0,.2,1); }
    .flip-card.flipped .flip-inner { transform:rotateY(180deg); }
    .flip-front, .flip-back { position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;display:flex;flex-direction:column;align-items:center;padding:20px;border-radius:16px;overflow:hidden; }
    .flip-back { transform:rotateY(180deg);align-items:stretch; }

    .patient-avatar-lg { width:64px;height:64px;border-radius:16px;background:linear-gradient(135deg,#2A4A38,#C9633C);display:flex;align-items:center;justify-content:center;font-weight:700;color:white;font-size:22px;margin-bottom:10px; }
    .patient-name { font-size:15px;font-weight:700;color:#1B2520;text-align:center; }
    .patient-age { font-size:12px;color:#7A8A82;margin-top:2px; }
    .patient-last { font-size:11px;color:#7A8A82;margin-top:6px; }
    .mini-badge { padding:3px 8px;border-radius:999px;font-size:10px;font-weight:700; &.blood{background:rgba(194,64,64,0.12);color:#C24040;border:1px solid rgba(194,64,64,0.3);} }
    .flip-hint { margin-top:auto;font-size:11px;color:#2A4A38;background:none;border:none;cursor:pointer;padding-top:8px; }

    .back-grid { display:flex;flex-direction:column;gap:10px; }
    .back-label { font-size:10px;font-weight:700;color:#7A8A82;text-transform:uppercase;letter-spacing:.06em; }
    .back-value { font-size:13px;color:#1B2520;margin-top:2px; &.blood{color:#C24040;font-weight:700;} }
    .allergy-pill { padding:2px 8px;background:rgba(194,64,64,0.08);border:1px solid rgba(194,64,64,0.2);border-radius:999px;font-size:10px;color:#C24040; }
  `],
})
export class DoctorPatientsComponent implements OnInit {
  private _loading  = signal(true);
  private _list     = signal<any[]>([]);
  private _filtered = signal<any[]>([]);
  readonly loading       = this._loading.asReadonly();
  readonly filteredList  = this._filtered.asReadonly();

  flipped: Record<string, boolean> = {};

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<any>('/doctors/me/appointments').subscribe({
      next: (res) => {
        const unique = this.dedupePatients(res.data || []);
        this._list.set(unique);
        this._filtered.set(unique);
        this._loading.set(false);
      },
      error: () => this._loading.set(false),
    });
  }

  private dedupePatients(appts: any[]): any[] {
    const seen = new Set<string>();
    return appts.filter(a => {
      if (seen.has(a.patientId)) return false;
      seen.add(a.patientId);
      return true;
    });
  }

  search(e: Event): void {
    const q = (e.target as HTMLInputElement).value.toLowerCase();
    this._filtered.set(
      this._list().filter(a =>
        `${a.patient.firstName} ${a.patient.lastName}`.toLowerCase().includes(q)
      )
    );
  }

  toggleFlip(id: string): void { this.flipped[id] = !this.flipped[id]; }

  calcAge(dob: string): number {
    return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000));
  }

  formatBT(bt: string): string {
    return bt ? bt.replace('_POS', '+').replace('_NEG', '-') : '';
  }

  translateStatus(s: string): string {
    const map: Record<string, string> = {
      PENDING: 'En attente', CONFIRMED: 'Confirmé',
      COMPLETED: 'Terminé',  CANCELLED: 'Annulé',
    };
    return map[s] ?? s;
  }
}
