import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { LucideAngularModule } from 'lucide-angular';

type StaffRole = 'DOCTOR' | 'SECRETARY';

interface StaffForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: StaffRole;
  specialty?: string;
  phone?: string;
  consultationFee?: number | null;
}

@Component({
  selector: 'app-admin-staff',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, TopbarComponent, LucideAngularModule],
  template: `
    <app-sidebar />
    <app-topbar />
    <main class="page-wrapper">
      <div class="page-content">

        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
          <div>
            <h2 style="font-family:'Fraunces',Georgia,serif;">Gestion du personnel</h2>
            <p style="color:#7A8A82;font-size:13px;margin-top:4px;">{{ staff().length }} membres du personnel actifs</p>
          </div>
          <button class="btn-primary" (click)="openModal()">+ Ajouter</button>
        </div>

        <!-- Role filter tabs -->
        <div class="role-tabs" style="margin-bottom:20px;">
          @for (tab of tabs; track tab.value) {
            <button class="role-tab" [class.active]="activeTab() === tab.value" (click)="setTab(tab.value)" style="display:inline-flex;align-items:center;gap:6px;">
              <lucide-icon [name]="tab.icon" [size]="14" /> {{ tab.label }}
              <span class="tab-count">{{ countByRole(tab.value) }}</span>
            </button>
          }
        </div>

        <div class="glass-card" style="padding:0;overflow:hidden;">
          <table class="ms-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Rôle</th>
                <th>E-mail</th>
                @if (activeTab() === 'DOCTOR') { <th>Spécialité</th><th>Tarif</th> }
                <th>Téléphone</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (s of filteredStaff(); track s.id) {
                <tr>
                  <td>
                    <div style="display:flex;align-items:center;gap:10px;">
                      <div class="avatar-circle" [style.background]="s.role === 'DOCTOR' ? 'rgba(42,74,56,0.1)' : 'rgba(201,99,60,0.1)'">
                        {{ s.firstName[0] }}{{ s.lastName[0] }}
                      </div>
                      <div>
                        <strong style="color:#1B2520;">{{ s.firstName }} {{ s.lastName }}</strong>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge" [class]="s.role === 'DOCTOR' ? 'confirmed' : 'pending'">
                      @if (s.role === 'DOCTOR') { <lucide-icon name="stethoscope" [size]="13" style="margin-right:3px;vertical-align:middle;" /> Médecin }
                      @else { <lucide-icon name="clipboard-list" [size]="13" style="margin-right:3px;vertical-align:middle;" /> Secrétaire }
                    </span>
                  </td>
                  <td style="color:#7A8A82;font-size:12px;">{{ s.user?.email }}</td>
                  @if (activeTab() === 'DOCTOR') {
                    <td style="color:#3A5248;">{{ s.specialty || '—' }}</td>
                    <td style="font-family:'JetBrains Mono',monospace;color:#3D6B4F;font-size:12px;">
<<<<<<< HEAD
                      {{ s.consultationFee != null ? (s.consultationFee + ' DH') : '—' }}
=======
                      {{ s.consultationFee != null ? (s.consultationFee + ' €') : '—' }}
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
                    </td>
                  }
                  <td style="color:#7A8A82;">{{ s.phone || '—' }}</td>
                  <td>
                    <span class="badge completed">Actif</span>
                  </td>
                  <td>
                    <div style="display:flex;gap:6px;">
                      <button class="btn-secondary" style="font-size:11px;padding:5px 10px;" (click)="editStaff(s)">Modifier</button>
                      <button class="btn-danger" style="font-size:11px;padding:5px 10px;" (click)="deleteStaff(s.id, s.role)">Retirer</button>
                    </div>
                  </td>
                </tr>
              }
              @empty {
                <tr><td colspan="7" style="text-align:center;color:#7A8A82;padding:40px;">Aucun membre du personnel trouvé</td></tr>
              }
            </tbody>
          </table>
        </div>

      </div>
    </main>

    @if (showModal()) {
      <div class="overlay" (click)="closeModal()">
        <div class="glass-card modal-card" (click)="$event.stopPropagation()">
          <h3 style="font-family:'Fraunces',Georgia,serif;margin-bottom:20px;">
            {{ editingId() ? 'Modifier le membre' : 'Ajouter un membre' }}
          </h3>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
            <div class="form-group">
              <label>Prénom</label>
              <input class="glass-input" [(ngModel)]="form.firstName" placeholder="Jean" />
            </div>
            <div class="form-group">
              <label>Nom</label>
              <input class="glass-input" [(ngModel)]="form.lastName" placeholder="Dupont" />
            </div>
            <div class="form-group">
              <label>E-mail</label>
              <input class="glass-input" type="email" [(ngModel)]="form.email" placeholder="jean@medisync.fr" />
            </div>
            @if (!editingId()) {
              <div class="form-group">
                <label>Mot de passe</label>
                <input class="glass-input" type="password" [(ngModel)]="form.password" placeholder="••••••••" />
              </div>
            }
            <div class="form-group">
              <label>Rôle</label>
              <select class="glass-input" [(ngModel)]="form.role">
                <option value="DOCTOR">Médecin</option>
                <option value="SECRETARY">Secrétaire</option>
              </select>
            </div>
            <div class="form-group">
              <label>Téléphone</label>
              <input class="glass-input" [(ngModel)]="form.phone" placeholder="+212 6 00 00 00 00" />
            </div>
            @if (form.role === 'DOCTOR') {
              <div class="form-group">
                <label>Spécialité</label>
                <input class="glass-input" [(ngModel)]="form.specialty" placeholder="ex. Cardiologie, Neurologie..." />
              </div>
              <div class="form-group">
<<<<<<< HEAD
                <label>Tarif de consultation (DH)</label>
=======
                <label>Tarif de consultation (€)</label>
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
                <input class="glass-input" type="number" min="0" step="5" [(ngModel)]="form.consultationFee" placeholder="ex. 80" />
              </div>
            }
          </div>

          <div style="display:flex;gap:10px;margin-top:20px;justify-content:flex-end;">
            <button class="btn-secondary" (click)="closeModal()">Annuler</button>
            <button class="btn-primary" (click)="saveStaff()" [disabled]="saving()">
              {{ saving() ? 'Enregistrement...' : (editingId() ? 'Mettre à jour' : 'Créer') }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .overlay { position:fixed;inset:0;background:rgba(27,37,32,0.45);backdrop-filter:blur(4px);z-index:200;display:flex;align-items:center;justify-content:center;padding:24px; }
    .modal-card { width:560px;max-width:95vw;padding:28px; }
    .role-tabs { display:flex;gap:8px; }
    .role-tab { padding:8px 18px;border-radius:8px;border:1px solid rgba(42,74,56,0.1);background:transparent;color:#7A8A82;cursor:pointer;font-size:13px;font-weight:600;display:flex;align-items:center;gap:8px;transition:all .2s; }
    .role-tab.active { background:rgba(42,74,56,0.1);border-color:rgba(42,74,56,0.4);color:#2A4A38; }
    .role-tab:hover:not(.active) { border-color:rgba(0,212,255,0.25);color:#3A5248; }
    .tab-count { background:rgba(42,74,56,0.1);color:#2A4A38;border-radius:999px;padding:1px 7px;font-size:11px; }
    .avatar-circle { width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#3A5248;flex-shrink:0; }
  `],
})
export class AdminStaffComponent implements OnInit {
  private _staff = signal<any[]>([]);
  readonly staff = this._staff.asReadonly();

  activeTab   = signal<string>('ALL');
  showModal   = signal(false);
  editingId   = signal<string | null>(null);
  saving      = signal(false);

  form: StaffForm = { firstName: '', lastName: '', email: '', password: '', role: 'DOCTOR', specialty: '', phone: '', consultationFee: null };

  tabs = [
    { value: 'ALL',       label: 'Tout le personnel', icon: 'users' },
    { value: 'DOCTOR',    label: 'Médecins',          icon: 'stethoscope' },
    { value: 'SECRETARY', label: 'Secrétaires',       icon: 'clipboard-list' },
  ];

  constructor(private api: ApiService, private notif: NotificationService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
<<<<<<< HEAD
    this.api.get<any>('/admin/staff').subscribe({
      next: res => this._staff.set(res.data || []),
      error: () => {},
    });
=======
    this.api.get<any>('/admin/staff').subscribe(res => this._staff.set(res.data || []));
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
  }

  filteredStaff() {
    const tab = this.activeTab();
    if (tab === 'ALL') return this._staff();
    return this._staff().filter(s => s.role === tab);
  }

  countByRole(role: string): number {
    if (role === 'ALL') return this._staff().length;
    return this._staff().filter(s => s.role === role).length;
  }

  setTab(v: string): void { this.activeTab.set(v); }

  openModal(): void {
    this.editingId.set(null);
    this.form = { firstName: '', lastName: '', email: '', password: '', role: 'DOCTOR', specialty: '', phone: '', consultationFee: null };
    this.showModal.set(true);
  }

  editStaff(s: any): void {
    this.editingId.set(s.id);
    this.form = { firstName: s.firstName, lastName: s.lastName, email: s.user?.email || '', password: '', role: s.role, specialty: s.specialty || '', phone: s.phone || '', consultationFee: s.consultationFee ?? null };
    this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); }

  saveStaff(): void {
    this.saving.set(true);
    const id = this.editingId();
    const req = id
      ? this.api.put<any>(`/admin/staff/${id}`, this.form)
      : this.api.post<any>('/admin/staff', this.form);

    req.subscribe({
      next: () => {
<<<<<<< HEAD
        this.saving.set(false);
=======
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
        this.notif.showToast(id ? 'Membre mis à jour' : 'Membre créé', 'success');
        this.closeModal();
        this.load();
      },
<<<<<<< HEAD
      error: (err: any) => {
        this.saving.set(false);
        const msg = err?.error?.errors?.[0]?.message || err?.error?.message || 'Opération échouée';
        this.notif.showToast(msg, 'error');
      },
=======
      error: () => this.notif.showToast('Opération échouée', 'error'),
      complete: () => this.saving.set(false),
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
    });
  }

  deleteStaff(id: string, role: string): void {
    if (!confirm('Retirer ce membre du personnel ? Cette action est irréversible.')) return;
    this.api.delete<any>(`/admin/staff/${id}`).subscribe({
      next: () => {
        this._staff.update(list => list.filter(s => s.id !== id));
        this.notif.showToast('Membre retiré', 'info');
      },
    });
  }
}
