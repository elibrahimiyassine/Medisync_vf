import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-patient-appointments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, SidebarComponent, TopbarComponent, DatePipe, LucideAngularModule],
  template: `
    <app-sidebar />
    <app-topbar />

    <main class="page-wrapper">
      <div class="page-content">

        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
          <div>
            <h2 style="font-family:'Fraunces',Georgia,serif;">Mes rendez-vous</h2>
            <p style="color:#7A8A82;font-size:13px;margin-top:4px;">Gérez et réservez vos consultations</p>
          </div>
          <button class="btn-primary" (click)="openBooking()">
            <span>+</span> Prendre rendez-vous
          </button>
        </div>

        <!-- Filter tabs -->
        <div class="filter-tabs">
          @for (tab of tabs; track tab.key) {
            <button class="tab-btn" [class.active]="activeTab() === tab.key" (click)="setTab(tab.key)">
              {{ tab.label }}
              @if (tab.key !== 'all') {
                <span class="tab-count">{{ countByStatus(tab.key) }}</span>
              }
            </button>
          }
        </div>

        <!-- Appointments list -->
        @if (loading()) {
          <div class="appt-grid stagger">
            @for (i of [1,2,3,4]; track i) {
              <div class="skeleton" style="height:120px;border-radius:16px;"></div>
            }
          </div>
        } @else if (filteredAppointments().length === 0) {
          <div class="empty-card glass-card">
            <lucide-icon name="calendar" [size]="48" style="color:#7A8A82;" />
            <h3>Aucun rendez-vous trouvé</h3>
            <p>Prenez votre premier rendez-vous avec l'un de nos médecins</p>
            <button class="btn-primary" (click)="openBooking()">Réserver maintenant</button>
          </div>
        } @else {
          <div class="appt-grid stagger">
            @for (appt of filteredAppointments(); track appt.id) {
              <div class="appt-card glass-card">
                <div class="appt-card-header">
                  <div class="doctor-info">
                    <div class="doctor-avatar">{{ appt.doctor.firstName[0] }}{{ appt.doctor.lastName[0] }}</div>
                    <div>
                      <p class="doctor-name">Dr. {{ appt.doctor.firstName }} {{ appt.doctor.lastName }}</p>
                      <p class="doctor-spec">{{ appt.doctor.specialty }}</p>
                    </div>
                  </div>
                  <span class="badge {{ appt.status.toLowerCase() }}">{{ translateStatus(appt.status) }}</span>
                </div>
                <div class="appt-card-body">
                  <div class="appt-detail"><lucide-icon name="calendar" [size]="14" /><span>{{ appt.slot?.date | date:'EEEE d MMMM yyyy' }}</span></div>
                  <div class="appt-detail"><lucide-icon name="clock" [size]="14" /><span>{{ appt.slot?.startTime }} — {{ appt.slot?.endTime }}</span></div>
                  <div class="appt-detail"><lucide-icon name="file-text" [size]="14" /><span>{{ appt.motif }}</span></div>
                  @if (appt.dependentName) {
                    <div class="appt-detail appt-dependent"><lucide-icon name="user" [size]="14" /><span>Pour : {{ appt.dependentName }}</span></div>
                  }
                </div>
                @if (appt.status === 'PENDING' || appt.status === 'CONFIRMED') {
                  <div class="appt-card-footer">
                    <button class="btn-danger" style="font-size:12px;padding:7px 14px;" (click)="cancelAppointment(appt.id)">
                      Annuler
                    </button>
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>
    </main>

    <!-- Booking modal -->
    @if (bookingOpen()) {
      <div class="overlay" (click)="closeBooking()">
      <div class="booking-modal glass-card animate-scale-in" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Prendre rendez-vous</h3>
          <button class="btn-icon" (click)="closeBooking()"><lucide-icon name="x" [size]="16" /></button>
        </div>

        <form [formGroup]="bookingForm" (ngSubmit)="submitBooking()" class="booking-form">
          <!-- Step 1: Select doctor -->
          @if (bookingStep() === 1) {
            <p class="step-label">Étape 1 sur 3 — Choisir un médecin</p>
            <input type="text" class="glass-input" placeholder="Rechercher par nom ou spécialité..." (input)="onSearchInput($event)" style="margin-bottom:10px;" />
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;">
              <select class="glass-input" style="font-size:12px;" (change)="onLocationChange($event)">
                <option value="">Toutes localisations</option>
                <option value="Casablanca">Casablanca</option>
                <option value="Rabat">Rabat</option>
                <option value="Marrakech">Marrakech</option>
                <option value="Fès">Fès</option>
                <option value="Tanger">Tanger</option>
                <option value="Agadir">Agadir</option>
              </select>
              <select class="glass-input" style="font-size:12px;" (change)="onLanguageChange($event)">
                <option value="">Toutes langues</option>
                <option value="Français">Français</option>
                <option value="Anglais">Anglais</option>
                <option value="Arabe">Arabe</option>
                <option value="Espagnol">Espagnol</option>
                <option value="Allemand">Allemand</option>
              </select>
            </div>
            <div class="doctor-list">
              @for (doc of filteredDoctors(); track doc.id) {
                <div class="doctor-option" [class.selected]="bookingForm.get('doctorId')?.value === doc.id" (click)="selectDoctor(doc)">
                  <div class="doc-avatar">{{ doc.firstName[0] }}{{ doc.lastName[0] }}</div>
                  <div class="doc-details">
                    <p class="doc-name">Dr. {{ doc.firstName }} {{ doc.lastName }}</p>
                    <p class="doc-spec">{{ doc.specialty }}</p>
<<<<<<< HEAD
                    <p class="doc-rate">{{ doc.consultationRate }} DH · Secteur {{ doc.sectorType?.replace('SECTOR_','') }}</p>
=======
                    <p class="doc-rate">€{{ doc.consultationRate }} · Sector {{ doc.sectorType?.replace('SECTOR_','') }}</p>
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
                  </div>
                  @if (doc.avgRating) {
                    <div class="doc-rating" style="display:flex;align-items:center;gap:3px;"><lucide-icon name="star" [size]="12" /> {{ doc.avgRating | number:'1.1-1' }}</div>
                  }
                </div>
              }
            </div>
            <button type="button" class="btn-primary" style="width:100%;margin-top:16px;" [disabled]="!bookingForm.get('doctorId')?.value" (click)="bookingStep.set(2)">
              Suivant : Choisir un créneau →
            </button>
          }

          <!-- Step 2: Select slot -->
          @if (bookingStep() === 2) {
            <p class="step-label">Étape 2 sur 3 — Choisir une date et un créneau</p>
            <input type="date" formControlName="date" class="glass-input" (change)="loadSlots()" style="margin-bottom:16px;" />
            @if (loadingSlots()) {
              <div class="skeleton" style="height:80px;border-radius:12px;"></div>
            } @else if (slots().length === 0) {
              <div class="no-slots">Aucun créneau disponible pour cette date. Essayez un autre jour.</div>
            } @else {
              <div class="slots-grid">
                @for (slot of slots(); track slot.id) {
                  <button type="button" class="slot-btn" [class.selected]="bookingForm.get('slotId')?.value === slot.id" [class.unavailable]="!slot.isAvailable" [disabled]="!slot.isAvailable" (click)="selectSlot(slot)">
                    {{ slot.startTime }}
                  </button>
                }
              </div>
            }
            <div style="display:flex;gap:10px;margin-top:16px;">
              <button type="button" class="btn-secondary" style="flex:1;" (click)="bookingStep.set(1)">← Retour</button>
              <button type="button" class="btn-primary" style="flex:2;" [disabled]="!bookingForm.get('slotId')?.value" (click)="bookingStep.set(3)">Suivant : Confirmer →</button>
            </div>
          }

          <!-- Step 3: Confirm -->
          @if (bookingStep() === 3) {
            <p class="step-label">Étape 3 sur 3 — Confirmer votre rendez-vous</p>
            <div class="confirm-summary glass-card" style="padding:16px;margin-bottom:4px;">
              <p><strong style="color:#2A4A38;">Médecin :</strong> Dr. {{ selectedDoctor()?.firstName }} {{ selectedDoctor()?.lastName }}</p>
              <p style="margin-top:6px;"><strong style="color:#2A4A38;">Spécialité :</strong> {{ selectedDoctor()?.specialty }}</p>
              <p style="margin-top:6px;"><strong style="color:#2A4A38;">Date :</strong> {{ bookingForm.get('date')?.value | date:'EEEE d MMMM' }}</p>
              <p style="margin-top:6px;"><strong style="color:#2A4A38;">Heure :</strong> {{ selectedSlot()?.startTime }}</p>
<<<<<<< HEAD
              <p style="margin-top:6px;"><strong style="color:#2A4A38;">Honoraires :</strong> {{ selectedDoctor()?.consultationRate }} DH</p>
=======
              <p style="margin-top:6px;"><strong style="color:#2A4A38;">Honoraires :</strong> €{{ selectedDoctor()?.consultationRate }}</p>
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
            </div>

            <div class="form-group">
              <label>Motif de la consultation</label>
              <input type="text" formControlName="motif" class="glass-input" placeholder="ex. Bilan annuel, maux de tête..." />
            </div>

            <div class="email-notice">
              <lucide-icon name="mail" [size]="15" style="flex-shrink:0;color:#3A5248;" />
              <p style="font-size:12px;color:#3A5248;line-height:1.5;">
                Un e-mail de confirmation sera envoyé à votre adresse après la réservation. Pensez à vérifier vos spams si vous ne le recevez pas sous 5 minutes.
              </p>
            </div>

            <!-- Dependent toggle -->
            <label class="dependent-toggle">
              <input type="checkbox" formControlName="forDependent" class="checkbox" />
              <span>Réserver pour un proche (enfant, parent...)</span>
            </label>

            @if (forDependentVal()) {
              <div class="dependent-section animate-slide-down">
                <p class="dependent-title">Informations du proche</p>
                <div class="form-group">
                  <label>Nom complet *</label>
                  <input type="text" formControlName="dependentName" class="glass-input" placeholder="ex. Marie Bernard" />
                  @if (bookingForm.get('dependentName')?.invalid && bookingForm.get('dependentName')?.touched) {
                    <span class="error-msg">Champ obligatoire</span>
                  }
                </div>
                <div class="form-group" style="margin-top:10px;">
                  <label>Relation</label>
                  <select formControlName="dependentRelation" class="glass-input">
                    <option value="">— Sélectionner —</option>
                    <option value="enfant">Enfant</option>
                    <option value="parent">Parent</option>
                    <option value="conjoint">Conjoint(e)</option>
                    <option value="frere_soeur">Frère / Sœur</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
                <div class="form-group" style="margin-top:10px;">
                  <label>Date de naissance *</label>
                  <input type="date" formControlName="dependentDOB" class="glass-input" />
                  @if (bookingForm.get('dependentDOB')?.invalid && bookingForm.get('dependentDOB')?.touched) {
                    <span class="error-msg">Champ obligatoire</span>
                  }
                </div>
              </div>
            }

            <div style="display:flex;gap:10px;margin-top:16px;">
              <button type="button" class="btn-secondary" style="flex:1;" (click)="bookingStep.set(2)">← Retour</button>
              <button type="submit" class="btn-primary" style="flex:2;" [disabled]="submitting() || bookingForm.invalid">
                @if (submitting()) { <span class="spinner"></span> Réservation... }
                @else { ✓ Confirmer la réservation }
              </button>
            </div>
          }
        </form>
      </div>
      </div>
    }
  `,
  styles: [`
    .filter-tabs { display:flex; gap:6px; margin-bottom:20px; flex-wrap:wrap; }
    .tab-btn { padding:8px 16px; border-radius:999px; background:rgba(42,74,56,0.06); border:1px solid rgba(42,74,56,0.12); color:#7A8A82; font-size:13px; font-weight:500; cursor:pointer; transition:all .2s; display:flex;align-items:center;gap:6px; font-family:'DM Sans',sans-serif; &.active{background:rgba(42,74,56,0.12);border-color:#2A4A38;color:#2A4A38;} &:hover:not(.active){color:#3A5248;} }
    .tab-count { background:rgba(42,74,56,0.15);color:#2A4A38;border-radius:999px;padding:1px 7px;font-size:11px;font-weight:700; }

    .appt-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(340px,1fr)); gap:16px; }
    .appt-card { padding:20px; transition:all .25s; }
    .appt-card-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px; }
    .doctor-info { display:flex; align-items:center; gap:12px; }
    .doctor-avatar { width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#2A4A38,#C9633C);display:flex;align-items:center;justify-content:center;font-weight:700;color:white;font-size:14px; }
    .doctor-name { font-size:14px;font-weight:600;color:#1B2520; }
    .doctor-spec { font-size:12px;color:#7A8A82; }
    .appt-card-body { display:flex;flex-direction:column;gap:7px; }
    .appt-detail { display:flex;align-items:center;gap:8px;font-size:13px;color:#3A5248; }
    .appt-dependent { background:rgba(201,99,60,0.06);border-radius:8px;padding:4px 8px;border:1px solid rgba(201,99,60,0.15); }
    .appt-card-footer { margin-top:14px;padding-top:14px;border-top:1px solid rgba(42,74,56,0.06);display:flex;justify-content:flex-end; }

    .empty-card { padding:48px;display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center; color:#7A8A82; h3{color:#1B2520;} p{font-size:13px;} }

    /* Booking modal */
    .booking-modal { width:90%;max-width:520px;max-height:90vh;overflow-y:auto;padding:28px; }
    .modal-header { display:flex;justify-content:space-between;align-items:center;margin-bottom:20px; h3{font-size:18px;font-weight:700;font-family:'Fraunces',Georgia,serif;} }
    .booking-form { display:flex;flex-direction:column;gap:12px; }
    .step-label { font-size:12px;color:#7A8A82;font-weight:600;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px; }

    .doctor-list { display:flex;flex-direction:column;gap:8px;max-height:280px;overflow-y:auto; }
    .doctor-option { display:flex;align-items:center;gap:12px;padding:12px;border-radius:12px;border:1px solid rgba(42,74,56,0.1);cursor:pointer;transition:all .2s; &:hover{background:rgba(42,74,56,0.06);border-color:rgba(42,74,56,0.15);} &.selected{background:rgba(42,74,56,0.1);border-color:#2A4A38;} }
    .doc-avatar { width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#C9633C,#2A4A38);display:flex;align-items:center;justify-content:center;font-weight:700;color:white;font-size:13px;flex-shrink:0; }
    .doc-details { flex:1; }
    .doc-name { font-size:13px;font-weight:600;color:#1B2520; }
    .doc-spec { font-size:12px;color:#7A8A82; }
    .doc-rate { font-size:11px;color:#2A4A38;margin-top:2px; }
    .doc-rating { font-size:12px;color:#B8792A;white-space:nowrap; }

    .slots-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:8px; }
    .slot-btn { padding:10px 6px;border-radius:10px;background:rgba(61,107,79,0.08);border:1px solid rgba(0,245,160,0.25);color:#3D6B4F;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;font-family:'JetBrains Mono',monospace; &.selected{background:rgba(61,107,79,0.2);border-color:#3D6B4F;box-shadow:0 0 12px rgba(61,107,79,0.2);} &.unavailable{background:rgba(194,64,64,0.08);border-color:rgba(255,77,109,0.2);color:rgba(255,77,109,0.5);cursor:not-allowed;} &:hover:not(.unavailable):not(.selected){transform:translateY(-2px);} }
    .no-slots { padding:20px;text-align:center;color:#7A8A82;font-size:13px;background:rgba(42,74,56,0.04);border-radius:12px; }

    /* Dependent section */
    .dependent-toggle { display:flex;align-items:center;gap:10px;padding:12px 14px;background:rgba(201,99,60,0.05);border:1px solid rgba(201,99,60,0.15);border-radius:10px;cursor:pointer;font-size:13px;color:#3A5248;font-weight:500;transition:background .2s; &:hover{background:rgba(201,99,60,0.08);} }
    .dependent-section { background:rgba(201,99,60,0.04);border:1px solid rgba(201,99,60,0.15);border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:0; }
    .dependent-title { font-size:11px;font-weight:700;color:#C9633C;text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px; }

    .email-notice { display:flex;align-items:flex-start;gap:10px;padding:10px 14px;background:rgba(42,122,154,0.06);border:1px solid rgba(42,122,154,0.2);border-radius:10px; }
    .spinner { width:14px;height:14px;border:2px solid rgba(0,0,0,0.3);border-top-color:#000;border-radius:50%;animation:spin .7s linear infinite;display:inline-block; }
    @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  `],
})
export class PatientAppointmentsComponent implements OnInit {
  private _loading      = signal(true);
  private _appointments = signal<any[]>([]);
  private _doctors      = signal<any[]>([]);
  private _slots        = signal<any[]>([]);
  private _filteredDocs = signal<any[]>([]);
  private _bookingOpen  = signal(false);
  private _bookingStep  = signal(1);
  private _loadingSlots = signal(false);
  private _submitting   = signal(false);
  private _activeTab    = signal('all');
  private _selectedDoctor = signal<any>(null);
  private _selectedSlot   = signal<any>(null);
  private _forDependent   = signal(false);

  readonly loading         = this._loading.asReadonly();
  readonly appointments    = this._appointments.asReadonly();
  readonly slots           = this._slots.asReadonly();
  readonly filteredDoctors = this._filteredDocs.asReadonly();
  readonly bookingOpen     = this._bookingOpen.asReadonly();
  readonly bookingStep     = this._bookingStep;
  readonly loadingSlots    = this._loadingSlots.asReadonly();
  readonly submitting      = this._submitting.asReadonly();
  readonly activeTab       = this._activeTab.asReadonly();
  readonly selectedDoctor  = this._selectedDoctor.asReadonly();
  readonly selectedSlot    = this._selectedSlot.asReadonly();
  readonly forDependentVal = this._forDependent.asReadonly();

  readonly filteredAppointments = computed(() => {
    const tab = this._activeTab();
    const all = this._appointments();
    if (tab === 'all') return all;
    return all.filter(a => a.status.toLowerCase() === tab);
  });

  countByStatus = (status: string) =>
    this._appointments().filter(a => a.status.toLowerCase() === status).length;

  tabs = [
    { key: 'all',       label: 'Tous' },
    { key: 'pending',   label: 'En attente' },
    { key: 'confirmed', label: 'Confirmé' },
    { key: 'completed', label: 'Terminé' },
    { key: 'cancelled', label: 'Annulé' },
  ];

  bookingForm!: ReturnType<FormBuilder['group']>;

  constructor(
    private api: ApiService,
    private notifSvc: NotificationService,
    private fb: FormBuilder,
  ) {
    this.bookingForm = this.fb.group({
      doctorId:          ['', Validators.required],
      slotId:            ['', Validators.required],
      date:              ['', Validators.required],
      motif:             ['', Validators.required],
      forDependent:      [false],
      dependentName:     [''],
      dependentRelation: [''],
      dependentDOB:      [''],
    });
  }

  ngOnInit(): void {
    this.loadAppointments();

    this.bookingForm.get('forDependent')!.valueChanges.subscribe((checked: boolean) => {
      this._forDependent.set(!!checked);
      const nameCtrl = this.bookingForm.get('dependentName')!;
      const dobCtrl  = this.bookingForm.get('dependentDOB')!;
      if (checked) {
        nameCtrl.setValidators([Validators.required]);
        dobCtrl.setValidators([Validators.required]);
      } else {
        nameCtrl.clearValidators();
        dobCtrl.clearValidators();
        nameCtrl.setValue('');
        dobCtrl.setValue('');
        this.bookingForm.get('dependentRelation')!.setValue('');
      }
      nameCtrl.updateValueAndValidity();
      dobCtrl.updateValueAndValidity();
    });
  }

  private loadAppointments(): void {
    this.api.get<any>('/appointments').subscribe({
      next: (res) => { this._appointments.set(res.data || []); this._loading.set(false); },
      error: () => this._loading.set(false),
    });
  }

  setTab(tab: string): void { this._activeTab.set(tab); }

  openBooking(): void {
    this._bookingOpen.set(true);
    this._bookingStep.set(1);
    this._forDependent.set(false);
    this._searchQuery    = '';
    this._locationFilter = '';
    this._languageFilter = '';
    this.bookingForm.reset({ forDependent: false });
    this.loadDoctors();
  }

  closeBooking(): void { this._bookingOpen.set(false); }

  private loadDoctors(): void {
    this.api.get<any>('/doctors').subscribe(res => {
      this._doctors.set(res.data || []);
      this._filteredDocs.set(res.data || []);
    });
  }

  private _searchQuery   = '';
  private _locationFilter = '';
  private _languageFilter = '';

  private applyDoctorFilters(): void {
    const q   = this._searchQuery;
    const loc = this._locationFilter;
    const lng = this._languageFilter;
    this._filteredDocs.set(
      this._doctors().filter(d => {
<<<<<<< HEAD
        const matchText = !q || `${d.firstName} ${d.lastName} ${d.specialty} ${d.city ?? ''}`.toLowerCase().includes(q);
        const matchLoc  = !loc || (d.city ?? '').toLowerCase().includes(loc.toLowerCase());
=======
        const matchText = !q || `${d.firstName} ${d.lastName} ${d.specialty}`.toLowerCase().includes(q);
        const matchLoc  = !loc || !d.location || d.location === loc;
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
        const matchLng  = !lng || !d.languages?.length || d.languages.includes(lng);
        return matchText && matchLoc && matchLng;
      })
    );
  }

  filterDoctors(event: Event): void { this.onSearchInput(event); }

  onSearchInput(event: Event): void {
    this._searchQuery = (event.target as HTMLInputElement).value.toLowerCase();
    this.applyDoctorFilters();
  }

  onLocationChange(event: Event): void {
    this._locationFilter = (event.target as HTMLSelectElement).value;
    this.applyDoctorFilters();
  }

  onLanguageChange(event: Event): void {
    this._languageFilter = (event.target as HTMLSelectElement).value;
    this.applyDoctorFilters();
  }

  selectDoctor(doc: any): void {
    this._selectedDoctor.set(doc);
    this.bookingForm.patchValue({ doctorId: doc.id });
  }

  loadSlots(): void {
    const doctorId = this.bookingForm.get('doctorId')?.value;
    const date = this.bookingForm.get('date')?.value;
    if (!doctorId || !date) return;

    this._loadingSlots.set(true);
    this.api.get<any>('/slots', { doctorId, date }).subscribe({
      next: (res) => { this._slots.set(res.data || []); this._loadingSlots.set(false); },
      error: () => this._loadingSlots.set(false),
    });
  }

  selectSlot(slot: any): void {
    this._selectedSlot.set(slot);
    this.bookingForm.patchValue({ slotId: slot.id });
  }

  submitBooking(): void {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }
    this._submitting.set(true);

    const { forDependent, dependentName, dependentRelation, dependentDOB, ...base } = this.bookingForm.value;
    const payload = forDependent
      ? { ...base, forDependent: true, dependentName, dependentRelation, dependentDOB }
      : { ...base, forDependent: false };

    this.api.post<any>('/appointments', payload).subscribe({
      next: () => {
        this._submitting.set(false);
        this.closeBooking();
        this.notifSvc.showToast('Rendez-vous réservé ! Un e-mail de confirmation vous a été envoyé.', 'success');
        this.loadAppointments();
      },
      error: (err) => {
        this._submitting.set(false);
        this.notifSvc.showToast(err.error?.message || 'Échec de la réservation', 'error');
      },
    });
  }

  cancelAppointment(id: string): void {
    this.api.delete<any>(`/appointments/${id}`).subscribe({
      next: () => {
        this.notifSvc.showToast('Rendez-vous annulé', 'info');
        this.loadAppointments();
      },
      error: () => this.notifSvc.showToast('Impossible d\'annuler le rendez-vous', 'error'),
    });
  }

  translateStatus(s: string): string {
    const map: Record<string, string> = {
      PENDING:   'En attente',
      CONFIRMED: 'Confirmé',
      COMPLETED: 'Terminé',
      CANCELLED: 'Annulé',
      SCHEDULED: 'Planifié',
    };
    return map[s] ?? s;
  }
}
