import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { LucideAngularModule } from 'lucide-angular';

const CONSULT_TEMPLATES = [
  { label: 'Consultation générale',  diagnosis: 'Consultation médicale générale',       symptoms: 'Fatigue, malaise général', notes: 'Examen clinique complet effectué. Pas de signe de gravité.' },
  { label: 'Suivi traitement',       diagnosis: 'Suivi de traitement chronique',         symptoms: '',                          notes: 'Patient stable. Renouvellement du traitement en cours.' },
  { label: 'Infection ORL',          diagnosis: 'Infection ORL aiguë — pharyngite',      symptoms: 'Maux de gorge, fièvre, odynophagie', notes: 'Amygdales érythémateuses. Antibiothérapie initiée.' },
  { label: 'Douleur thoracique',     diagnosis: 'Douleur thoracique — origine à évaluer', symptoms: 'Douleur thoracique, dyspnée', notes: 'ECG réalisé. Patient orienté pour bilan cardiologique.' },
  { label: 'Contrôle pédiatrique',   diagnosis: 'Examen de croissance pédiatrique',      symptoms: '',                          notes: 'Courbes de croissance dans la norme. Vaccinations vérifiées.' },
  { label: 'Traumatologie',          diagnosis: 'Traumatisme — entorse / contusion',     symptoms: 'Douleur, gonflement, limitation mobilité', notes: 'Pas de fracture à la palpation. Bilan radiologique selon évolution.' },
];

const DRUG_LIST = [
  'Amoxicilline', 'Augmentin', 'Paracétamol', 'Ibuprofène', 'Doliprane',
  'Efferalgan', 'Advil', 'Kardégic', 'Lisinopril', 'Amlodipine',
  'Atorvastatine', 'Metformine', 'Oméprazole', 'Pantoprazole', 'Salbutamol',
  'Ventoline', 'Prednisolone', 'Lévothyrox', 'Sertraline', 'Fluoxétine',
  'Amitriptyline', 'Lorazépam', 'Metoprolol', 'Furosémide', 'Ciprofloxacine',
];

@Component({
  selector: 'app-doctor-consultation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, SidebarComponent, TopbarComponent, DatePipe, LucideAngularModule],
  template: `
    <app-sidebar />
    <app-topbar />
    <main class="page-wrapper">
      <div class="page-content">

        @if (loading()) {
          <div class="skeleton" style="height:120px;border-radius:16px;margin-bottom:20px;"></div>
          <div class="grid-2" style="gap:16px;">
            <div class="skeleton" style="height:400px;border-radius:16px;"></div>
            <div class="skeleton" style="height:400px;border-radius:16px;"></div>
          </div>
        } @else if (appointment()) {
          <!-- Patient header -->
          <div class="patient-header glass-card animate-slide-down">
            <div style="display:flex;align-items:center;gap:16px;">
              <div class="pat-avatar">{{ appointment().patient.firstName[0] }}{{ appointment().patient.lastName[0] }}</div>
              <div>
                <h2 style="font-family:'Fraunces',Georgia,serif;font-size:22px;">{{ appointment().patient.firstName }} {{ appointment().patient.lastName }}</h2>
                <p style="color:#7A8A82;font-size:13px;margin-top:2px;">{{ calcAge(appointment().patient.dateOfBirth) }} ans · {{ formatBT(appointment().patient.bloodType) }} · {{ appointment().slot?.startTime }}</p>
              </div>
            </div>
            @if (appointment().patient.allergies?.length) {
              <div class="allergy-banner">
                <lucide-icon name="triangle-alert" [size]="16" style="flex-shrink:0;" />
                <span><strong>Allergies:</strong> {{ appointment().patient.allergies.join(', ') }}</span>
              </div>
            }
          </div>

          <div class="grid-2" style="margin-top:20px;gap:16px;align-items:start;">

            <!-- Consultation form -->
            <div class="glass-card" style="padding:24px;">
              <h3 style="margin-bottom:16px;font-size:16px;font-weight:600;">Compte rendu de consultation</h3>

              <!-- Template selector -->
              <div class="form-group" style="margin-bottom:16px;">
                <label>Charger un modèle</label>
                <div class="tpl-grid">
                  @for (tpl of consultTemplates; track tpl.label) {
                    <button type="button" class="tpl-btn" (click)="applyTemplate(tpl)">{{ tpl.label }}</button>
                  }
                </div>
              </div>

              <form [formGroup]="consultForm" (ngSubmit)="saveRecord()">
                <div class="form-group" style="margin-bottom:14px;">
                  <label>Diagnostic *</label>
                  <input formControlName="diagnosis" class="glass-input" placeholder="Diagnostic principal..." />
                </div>
                <div class="form-group" style="margin-bottom:14px;">
                  <label>Symptômes (séparés par virgule)</label>
                  <input formControlName="symptomsText" class="glass-input" placeholder="maux de tête, fièvre, fatigue..." />
                </div>
                <div class="form-group" style="margin-bottom:14px;">
                  <label>Notes cliniques</label>
                  <textarea formControlName="notes" class="glass-input" style="resize:vertical;min-height:100px;" placeholder="Observations cliniques détaillées..."></textarea>
                </div>

                <h4 style="font-size:14px;margin:16px 0 10px;color:#3A5248;">Signes vitaux</h4>
                <div class="vitals-form">
                  <div class="form-group"><label>TA (mmHg)</label><input formControlName="bp" class="glass-input" placeholder="120/80" /></div>
                  <div class="form-group"><label>FC (bpm)</label><input formControlName="hr" class="glass-input" type="number" placeholder="72" /></div>
                  <div class="form-group"><label>Temp (°C)</label><input formControlName="temp" class="glass-input" type="number" step="0.1" placeholder="37.2" /></div>
                  <div class="form-group"><label>SpO₂ (%)</label><input formControlName="o2" class="glass-input" type="number" placeholder="98" /></div>
                </div>

                <button type="submit" class="btn-primary" style="width:100%;justify-content:center;margin-top:16px;" [disabled]="saving() || !!appointment().medicalRecord">
                  @if (appointment().medicalRecord) { ✓ Compte rendu enregistré }
                  @else if (saving()) { <span class="spinner"></span> Enregistrement... }
                  @else { Enregistrer le compte rendu }
                </button>
              </form>
            </div>

            <!-- Prescription -->
            <div class="glass-card" style="padding:24px;">
              <h3 style="margin-bottom:20px;font-size:16px;font-weight:600;">Ordonnance</h3>

              @if (!appointment().medicalRecord) {
                <div style="padding:24px;text-align:center;color:#7A8A82;font-size:13px;background:rgba(21,32,64,0.3);border-radius:12px;">
                  Enregistrez d'abord le compte rendu pour émettre une ordonnance.
                </div>
              } @else if (appointment().medicalRecord?.prescription) {
                <div style="padding:16px;background:rgba(0,245,160,0.06);border:1px solid rgba(61,107,79,0.2);border-radius:12px;font-size:13px;color:#3D6B4F;">
                  ✓ Ordonnance déjà émise
                </div>
              } @else {
                <form [formGroup]="rxForm" (ngSubmit)="savePrescription()">
                  <div formArrayName="medications">
                    @for (med of medications.controls; track $index; let i = $index) {
                      <div [formGroupName]="i" class="med-row">
                        <div class="med-name-wrap">
                          <input formControlName="name" class="glass-input" placeholder="Médicament..."
                                 (input)="onMedInput($event, i)"
                                 (focus)="onMedFocus(i)"
                                 (blur)="closeSuggestions()" />
                          @if (activeMedIdx() === i && drugSuggestions().length > 0) {
                            <div class="drug-dropdown">
                              @for (drug of drugSuggestions(); track drug) {
                                <button type="button" class="drug-option" (mousedown)="pickDrug(drug, i)">{{ drug }}</button>
                              }
                            </div>
                          }
                        </div>
                        <input formControlName="dosage" class="glass-input med-input-sm" placeholder="Dosage" />
                        <input formControlName="frequency" class="glass-input med-input-sm" placeholder="Fréquence" />
                        <input formControlName="duration" class="glass-input med-input-sm" placeholder="Durée" />
                        @if (i > 0) {
                          <button type="button" class="btn-icon" (click)="removeMed(i)" style="flex-shrink:0;"><lucide-icon name="x" [size]="14" /></button>
                        }
                      </div>
                    }
                  </div>
                  <button type="button" class="btn-secondary" style="width:100%;justify-content:center;font-size:12px;padding:8px;margin-top:8px;" (click)="addMed()">
                    + Ajouter un médicament
                  </button>
                  <div class="form-group" style="margin-top:12px;">
                    <label>Instructions particulières</label>
                    <textarea formControlName="instructions" class="glass-input" style="height:70px;resize:none;" placeholder="Prendre avec les repas, éviter l'alcool..."></textarea>
                  </div>
                  <button type="submit" class="btn-primary" style="width:100%;justify-content:center;margin-top:12px;" [disabled]="savingRx()">
                    @if (savingRx()) { <span class="spinner"></span> } @else { <lucide-icon name="pill" [size]="14" style="margin-right:5px;" /> Émettre l'ordonnance }
                  </button>
                </form>
              }
            </div>
          </div>

          <!-- Documents médicaux -->
          <div class="glass-card" style="padding:24px;margin-top:16px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
              <h3 style="font-size:16px;font-weight:600;">Documents médicaux</h3>
              <label class="btn-secondary" style="cursor:pointer;display:inline-flex;align-items:center;gap:6px;font-size:12px;padding:7px 14px;" [class.uploading]="docUploading()">
                @if (docUploading()) { <span class="spinner"></span> Importation... }
                @else { <lucide-icon name="paperclip" [size]="13" style="margin-right:4px;" /> Ajouter au dossier }
                <input type="file" hidden (change)="uploadDoc($event)" accept=".pdf,.jpg,.jpeg,.png,.dcm,.dicom" [disabled]="docUploading()" />
              </label>
            </div>
            @if (patientDocs().length === 0) {
              <p style="font-size:13px;color:#7A8A82;text-align:center;padding:20px 0;">Aucun document ajouté au dossier</p>
            } @else {
              <div style="display:flex;flex-direction:column;gap:8px;">
                @for (doc of patientDocs(); track doc.id) {
                  <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid rgba(42,74,56,0.1);border-radius:10px;">
                    <lucide-icon [name]="getDocIcon(doc.fileName)" [size]="18" />
                    <div style="flex:1;min-width:0;">
                      <p style="font-size:13px;font-weight:600;color:#1B2520;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{{ doc.fileName }}</p>
                      <p style="font-size:11px;color:#7A8A82;">{{ doc.uploadedAt | date:'d MMM yyyy' }} · {{ formatSize(doc.fileSize) }}</p>
                    </div>
                    <a [href]="doc.fileUrl" target="_blank" class="btn-icon"><lucide-icon name="download" [size]="14" /></a>
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>
    </main>
  `,
  styles: [`
    .patient-header { padding:20px 24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px; }
    .pat-avatar { width:60px;height:60px;border-radius:16px;background:linear-gradient(135deg,#3D6B4F,#00A36C);display:flex;align-items:center;justify-content:center;font-weight:700;color:white;font-size:20px;flex-shrink:0; }
    .allergy-banner { display:flex;align-items:center;gap:10px;padding:10px 16px;background:rgba(194,64,64,0.08);border:1px solid rgba(194,64,64,0.3);border-radius:10px;font-size:13px;color:#C24040; }
    .vitals-form { display:grid;grid-template-columns:repeat(4,1fr);gap:10px; }
    .form-group { display:flex;flex-direction:column;gap:5px; label{font-size:12px;font-weight:600;color:#3A5248;} }
    .med-row { display:flex;gap:8px;margin-bottom:8px;align-items:flex-start; }
    .med-name-wrap { flex:2;min-width:120px;position:relative; }
    .med-input-sm { flex:1;min-width:70px; }
    .drug-dropdown { position:absolute;top:calc(100% + 4px);left:0;right:0;z-index:50;background:#FAF7F1;border:1px solid rgba(42,74,56,0.18);border-radius:10px;box-shadow:0 8px 24px rgba(27,37,32,0.12);overflow:hidden; }
    .drug-option { display:block;width:100%;padding:9px 14px;background:none;border:none;text-align:left;font-size:13px;color:#1B2520;cursor:pointer;font-family:'Geist','Inter',sans-serif;transition:background .15s; &:hover{background:rgba(42,74,56,0.07);color:#2A4A38;} }
    .tpl-grid { display:flex;flex-wrap:wrap;gap:6px;margin-top:4px; }
    .tpl-btn { padding:5px 12px;border:1px solid rgba(42,74,56,0.2);border-radius:8px;background:transparent;font-size:11px;font-weight:600;color:#3A5248;cursor:pointer;font-family:'Geist','Inter',sans-serif;transition:all .18s; &:hover{background:rgba(42,74,56,0.08);border-color:rgba(42,74,56,0.4);color:#2A4A38;} }
    .spinner { width:14px;height:14px;border:2px solid rgba(0,0,0,0.3);border-top-color:#000;border-radius:50%;animation:spin .7s linear infinite;display:inline-block; }
    @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  `],
})
export class DoctorConsultationComponent implements OnInit {
  private _loading         = signal(true);
  private _appt            = signal<any>(null);
  private _saving          = signal(false);
  private _savingRx        = signal(false);
  private _activeMedIdx    = signal(-1);
  private _drugSuggestions = signal<string[]>([]);
  private _patientDocs     = signal<any[]>([]);
  private _docUploading    = signal(false);

  readonly loading         = this._loading.asReadonly();
  readonly appointment     = this._appt.asReadonly();
  readonly saving          = this._saving.asReadonly();
  readonly savingRx        = this._savingRx.asReadonly();
  readonly activeMedIdx    = this._activeMedIdx.asReadonly();
  readonly drugSuggestions = this._drugSuggestions.asReadonly();
  readonly patientDocs     = this._patientDocs.asReadonly();
  readonly docUploading    = this._docUploading.asReadonly();

  private apptId = '';

  readonly consultTemplates = CONSULT_TEMPLATES;

  consultForm!: ReturnType<FormBuilder['group']>;
  rxForm!: ReturnType<FormBuilder['group']>;

  get medications() { return this.rxForm.get('medications') as FormArray; }
  newMed() { return this.fb.group({ name: ['', Validators.required], dosage: [''], frequency: [''], duration: [''] }); }
  addMed() { this.medications.push(this.newMed()); }
  removeMed(i: number) { this.medications.removeAt(i); }

  onMedFocus(idx: number): void {
    const val = (this.medications.at(idx).get('name')!.value || '').toLowerCase();
    this._activeMedIdx.set(idx);
    this._drugSuggestions.set(
      val.length === 0
        ? DRUG_LIST.slice(0, 7)
        : DRUG_LIST.filter(d => d.toLowerCase().includes(val)).slice(0, 7)
    );
  }

  onMedInput(event: Event, idx: number): void {
    const q = (event.target as HTMLInputElement).value.toLowerCase();
    this._activeMedIdx.set(idx);
    this._drugSuggestions.set(
      q.length === 0
        ? DRUG_LIST.slice(0, 7)
        : DRUG_LIST.filter(d => d.toLowerCase().includes(q)).slice(0, 7)
    );
  }

  closeSuggestions(): void {
    setTimeout(() => {
      this._activeMedIdx.set(-1);
      this._drugSuggestions.set([]);
    }, 150);
  }

  pickDrug(drug: string, idx: number): void {
    this.medications.at(idx).patchValue({ name: drug });
    this._activeMedIdx.set(-1);
    this._drugSuggestions.set([]);
  }

  constructor(
    private api: ApiService, private notifSvc: NotificationService,
    private fb: FormBuilder, private route: ActivatedRoute, private router: Router,
  ) {
    this.consultForm = this.fb.group({
      diagnosis: ['', Validators.required],
      symptomsText: [''],
      notes: [''],
      bp: [''], hr: [null], temp: [null], o2: [null],
    });
    this.rxForm = this.fb.group({
      medications: this.fb.array([this.newMed()]),
      instructions: [''],
    });
  }

  ngOnInit(): void {
    this.apptId = this.route.snapshot.paramMap.get('id')!;
    this.api.get<any>(`/appointments/${this.apptId}`).subscribe({
      next: (res) => {
        this._appt.set(res.data);
        this._loading.set(false);
        const patientId = res.data?.patientId || res.data?.patient?.id;
        if (patientId) {
          this.api.get<any>(`/patients/${patientId}/documents`).subscribe({
            next: (r) => this._patientDocs.set(r.data || []),
          });
        }
      },
      error: () => { this._loading.set(false); this.router.navigate(['/doctor/dashboard']); },
    });
  }

  saveRecord(): void {
    if (this.consultForm.invalid) return;
    this._saving.set(true);
    const { symptomsText, bp, hr, temp, o2, ...rest } = this.consultForm.value;

    this.api.post<any>('/records', {
      ...rest,
      patientId: this._appt()?.patientId,
      appointmentId: this.apptId,
      symptoms: symptomsText ? symptomsText.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      vitals: { bp, hr: hr ? +hr : null, temp: temp ? +temp : null, o2: o2 ? +o2 : null },
    }).subscribe({
      next: (res) => {
        this._appt.update(a => ({ ...a, medicalRecord: res.data, status: 'COMPLETED' }));
        this._saving.set(false);
        this.notifSvc.showToast('Consultation enregistrée !', 'success');
      },
      error: (err) => { this._saving.set(false); this.notifSvc.showToast(err.error?.message || 'Échec de l\'enregistrement', 'error'); },
    });
  }

  savePrescription(): void {
    if (this.rxForm.invalid) return;
    this._savingRx.set(true);
    const recordId = this._appt()?.medicalRecord?.id;

    this.api.post<any>('/prescriptions', {
      medicalRecordId: recordId,
      patientId: this._appt()?.patientId,
      medications: this.rxForm.value.medications,
      instructions: this.rxForm.value.instructions,
    }).subscribe({
      next: (res) => {
        this._appt.update(a => ({ ...a, medicalRecord: { ...a.medicalRecord, prescription: res.data } }));
        this._savingRx.set(false);
        this.notifSvc.showToast('Ordonnance émise !', 'success');
      },
      error: () => { this._savingRx.set(false); this.notifSvc.showToast('Échec de l\'émission de l\'ordonnance', 'error'); },
    });
  }

  applyTemplate(tpl: typeof CONSULT_TEMPLATES[number]): void {
    this.consultForm.patchValue({
      diagnosis:    tpl.diagnosis,
      symptomsText: tpl.symptoms,
      notes:        tpl.notes,
    });
  }

  uploadDoc(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const MAX = 20 * 1024 * 1024;
    if (file.size > MAX) {
      this.notifSvc.showToast('Fichier trop volumineux — limite 20 Mo', 'error');
      input.value = '';
      return;
    }

<<<<<<< HEAD
    const recordId  = this._appt()?.medicalRecord?.id;
    const patientId = this._appt()?.patientId || this._appt()?.patient?.id;
    if (!recordId && !patientId) return;
=======
    const patientId = this._appt()?.patientId || this._appt()?.patient?.id;
    if (!patientId) return;
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567

    this._docUploading.set(true);
    const fd = new FormData();
    fd.append('file', file);
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
<<<<<<< HEAD
    fd.append('documentType', ['dcm', 'dicom'].includes(ext) ? 'IMAGING' : 'CONSULTATION');

    const endpoint = recordId ? `/records/${recordId}/documents` : `/patients/${patientId}/documents`;
    this.api.upload<any>(endpoint, fd).subscribe({
=======
    fd.append('documentType', ['dcm', 'dicom'].includes(ext) ? 'IMAGING' : 'OTHER');

    this.api.upload<any>(`/patients/${patientId}/documents`, fd).subscribe({
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
      next: (res) => {
        this._patientDocs.update(d => [res.data, ...d]);
        this._docUploading.set(false);
        this.notifSvc.showToast('Document ajouté au dossier', 'success');
        input.value = '';
      },
      error: () => {
        this._docUploading.set(false);
        this.notifSvc.showToast("Échec de l'importation", 'error');
        input.value = '';
      },
    });
  }

  getDocIcon(fileName: string): string {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    if (ext === 'dcm' || ext === 'dicom') return 'scan';
    if (ext === 'pdf') return 'file-text';
    if (['jpg', 'jpeg', 'png'].includes(ext || '')) return 'image';
    return 'folder';
  }

  formatSize(bytes: number): string {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  calcAge(dob: string): number {
    return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000));
  }
  formatBT(bt: string): string { return bt ? bt.replace('_POS', '+').replace('_NEG', '-') : ''; }
}
