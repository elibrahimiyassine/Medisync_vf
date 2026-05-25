import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-patient-dossier',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, TopbarComponent, DatePipe, LucideAngularModule],
  template: `
    <app-sidebar />
    <app-topbar />

    <main class="page-wrapper">
      <div class="page-content">
        <div class="dossier-header">
          <div>
            <h2 style="font-family:'Fraunces',Georgia,serif;">Dossier médical</h2>
            <p style="color:#7A8A82;font-size:13px;margin-top:4px;">Votre historique médical complet</p>
          </div>
          <div style="display:flex;gap:10px;">
            <label class="btn-secondary upload-label" style="cursor:pointer;" [class.uploading]="uploading()">
              @if (uploading()) { <span class="spinner-sm"></span> Importation... }
              @else { <lucide-icon name="paperclip" [size]="13" style="margin-right:4px;" /> Importer un document }
              <input type="file" hidden (change)="uploadDoc($event)" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.dcm,.dicom" [disabled]="uploading()" />
            </label>
          </div>
        </div>

        <!-- Patient info card -->
        @if (patient()) {
          <div class="patient-info-card glass-card animate-slide-down stagger">
            <div class="info-section">
              <p class="info-label">Nom complet</p>
              <p class="info-value">{{ patient().firstName }} {{ patient().lastName }}</p>
            </div>
            <div class="info-section">
              <p class="info-label">Date de naissance</p>
              <p class="info-value">{{ patient().dateOfBirth | date:'d MMMM yyyy' }}</p>
            </div>
            <div class="info-section">
              <p class="info-label">Groupe sanguin</p>
              <p class="info-value blood-type" style="color:#C24040;">{{ formatBloodType(patient().bloodType) || '—' }}</p>
            </div>
            <div class="info-section">
              <p class="info-label">Allergies</p>
              <div class="allergy-list">
                @for (a of patient().allergies; track a) {
                  <span class="allergy-tag" style="display:inline-flex;align-items:center;gap:3px;"><lucide-icon name="triangle-alert" [size]="10" /> {{ a }}</span>
                }
                @if (!patient().allergies?.length) {
                  <span style="color:#7A8A82;font-size:13px;">Aucune déclarée</span>
                }
              </div>
            </div>
          </div>
        }

        <div class="grid-2" style="margin-top:20px;gap:20px;align-items:start;">
          <!-- Medical timeline -->
          <div>
            <div class="section-title"><h3>Historique médical</h3></div>
            @if (loadingRecords()) {
              @for (i of [1,2,3]; track i) {
                <div class="skeleton" style="height:100px;border-radius:14px;margin-bottom:12px;"></div>
              }
            } @else if (records().length === 0) {
              <div class="glass-card" style="padding:40px;text-align:center;color:#7A8A82;">
                <lucide-icon name="clipboard-list" [size]="32" style="color:#7A8A82;" />
                <p style="margin-top:10px;">Aucun dossier médical pour le moment</p>
              </div>
            } @else {
              <div class="medical-timeline stagger">
                @for (rec of records(); track rec.id) {
                  <div class="timeline-entry" (click)="expandRecord(rec.id)" [class.expanded]="expandedId() === rec.id">
                    <div class="entry-icon"><lucide-icon name="stethoscope" [size]="18" /></div>
                    <div class="entry-content">
                      <div class="entry-header">
                        <div>
                          <p class="entry-diagnosis">{{ rec.diagnosis }}</p>
                          <p class="entry-doctor">Dr. {{ rec.doctor.firstName }} {{ rec.doctor.lastName }}</p>
                        </div>
                        <div class="entry-meta">
                          <p class="entry-date">{{ rec.createdAt | date:'d MMM yyyy' }}</p>
                          <span class="expand-icon"><lucide-icon [name]="expandedId() === rec.id ? 'chevron-up' : 'chevron-down'" [size]="12" /></span>
                        </div>
                      </div>

                      @if (expandedId() === rec.id) {
                        <div class="entry-details animate-slide-down">
                          @if (rec.notes) {
                            <p class="detail-item"><strong>Notes :</strong> {{ rec.notes }}</p>
                          }
                          @if (rec.symptoms?.length) {
                            <p class="detail-item"><strong>Symptômes :</strong> {{ rec.symptoms.join(', ') }}</p>
                          }
                          @if (rec.vitals) {
                            <div class="vitals-grid">
                              @if (rec.vitals.bp) { <div class="vital"><span>BP</span><strong>{{ rec.vitals.bp }}</strong></div> }
                              @if (rec.vitals.hr) { <div class="vital"><span>HR</span><strong>{{ rec.vitals.hr }} bpm</strong></div> }
                              @if (rec.vitals.temp) { <div class="vital"><span>Temp</span><strong>{{ rec.vitals.temp }}°C</strong></div> }
                              @if (rec.vitals.o2) { <div class="vital"><span>O₂</span><strong>{{ rec.vitals.o2 }}%</strong></div> }
                            </div>
                          }
                          @if (rec.prescription) {
                            <div class="prescription-badge">
                              <lucide-icon name="pill" [size]="13" style="margin-right:4px;" /> Ordonnance émise — <a [routerLink]="['/patient/prescriptions']" style="color:#2A4A38;">Voir →</a>
                            </div>
                          }
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Documents -->
          <div>
            <div class="section-title"><h3>Documents</h3></div>
            @if (documents().length === 0) {
              <div class="glass-card" style="padding:40px;text-align:center;color:#7A8A82;">
                <lucide-icon name="folder" [size]="32" style="color:#7A8A82;" />
                <p style="margin-top:10px;">Aucun document importé</p>
              </div>
            } @else {
              <div class="doc-list stagger">
                @for (doc of documents(); track doc.id) {
                  <div class="doc-item glass-card">
                    <div class="doc-icon">
                      @if (isImageDoc(doc)) {
                        <img [src]="doc.fileUrl" [alt]="doc.fileName" class="doc-thumbnail" />
                      } @else {
                        <lucide-icon [name]="getDocIcon(doc.fileType, doc.fileName)" [size]="18" />
                      }
                    </div>
                    <div class="doc-info">
                      <p class="doc-name">{{ doc.fileName }}</p>
                      <p class="doc-meta">{{ doc.uploadedAt | date:'d MMM yyyy' }} · {{ formatSize(doc.fileSize) }}</p>
                    </div>
                    <a [href]="doc.fileUrl" target="_blank" class="btn-icon" title="Download"><lucide-icon name="download" [size]="14" /></a>
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <!-- Lab results -->
        <div style="margin-top:24px;">
          <div class="section-title"><h3>Résultats d'analyses</h3></div>
          @if (labResults().length === 0) {
            <div class="glass-card" style="padding:40px;text-align:center;color:#7A8A82;display:flex;flex-direction:column;align-items:center;gap:8px;">
              <lucide-icon name="microscope" [size]="32" />
              <p>Aucun résultat d'analyse disponible</p>
            </div>
          } @else {
            <div class="glass-card" style="padding:0;overflow:hidden;">
              <table class="ms-table">
                <thead>
                  <tr>
                    <th>Analyse</th>
                    <th>Date</th>
                    <th>Résultat</th>
                    <th>Unité</th>
                    <th>Référence</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  @for (lr of labResults(); track lr.id) {
                    <tr>
                      <td style="font-weight:600;color:#1B2520;">{{ lr.testName }}</td>
                      <td style="color:#7A8A82;font-size:12px;">{{ lr.date | date:'d MMM yyyy' }}</td>
                      <td style="font-family:'JetBrains Mono',monospace;font-size:13px;color:#2A4A38;font-weight:700;">{{ lr.value }}</td>
                      <td style="color:#7A8A82;font-size:12px;">{{ lr.unit || '—' }}</td>
                      <td style="color:#7A8A82;font-size:12px;">{{ lr.referenceRange || '—' }}</td>
                      <td>
                        <span class="badge" [class]="lr.status === 'NORMAL' ? 'completed' : (lr.status === 'HIGH' || lr.status === 'LOW' ? 'cancelled' : 'pending')">
                          {{ lr.status === 'NORMAL' ? 'Normal' : (lr.status === 'HIGH' ? 'Élevé' : (lr.status === 'LOW' ? 'Bas' : lr.status)) }}
                        </span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>

      </div>
    </main>
  `,
  styles: [`
    .dossier-header { display:flex;justify-content:space-between;align-items:center;margin-bottom:24px; }
    .upload-label { display:inline-flex;align-items:center;gap:6px; }
    .patient-info-card { padding:20px 24px;display:grid;grid-template-columns:repeat(4,1fr);gap:16px; @media(max-width:1024px){grid-template-columns:repeat(2,1fr);} }
    .info-label { font-size:11px;font-weight:700;color:#7A8A82;text-transform:uppercase;letter-spacing:.07em;margin-bottom:4px; }
    .info-value { font-size:14px;font-weight:600;color:#1B2520; }
    .allergy-list { display:flex;flex-wrap:wrap;gap:6px; }
    .allergy-tag { padding:3px 10px;background:rgba(194,64,64,0.12);border:1px solid rgba(194,64,64,0.2);border-radius:999px;font-size:11px;color:#C24040;font-weight:600; }

    .medical-timeline { display:flex;flex-direction:column;gap:8px; }
    .timeline-entry { display:flex;gap:14px;padding:16px;background:#FAF7F1;border:1px solid rgba(42,74,56,0.1);border-radius:14px;cursor:pointer;transition:all .2s; &:hover{border-color:rgba(0,212,255,0.25);background:#FAF7F1;} &.expanded{border-color:rgba(42,74,56,0.4);background:rgba(42,74,56,0.04);} }
    .entry-icon { width:36px;height:36px;border-radius:10px;background:rgba(42,74,56,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#2A4A38; }
    .entry-content { flex:1;min-width:0; }
    .entry-header { display:flex;justify-content:space-between;align-items:flex-start; }
    .entry-diagnosis { font-size:14px;font-weight:600;color:#1B2520; }
    .entry-doctor { font-size:12px;color:#7A8A82;margin-top:2px; }
    .entry-date { font-size:12px;color:#7A8A82;text-align:right; }
    .expand-icon { font-size:10px;color:#7A8A82;display:block;margin-top:4px;text-align:right; }
    .entry-details { margin-top:14px;padding-top:14px;border-top:1px solid rgba(42,74,56,0.1);display:flex;flex-direction:column;gap:8px; }
    .detail-item { font-size:13px;color:#3A5248; strong{color:#1B2520;} }
    .vitals-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:4px; }
    .vital { background:rgba(42,74,56,0.05);border:1px solid rgba(42,74,56,0.1);border-radius:8px;padding:8px;text-align:center; span{font-size:10px;color:#7A8A82;display:block;text-transform:uppercase;} strong{font-size:13px;color:#2A4A38;font-family:'JetBrains Mono',monospace;} }
    .prescription-badge { padding:8px 12px;background:rgba(61,107,79,0.08);border:1px solid rgba(61,107,79,0.2);border-radius:8px;font-size:13px;color:#3A5248; }
    .entry-meta { flex-shrink:0;text-align:right; }

    .doc-list { display:flex;flex-direction:column;gap:8px; }
    .doc-item { padding:14px 16px;display:flex;align-items:center;gap:12px; }
    .doc-icon { width:36px;height:36px;border-radius:8px;background:rgba(201,99,60,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;color:#C9633C; }
    .doc-thumbnail { width:36px;height:36px;object-fit:cover;border-radius:8px; }
    .doc-info { flex:1;min-width:0; }
    .doc-name { font-size:13px;font-weight:600;color:#1B2520;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
    .doc-meta { font-size:11px;color:#7A8A82;margin-top:2px; }
    .section-title { display:flex;justify-content:space-between;align-items:center;margin-bottom:14px; h3{font-size:16px;font-weight:600;color:#1B2520;} }
    .upload-label.uploading { opacity:.7;pointer-events:none; }
    .spinner-sm { width:12px;height:12px;border:2px solid rgba(0,0,0,0.2);border-top-color:#2A4A38;border-radius:50%;animation:spin-sm .7s linear infinite;display:inline-block;vertical-align:middle; }
    @keyframes spin-sm { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  `],
})
export class PatientDossierComponent implements OnInit {
  private _patient      = signal<any>(null);
  private _records      = signal<any[]>([]);
  private _documents    = signal<any[]>([]);
  private _loadingRecords = signal(true);
  private _expandedId   = signal<string | null>(null);
  private _uploading    = signal(false);
  private _labResults   = signal<any[]>([]);

  readonly patient        = this._patient.asReadonly();
  readonly records        = this._records.asReadonly();
  readonly documents      = this._documents.asReadonly();
  readonly loadingRecords = this._loadingRecords.asReadonly();
  readonly expandedId     = this._expandedId.asReadonly();
  readonly uploading      = this._uploading.asReadonly();
  readonly labResults     = this._labResults.asReadonly();

  constructor(
    private api: ApiService,
    private authService: AuthService,
    private notifSvc: NotificationService,
  ) {}

  ngOnInit(): void {
    this.api.get<any>('/patients/me').subscribe(res => {
      this._patient.set(res.data);
      const patientId = res.data.id;
      this.loadRecords(patientId);
      this.api.get<any>(`/patients/${patientId}/lab-results`).subscribe({
        next: (r) => this._labResults.set(r.data || []),
      });
    });
  }

  private loadRecords(patientId: string): void {
    this.api.get<any>(`/patients/${patientId}/records`).subscribe({
      next: (res) => { this._records.set(res.data || []); this._loadingRecords.set(false); },
      error: () => this._loadingRecords.set(false),
    });
  }

  expandRecord(id: string): void {
    this._expandedId.update(v => v === id ? null : id);
  }

  formatBloodType(bt: string): string {
    if (!bt) return '';
    return bt.replace('_POS', '+').replace('_NEG', '-');
  }

  isImageDoc(doc: any): boolean {
    const ext = doc.fileName?.split('.').pop()?.toLowerCase();
    return doc.fileType?.includes('image') || ['jpg', 'jpeg', 'png'].includes(ext || '');
  }

  getDocIcon(mimeType: string, fileName?: string): string {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    if (ext === 'dcm' || ext === 'dicom' || mimeType?.includes('dicom')) return 'scan';
    if (mimeType?.includes('pdf') || ext === 'pdf') return 'file-text';
    if (mimeType?.includes('image') || ['jpg','jpeg','png'].includes(ext || '')) return 'image';
    return 'folder';
  }

  formatSize(bytes: number): string {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  uploadDoc(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const MAX_BYTES = 20 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      this.notifSvc.showToast('Fichier trop volumineux — limite 20 Mo', 'error');
      input.value = '';
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    const ALLOWED = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'dcm', 'dicom'];
    if (!ALLOWED.includes(ext)) {
      this.notifSvc.showToast('Format non autorisé (PDF, JPG, PNG, DOC, DOCX, DCM)', 'error');
      input.value = '';
      return;
    }

    const patientId = this._patient()?.id;
    if (!patientId) return;

    this._uploading.set(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('documentType', ['dcm', 'dicom'].includes(ext) ? 'IMAGING' : 'OTHER');

    this.api.upload<any>(`/patients/${patientId}/documents`, fd).subscribe({
      next: (res) => {
        this._documents.update(d => [res.data, ...d]);
        this._uploading.set(false);
        this.notifSvc.showToast('Document importé avec succès', 'success');
        input.value = '';
      },
      error: (err) => {
        this._uploading.set(false);
        this.notifSvc.showToast(err.error?.message || "Échec de l'importation", 'error');
        input.value = '';
      },
    });
  }
}
