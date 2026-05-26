import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { LucideAngularModule } from 'lucide-angular';

type ViewMode = 'day' | 'week' | 'month';

const CONSULT_TYPES = [
  { value: 'GENERAL', label: 'Consultation générale', color: '#3D6B4F', bg: 'rgba(61,107,79,0.12)'   },
  { value: 'SUIVI',   label: 'Suivi',                 color: '#2A7A9A', bg: 'rgba(42,122,154,0.12)'  },
  { value: 'BILAN',   label: 'Bilan / Contrôle',      color: '#B8792A', bg: 'rgba(184,121,42,0.12)'  },
  { value: 'URGENCE', label: 'Urgence',               color: '#C24040', bg: 'rgba(194,64,64,0.12)'   },
];

@Component({
  selector: 'app-doctor-planning',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent, TopbarComponent, DatePipe, LucideAngularModule],
  template: `
    <app-sidebar />
    <app-topbar />
    <main class="page-wrapper">
      <div class="page-content">

        <!-- Header -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;flex-wrap:wrap;gap:12px;">
          <h2 style="font-family:'Fraunces',Georgia,serif;">Mon planning</h2>
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <button class="btn-secondary" (click)="toggle('slot')">
              {{ showAddSlot() ? '✕ Annuler' : '+ Disponibilités' }}
            </button>
            <button class="btn-secondary leave-btn" (click)="toggle('leave')">
              @if (!showLeaveForm()) { <lucide-icon name="tree-palm" [size]="14" style="margin-right:4px;" /> } {{ showLeaveForm() ? 'Annuler' : 'Congés / Absences' }}
            </button>
            <button class="btn-danger urgency-btn" (click)="toggle('urgency')">
              @if (!showUrgency()) { <lucide-icon name="siren" [size]="14" style="margin-right:4px;" /> } {{ showUrgency() ? 'Annuler' : 'Urgence' }}
            </button>
          </div>
        </div>

        <!-- Add slot form -->
        @if (showAddSlot()) {
          <div class="glass-card animate-slide-down" style="padding:24px;margin-bottom:20px;">
            <h3 style="margin-bottom:16px;font-size:15px;font-weight:600;">Ajouter des créneaux disponibles</h3>
            <form [formGroup]="slotForm" (ngSubmit)="addSlots()" style="display:flex;flex-wrap:wrap;gap:14px;align-items:flex-end;">
              <div class="form-group"><label>Date</label><input type="date" formControlName="date" class="glass-input" [min]="today" /></div>
              <div class="form-group"><label>Heure de début</label><input type="time" formControlName="startTime" class="glass-input" /></div>
              <div class="form-group"><label>Heure de fin</label><input type="time" formControlName="endTime" class="glass-input" /></div>
              <div class="form-group">
                <label>Durée</label>
                <select formControlName="duration" class="glass-input">
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="60">1 heure</option>
                </select>
              </div>
              <div class="form-group">
                <label>Type de consultation</label>
                <select formControlName="type" class="glass-input">
                  @for (t of consultTypes; track t.value) {
                    <option [value]="t.value">{{ t.label }}</option>
                  }
                </select>
              </div>
              <button type="submit" class="btn-primary" [disabled]="slotForm.invalid || saving()">
                Ajouter créneau
              </button>
            </form>
          </div>
        }

        <!-- Leave form -->
        @if (showLeaveForm()) {
          <div class="glass-card animate-slide-down" style="padding:24px;margin-bottom:20px;border-color:rgba(201,99,60,0.2);">
            <h3 style="margin-bottom:16px;font-size:15px;font-weight:600;color:#C9633C;">Déclarer une absence / congé</h3>
            <form [formGroup]="leaveForm" (ngSubmit)="addLeave()" style="display:flex;flex-wrap:wrap;gap:14px;align-items:flex-end;">
              <div class="form-group"><label>Date de début *</label><input type="date" formControlName="startDate" class="glass-input" [min]="today" /></div>
              <div class="form-group"><label>Date de fin *</label><input type="date" formControlName="endDate" class="glass-input" [min]="today" /></div>
              <div class="form-group" style="flex:1;min-width:180px;"><label>Motif</label><input type="text" formControlName="reason" class="glass-input" placeholder="Congés annuels, maladie..." /></div>
              <button type="submit" class="btn-primary" style="background:#C9633C;" [disabled]="leaveForm.invalid || savingLeave()">
                Déclarer l'absence
              </button>
            </form>
            @if (leaves().length > 0) {
              <div style="margin-top:20px;border-top:1px solid rgba(201,99,60,0.12);padding-top:16px;">
                <p style="font-size:12px;font-weight:700;color:#7A8A82;text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px;">Absences déclarées</p>
                <div style="display:flex;flex-direction:column;gap:6px;">
                  @for (lv of leaves(); track lv.id) {
                    <div class="leave-row">
                      <lucide-icon name="tree-palm" [size]="16" class="leave-icon" />
                      <div class="leave-info">
                        <span class="leave-dates">{{ lv.startDate | date:'d MMM yyyy' }} → {{ lv.endDate | date:'d MMM yyyy' }}</span>
                        @if (lv.reason) { <span class="leave-reason">{{ lv.reason }}</span> }
                      </div>
                      <button class="leave-del" (click)="deleteLeave(lv.id)" title="Supprimer"><lucide-icon name="x" [size]="13" /></button>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        }

        <!-- Urgency form -->
        @if (showUrgency()) {
          <div class="glass-card animate-slide-down" style="padding:24px;margin-bottom:20px;border-color:rgba(194,64,64,0.25);background:rgba(194,64,64,0.02);">
            <h3 style="margin-bottom:4px;font-size:15px;font-weight:700;color:#C24040;display:flex;align-items:center;gap:6px;"><lucide-icon name="siren" [size]="16" /> Insertion d'un rendez-vous urgent</h3>
            <p style="font-size:12px;color:#7A8A82;margin-bottom:16px;">Crée immédiatement un rendez-vous hors créneaux habituels.</p>
            <form [formGroup]="urgencyForm" (ngSubmit)="createUrgency()" style="display:flex;flex-wrap:wrap;gap:14px;align-items:flex-end;">
              <div class="form-group" style="min-width:200px;">
                <label>Patient *</label>
                <select formControlName="patientId" class="glass-input">
                  <option value="">— Sélectionner un patient —</option>
                  @for (p of patients(); track p.id) {
                    <option [value]="p.id">{{ p.firstName }} {{ p.lastName }}</option>
                  }
                </select>
              </div>
              <div class="form-group"><label>Date *</label><input type="date" formControlName="date" class="glass-input" [min]="today" /></div>
              <div class="form-group"><label>Heure *</label><input type="time" formControlName="time" class="glass-input" /></div>
              <div class="form-group">
                <label>Durée</label>
                <select formControlName="duration" class="glass-input">
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="60">1 heure</option>
                </select>
              </div>
              <div class="form-group" style="flex:1;min-width:180px;">
                <label>Motif d'urgence</label>
                <input type="text" formControlName="motif" class="glass-input" placeholder="Douleur thoracique, traumatisme..." />
              </div>
              <button type="submit" class="btn-danger" style="display:inline-flex;align-items:center;gap:6px;" [disabled]="urgencyForm.invalid || savingUrgency()">
                <lucide-icon name="siren" [size]="13" /> Créer le RDV urgent
              </button>
            </form>
          </div>
        }

        <!-- View mode switcher + legend -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px;">
          <div class="view-switcher">
            <button class="view-btn" [class.active]="viewMode() === 'day'"   (click)="setView('day')">Jour</button>
            <button class="view-btn" [class.active]="viewMode() === 'week'"  (click)="setView('week')">Semaine</button>
            <button class="view-btn" [class.active]="viewMode() === 'month'" (click)="setView('month')">Mois</button>
          </div>
          <div class="type-legend">
            @for (t of consultTypes; track t.value) {
              <span class="legend-item">
                <span class="legend-dot" [style.background]="t.color"></span>
                {{ t.label }}
              </span>
            }
          </div>
        </div>

        <!-- ── DAY VIEW ── -->
        @if (viewMode() === 'day') {
          <div class="view-nav">
            <button class="btn-icon" (click)="prevDay()"><lucide-icon name="chevron-left" [size]="16" /></button>
            <span class="view-label">{{ selectedDay() | date:'EEEE d MMMM yyyy' }}</span>
            <button class="btn-icon" (click)="nextDay()"><lucide-icon name="chevron-right" [size]="16" /></button>
          </div>
          <div class="glass-card" style="padding:0;overflow:hidden;">
            @if (getSlotsForDay(selectedDay()).length === 0) {
              <div class="empty-day">
                <lucide-icon name="inbox" [size]="32" style="color:#7A8A82;" />
                <p>Aucun créneau pour ce jour</p>
              </div>
            } @else {
              @for (slot of getSlotsForDay(selectedDay()); track slot.id) {
                <div class="day-slot-row" [class.booked]="!slot.isAvailable"
                     [style.border-left]="!slot.isAvailable ? '3px solid ' + typeInfo(slot).color : '3px solid transparent'">
                  <div class="day-slot-time">
                    <span class="slot-start">{{ slot.startTime }}</span>
                    <span class="slot-end">{{ slot.endTime }}</span>
                  </div>
                  <div class="day-slot-info">
                    @if (slot.isAvailable) {
                      <span class="badge available-badge">Disponible</span>
                      <span class="type-tag" [style.color]="typeInfo(slot).color" [style.background]="typeInfo(slot).bg">
                        {{ typeInfo(slot).label }}
                      </span>
                    } @else {
                      <span class="badge booked-badge" [style.background]="typeInfo(slot).bg" [style.color]="typeInfo(slot).color" [style.border-color]="typeInfo(slot).color + '44'">
                        {{ typeInfo(slot).label }}
                      </span>
                      @if (slot.appointment?.patient) {
                        <span class="patient-chip">{{ slot.appointment.patient.firstName }} {{ slot.appointment.patient.lastName }}</span>
                      }
                      @if (slot.appointment?.motif) {
                        <span class="motif-chip">{{ slot.appointment.motif }}</span>
                      }
                    }
                  </div>
                  @if (slot.isAvailable) {
                    <button class="slot-del-btn" (click)="deleteSlot(slot.id)" title="Supprimer">×</button>
                  }
                </div>
              }
            }
          </div>
        }

        <!-- ── WEEK VIEW ── -->
        @if (viewMode() === 'week') {
          <div class="view-nav">
            <button class="btn-icon" (click)="prevWeek()"><lucide-icon name="chevron-left" [size]="16" /></button>
<<<<<<< HEAD
            <span class="view-label">{{ weekStart() | date:'d MMM' }} — {{ weekEnd() | date:'d MMM yyyy' }}</span>
=======
            <span class="view-label">{{ weekStart() | date:'MMM d' }} — {{ weekEnd() | date:'MMM d, yyyy' }}</span>
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
            <button class="btn-icon" (click)="nextWeek()"><lucide-icon name="chevron-right" [size]="16" /></button>
          </div>
          <div class="calendar-grid">
            @for (day of weekDays(); track day.date.toISOString()) {
              <div class="day-col">
                <div class="day-header" [class.today-col]="isToday(day.date)" (click)="goToDay(day.date)" style="cursor:pointer;">
                  <p class="day-name">{{ day.date | date:'EEE' }}</p>
                  <p class="day-num" [class.today-num]="isToday(day.date)">{{ day.date | date:'d' }}</p>
                </div>
                <div class="day-slots">
                  @for (slot of getSlotsForDay(day.date); track slot.id) {
                    <div class="slot-chip" [class.booked]="!slot.isAvailable"
                         [style.background]="!slot.isAvailable ? typeInfo(slot).bg : ''"
                         [style.border-color]="!slot.isAvailable ? typeInfo(slot).color + '55' : ''"
                         [style.color]="!slot.isAvailable ? typeInfo(slot).color : ''"
                         [title]="slot.startTime + ' — ' + typeInfo(slot).label">
                      <span class="slot-time">{{ slot.startTime }}</span>
                      @if (slot.isAvailable) {
                        <button class="slot-del" (click)="deleteSlot(slot.id)" title="Supprimer">×</button>
                      } @else {
                        <span class="slot-booked-badge">●</span>
                      }
                    </div>
                  }
                  @if (getSlotsForDay(day.date).length === 0) {
                    <p class="no-slots-day">—</p>
                  }
                </div>
              </div>
            }
          </div>
        }

        <!-- ── MONTH VIEW ── -->
        @if (viewMode() === 'month') {
          <div class="view-nav">
            <button class="btn-icon" (click)="prevMonth()"><lucide-icon name="chevron-left" [size]="16" /></button>
            <span class="view-label" style="text-transform:capitalize;">{{ monthStart() | date:'MMMM yyyy' }}</span>
            <button class="btn-icon" (click)="nextMonth()"><lucide-icon name="chevron-right" [size]="16" /></button>
          </div>
          <div class="month-grid">
            @for (h of dayHeaders; track h) {
              <div class="month-day-hdr">{{ h }}</div>
            }
            @for (week of monthCalendar(); track $index) {
              @for (day of week; track day.toISOString()) {
                <div class="month-cell"
                     [class.other-month]="!isSameMonth(day, monthStart())"
                     [class.today-cell]="isToday(day)"
                     (click)="goToDay(day)">
                  <span class="month-cell-num">{{ day | date:'d' }}</span>
                  @if (getSlotsForDay(day).length > 0) {
                    <span class="month-slot-count">{{ getSlotsForDay(day).length }}</span>
                  }
                  <div class="month-type-dots">
                    @for (t of getTypeDots(day); track t.color) {
                      <span class="month-type-dot" [style.background]="t.color"></span>
                    }
                  </div>
                  @if (isOnLeave(day)) {
                    <span class="month-leave-bar"></span>
                  }
                </div>
              }
            }
          </div>
        }

      </div>
    </main>
  `,
  styles: [`
    /* View switcher */
    .view-switcher { display:flex;gap:0;border:1px solid rgba(42,74,56,0.15);border-radius:10px;overflow:hidden;width:fit-content; }
    .view-btn { padding:8px 20px;background:transparent;border:none;font-size:13px;font-weight:600;color:#7A8A82;cursor:pointer;transition:all .2s;font-family:'Geist','Inter',sans-serif; &.active{background:#2A4A38;color:#F2EDE4;} &:hover:not(.active){background:rgba(42,74,56,0.06);color:#3A5248;} }

    /* Type legend */
    .type-legend { display:flex;gap:14px;flex-wrap:wrap; }
    .legend-item { display:flex;align-items:center;gap:5px;font-size:11px;color:#7A8A82;font-weight:600; }
    .legend-dot { width:8px;height:8px;border-radius:50%;flex-shrink:0; }

    /* View nav */
    .view-nav { display:flex;align-items:center;gap:16px;margin-bottom:16px; }
    .view-label { font-size:14px;font-weight:600;color:#1B2520;min-width:180px;text-align:center; }

    /* Week view */
    .calendar-grid { display:grid;grid-template-columns:repeat(7,1fr);gap:8px; @media(max-width:900px){grid-template-columns:repeat(3,1fr);} }
    .day-col { background:#FAF7F1;border:1px solid rgba(42,74,56,0.1);border-radius:12px;overflow:hidden; }
    .day-header { padding:10px;text-align:center;border-bottom:1px solid rgba(42,74,56,0.06); &.today-col{background:rgba(42,74,56,0.06);} }
    .day-name { font-size:11px;font-weight:700;color:#7A8A82;text-transform:uppercase;letter-spacing:.06em; }
    .day-num { font-size:18px;font-weight:700;color:#3A5248;margin-top:2px; &.today-num{color:#2A4A38;} }
    .day-slots { padding:8px;display:flex;flex-direction:column;gap:5px;min-height:120px; }
    .slot-chip { display:flex;align-items:center;justify-content:space-between;padding:6px 8px;border-radius:8px;background:rgba(61,107,79,0.08);border:1px solid rgba(61,107,79,0.2);font-size:11px;color:#3D6B4F;font-family:'JetBrains Mono',monospace;transition:all .2s; }
    .slot-time { font-weight:600; }
    .slot-del { background:none;border:none;cursor:pointer;color:rgba(194,64,64,0.6);font-size:14px;padding:0;line-height:1; &:hover{color:#C24040;} }
    .slot-booked-badge { font-size:8px; }
    .no-slots-day { text-align:center;color:#A8B8B0;font-size:12px;padding:8px 0; }

    /* Day view */
    .day-slot-row { display:flex;align-items:center;gap:16px;padding:14px 20px;border-bottom:1px solid rgba(42,74,56,0.06);transition:background .15s; &:last-child{border-bottom:none;} &:hover{background:rgba(42,74,56,0.02);} &.booked{background:rgba(42,74,56,0.015);} }
    .day-slot-time { display:flex;flex-direction:column;align-items:center;width:60px;flex-shrink:0; }
    .slot-start { font-size:14px;font-weight:700;color:#1B2520;font-family:'JetBrains Mono',monospace; }
    .slot-end { font-size:11px;color:#7A8A82;font-family:'JetBrains Mono',monospace; }
    .day-slot-info { flex:1;display:flex;align-items:center;gap:8px;flex-wrap:wrap; }
    .available-badge { background:rgba(61,107,79,0.1);color:#3D6B4F;border:1px solid rgba(61,107,79,0.25);font-size:11px;font-weight:700;padding:3px 10px;border-radius:999px; }
    .booked-badge { border:1px solid;font-size:11px;font-weight:700;padding:3px 10px;border-radius:999px; }
    .type-tag { font-size:10px;font-weight:600;padding:2px 8px;border-radius:6px; }
    .patient-chip { font-size:12px;font-weight:600;color:#3A5248;background:rgba(42,74,56,0.06);padding:3px 10px;border-radius:8px; }
    .motif-chip { font-size:11px;color:#7A8A82;background:rgba(239,234,224,0.8);padding:3px 8px;border-radius:6px;font-style:italic; }
    .slot-del-btn { background:none;border:1px solid rgba(194,64,64,0.25);border-radius:8px;cursor:pointer;color:#C24040;font-size:16px;padding:4px 8px;line-height:1;transition:all .2s; &:hover{background:rgba(194,64,64,0.08);} }
    .empty-day { display:flex;flex-direction:column;align-items:center;gap:8px;padding:48px;color:#7A8A82;font-size:13px; }

    /* Month view */
    .month-grid { display:grid;grid-template-columns:repeat(7,1fr);gap:2px;background:rgba(42,74,56,0.08);border:1px solid rgba(42,74,56,0.1);border-radius:14px;overflow:hidden; }
    .month-day-hdr { background:#FAF7F1;padding:10px 4px;text-align:center;font-size:11px;font-weight:700;color:#7A8A82;text-transform:uppercase;letter-spacing:.06em; }
    .month-cell { background:#FAF7F1;padding:8px 6px;min-height:72px;cursor:pointer;display:flex;flex-direction:column;align-items:flex-start;gap:3px;transition:background .15s;position:relative; &:hover{background:rgba(42,74,56,0.04);} &.other-month .month-cell-num{color:#C8D5CC;} &.today-cell{background:rgba(42,74,56,0.06);} &.today-cell .month-cell-num{color:#2A4A38;font-weight:800;} }
    .month-cell-num { font-size:13px;font-weight:600;color:#3A5248;font-family:'JetBrains Mono',monospace; }
    .month-slot-count { font-size:10px;font-weight:700;background:rgba(61,107,79,0.12);color:#3D6B4F;border:1px solid rgba(61,107,79,0.2);padding:1px 7px;border-radius:999px; }
    .month-type-dots { display:flex;gap:3px;flex-wrap:wrap; }
    .month-type-dot { width:7px;height:7px;border-radius:50%; }

    /* Leave */
    .leave-btn { border-color:rgba(201,99,60,0.3);color:#C9633C; &:hover{background:rgba(201,99,60,0.06);} }
    .urgency-btn { border-color:rgba(194,64,64,0.3);color:#C24040; &:hover{background:rgba(194,64,64,0.06);} }
    .leave-row { display:flex;align-items:center;gap:12px;padding:10px 14px;background:rgba(201,99,60,0.05);border:1px solid rgba(201,99,60,0.15);border-radius:10px; }
    .leave-icon { font-size:16px;flex-shrink:0; }
    .leave-info { flex:1;display:flex;flex-direction:column;gap:2px; }
    .leave-dates { font-size:13px;font-weight:600;color:#1B2520; }
    .leave-reason { font-size:11px;color:#7A8A82;font-style:italic; }
    .leave-del { background:none;border:1px solid rgba(194,64,64,0.25);border-radius:6px;color:#C24040;font-size:14px;width:26px;height:26px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s; &:hover{background:rgba(194,64,64,0.08);} }
    .month-leave-bar { position:absolute;bottom:0;left:0;right:0;height:3px;background:#C9633C;border-radius:0 0 2px 2px;opacity:.7; }

    /* Common */
    .form-group { display:flex;flex-direction:column;gap:5px; label{font-size:12px;font-weight:600;color:#3A5248;} }
    select.glass-input option { background:#FAF7F1;color:#1B2520; }
  `],
})
export class DoctorPlanningComponent implements OnInit {
  private _slots       = signal<any[]>([]);
  private _weekOffset  = signal(0);
  private _dayOffset   = signal(0);
  private _monthOffset = signal(0);
  private _viewMode    = signal<ViewMode>('week');
  private _saving      = signal(false);
  private _leaves      = signal<any[]>([]);
  private _savingLeave = signal(false);
  private _patients    = signal<any[]>([]);

  readonly slots       = this._slots.asReadonly();
  readonly saving      = this._saving.asReadonly();
  readonly viewMode    = this._viewMode.asReadonly();
  readonly leaves      = this._leaves.asReadonly();
  readonly savingLeave = this._savingLeave.asReadonly();
  readonly patients    = this._patients.asReadonly();

  showAddSlot   = signal(false);
  showLeaveForm = signal(false);
  showUrgency   = signal(false);
  savingUrgency = signal(false);

  today = new Date().toISOString().slice(0, 10);
  readonly dayHeaders  = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  readonly consultTypes = CONSULT_TYPES;

  slotForm!:    ReturnType<FormBuilder['group']>;
  leaveForm!:   ReturnType<FormBuilder['group']>;
  urgencyForm!: ReturnType<FormBuilder['group']>;

  constructor(
    private api: ApiService,
    private notifSvc: NotificationService,
    private fb: FormBuilder,
  ) {
    this.slotForm = this.fb.group({
      date:      ['', Validators.required],
      startTime: ['', Validators.required],
      endTime:   ['', Validators.required],
      duration:  [30],
      type:      ['GENERAL'],
    });
    this.leaveForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate:   ['', Validators.required],
      reason:    [''],
    });
    this.urgencyForm = this.fb.group({
      patientId: ['', Validators.required],
      date:      ['', Validators.required],
      time:      ['', Validators.required],
      duration:  [30],
      motif:     ['Urgence médicale'],
    });
  }

  ngOnInit(): void {
    this.loadSlots();
    this.loadLeaves();
    this.api.get<any>('/patients').subscribe(res => this._patients.set(res.data || []));
  }

  toggle(panel: 'slot' | 'leave' | 'urgency'): void {
    this.showAddSlot.set(panel === 'slot'    ? !this.showAddSlot()   : false);
    this.showLeaveForm.set(panel === 'leave' ? !this.showLeaveForm() : false);
    this.showUrgency.set(panel === 'urgency' ? !this.showUrgency()   : false);
  }

  setView(mode: ViewMode): void {
    this._viewMode.set(mode);
    this._weekOffset.set(0); this._dayOffset.set(0); this._monthOffset.set(0);
    this.loadSlots();
  }

  // ── Type helpers ─────────────────────────────────────────────────────────────

  typeInfo(slot: any) {
    const t = slot?.appointment?.type || slot?.type || 'GENERAL';
    return CONSULT_TYPES.find(x => x.value === t) || CONSULT_TYPES[0];
  }

  getTypeDots(date: Date): { color: string }[] {
    const booked = this.getSlotsForDay(date).filter(s => !s.isAvailable);
    const seen = new Set<string>();
    const dots: { color: string }[] = [];
    booked.forEach(s => {
      const t = s.appointment?.type || 'GENERAL';
      if (!seen.has(t)) { seen.add(t); dots.push({ color: this.typeInfo(s).color }); }
    });
    return dots;
  }

  // ── Day view ─────────────────────────────────────────────────────────────────

  readonly selectedDay = () => {
    const d = new Date(); d.setDate(d.getDate() + this._dayOffset()); d.setHours(0, 0, 0, 0); return d;
  };
  prevDay(): void  { this._dayOffset.update(v => v - 1); this.loadSlots(); }
  nextDay(): void  { this._dayOffset.update(v => v + 1); this.loadSlots(); }

  goToDay(day: Date): void {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    this._dayOffset.set(Math.round((day.getTime() - today.getTime()) / 86400000));
    this._viewMode.set('day'); this.loadSlots();
  }

  // ── Week view ─────────────────────────────────────────────────────────────────

  readonly weekStart = () => {
    const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + this._weekOffset() * 7); d.setHours(0, 0, 0, 0); return d;
  };
  readonly weekEnd = () => { const d = this.weekStart(); d.setDate(d.getDate() + 6); return d; };
  readonly weekDays = () => Array.from({ length: 7 }, (_, i) => { const d = new Date(this.weekStart()); d.setDate(d.getDate() + i); return { date: d }; });
  prevWeek(): void { this._weekOffset.update(v => v - 1); this.loadSlots(); }
  nextWeek(): void { this._weekOffset.update(v => v + 1); this.loadSlots(); }

  // ── Month view ────────────────────────────────────────────────────────────────

  readonly monthStart = () => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + this._monthOffset()); d.setHours(0, 0, 0, 0); return d; };

  readonly monthCalendar = (): Date[][] => {
    const ms = this.monthStart(); const year = ms.getFullYear(); const month = ms.getMonth();
    const firstDay = new Date(year, month, 1); const lastDay = new Date(year, month + 1, 0);
    const startPad = (firstDay.getDay() + 6) % 7;
    const endPad = (7 - ((lastDay.getDay() + 6) % 7 + 1)) % 7;
    const cells: Date[] = [];
    for (let i = -startPad; i < lastDay.getDate() + endPad; i++) cells.push(new Date(year, month, 1 + i));
    const weeks: Date[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    return weeks;
  };
  prevMonth(): void { this._monthOffset.update(v => v - 1); this.loadSlots(); }
  nextMonth(): void { this._monthOffset.update(v => v + 1); this.loadSlots(); }
  isSameMonth(d: Date, ref: Date): boolean { return d.getMonth() === ref.getMonth() && d.getFullYear() === ref.getFullYear(); }

  // ── Shared helpers ────────────────────────────────────────────────────────────

  isToday(d: Date): boolean { const t = new Date(); t.setHours(0, 0, 0, 0); return d.toDateString() === t.toDateString(); }

  getSlotsForDay(date: Date): any[] {
    const ds = date.toISOString().slice(0, 10);
    return this._slots().filter(s => s.date?.slice(0, 10) === ds);
  }

  isOnLeave(date: Date): boolean {
    const ds = date.toISOString().slice(0, 10);
    return this._leaves().some(lv => ds >= lv.startDate?.slice(0, 10) && ds <= lv.endDate?.slice(0, 10));
  }

  // ── API calls ─────────────────────────────────────────────────────────────────

  private loadSlots(): void {
    const mode = this._viewMode();
    if (mode === 'day') {
      this.api.get<any>('/slots', { date: this.selectedDay().toISOString().slice(0, 10) }).subscribe(r => this._slots.set(r.data || []));
    } else if (mode === 'week') {
      this.api.get<any>('/slots', { date: this.weekStart().toISOString().slice(0, 10) }).subscribe(r => this._slots.set(r.data || []));
    } else {
      const ms = this.monthStart(); const end = new Date(ms.getFullYear(), ms.getMonth() + 1, 0);
      this.api.get<any>('/slots', { dateFrom: ms.toISOString().slice(0, 10), dateTo: end.toISOString().slice(0, 10) }).subscribe(r => this._slots.set(r.data || []));
    }
  }

  private loadLeaves(): void {
    this.api.get<any>('/doctor/leaves').subscribe(r => this._leaves.set(r.data || []));
  }

  addSlots(): void {
    if (this.slotForm.invalid) return;
    this._saving.set(true);
    const { date, ...rest } = this.slotForm.value;
    this.api.post<any>('/slots', { dates: [date], ...rest }).subscribe({
      next: (res) => {
        this._slots.update(s => [...s, ...(res.data || [])]);
        this._saving.set(false);
        this.slotForm.reset({ duration: 30, type: 'GENERAL' });
        this.showAddSlot.set(false);
        this.notifSvc.showToast('Créneau ajouté !', 'success');
      },
      error: () => { this._saving.set(false); this.notifSvc.showToast("Échec de l'ajout", 'error'); },
    });
  }

  deleteSlot(id: string): void {
    this.api.delete<any>(`/slots/${id}`).subscribe({
      next: () => { this._slots.update(s => s.filter(x => x.id !== id)); this.notifSvc.showToast('Créneau supprimé', 'info'); },
      error: () => this.notifSvc.showToast('Impossible de supprimer un créneau réservé', 'error'),
    });
  }

  addLeave(): void {
    if (this.leaveForm.invalid) return;
    this._savingLeave.set(true);
    this.api.post<any>('/doctor/leaves', this.leaveForm.value).subscribe({
      next: (res) => {
        this._leaves.update(l => [res.data, ...l]);
        this._savingLeave.set(false);
        this.leaveForm.reset();
        this.notifSvc.showToast('Absence déclarée', 'success');
      },
      error: () => { this._savingLeave.set(false); this.notifSvc.showToast('Échec de la déclaration', 'error'); },
    });
  }

  deleteLeave(id: string): void {
    this.api.delete<any>(`/doctor/leaves/${id}`).subscribe({
      next: () => { this._leaves.update(l => l.filter(x => x.id !== id)); this.notifSvc.showToast('Absence supprimée', 'info'); },
    });
  }

  createUrgency(): void {
    if (this.urgencyForm.invalid) return;
    this.savingUrgency.set(true);
    const v = this.urgencyForm.value;
    this.api.post<any>('/appointments', {
      patientId: v.patientId,
      type:      'URGENCE',
      motif:     v.motif || 'Urgence médicale',
      slot:      { date: v.date, startTime: v.time, duration: Number(v.duration) },
    }).subscribe({
      next: () => {
        this.savingUrgency.set(false);
        this.showUrgency.set(false);
        this.urgencyForm.reset({ duration: 30, motif: 'Urgence médicale' });
        this.notifSvc.showToast('Rendez-vous d\'urgence créé', 'success');
        this.loadSlots();
      },
      error: () => { this.savingUrgency.set(false); this.notifSvc.showToast('Échec de la création', 'error'); },
    });
  }
}
