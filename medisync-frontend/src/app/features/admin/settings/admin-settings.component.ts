import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, TopbarComponent, LucideAngularModule],
  template: `
    <app-sidebar />
    <app-topbar />
    <main class="page-wrapper">
      <div class="page-content">

        <div style="margin-bottom:28px;">
          <h2 style="font-family:'Fraunces',Georgia,serif;">Paramètres du système</h2>
          <p style="color:#7A8A82;font-size:13px;margin-top:4px;">Configurer la clinique et les préférences système</p>
        </div>

        @if (needs2FASetup()) {
          <div style="display:flex;align-items:center;gap:14px;padding:14px 20px;background:rgba(194,64,64,0.08);border:1px solid rgba(194,64,64,0.3);border-radius:12px;margin-bottom:24px;">
            <lucide-icon name="shield-alert" [size]="20" style="color:#C24040;flex-shrink:0;" />
            <div style="flex:1;">
              <p style="font-size:13px;font-weight:700;color:#C24040;">Double authentification requise</p>
              <p style="font-size:12px;color:#7A8A82;margin-top:2px;">En tant qu'administrateur, vous devez activer la 2FA pour sécuriser votre compte et accéder à toutes les fonctionnalités.</p>
            </div>
            <button class="btn-primary" style="font-size:12px;padding:7px 16px;white-space:nowrap;background:linear-gradient(135deg,#C24040,#9B2020);" (click)="activeSection.set('security')">
              Configurer maintenant
            </button>
          </div>
        }

        <div style="display:grid;grid-template-columns:240px 1fr;gap:24px;align-items:start;">

          <!-- Settings nav -->
          <div class="settings-nav glass-card" style="padding:8px;">
            @for (section of sections; track section.id) {
              <button class="settings-nav-item" [class.active]="activeSection() === section.id" (click)="activeSection.set(section.id)">
                <lucide-icon [name]="section.icon" [size]="16" style="flex-shrink:0;" />
                {{ section.label }}
              </button>
            }
          </div>

          <!-- Content panel -->
          <div class="glass-card" style="padding:28px;">

            @switch (activeSection()) {

              @case ('clinic') {
                <h3 class="section-header">Informations de la clinique</h3>
                <div class="settings-form">
                  <div class="form-group">
                    <label>Nom de la clinique</label>
                    <input class="glass-input" [(ngModel)]="settings.clinicName" placeholder="MediSync Clinique" />
                  </div>
                  <div class="form-group">
                    <label>Adresse</label>
                    <input class="glass-input" [(ngModel)]="settings.address" placeholder="123 Avenue de la Médecine" />
                  </div>
                  <div class="form-group">
                    <label>Téléphone</label>
                    <input class="glass-input" [(ngModel)]="settings.phone" placeholder="+212 5 22 00 00 00" />
                  </div>
                  <div class="form-group">
                    <label>E-mail</label>
                    <input class="glass-input" type="email" [(ngModel)]="settings.email" placeholder="contact@clinique.ma" />
                  </div>
                  <div class="form-group">
                    <label>Fuseau horaire</label>
                    <select class="glass-input" [(ngModel)]="settings.timezone">
                      <option value="Africa/Casablanca">Africa/Casablanca (WET)</option>
                      <option value="Europe/Paris">Europe/Paris (CET)</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Spécialités proposées</label>
                    <input class="glass-input" [(ngModel)]="settings.specialties" placeholder="ex. Cardiologie, Neurologie, Pédiatrie..." />
                  </div>
                  <div>
                    <p style="font-size:11px;font-weight:700;color:#3A5248;text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px;">Horaires d'ouverture</p>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                      <div class="form-group">
                        <label>Ouverture</label>
                        <input class="glass-input" type="time" [(ngModel)]="settings.openingTime" />
                      </div>
                      <div class="form-group">
                        <label>Fermeture</label>
                        <input class="glass-input" type="time" [(ngModel)]="settings.closingTime" />
                      </div>
                    </div>
                    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;">
                      @for (day of weekDays; track day.key) {
                        <label style="display:flex;align-items:center;gap:5px;font-size:12px;color:#3A5248;cursor:pointer;padding:5px 10px;border:1px solid rgba(42,74,56,0.15);border-radius:8px;"
                               [style.background]="settings.openDays[day.key] ? 'rgba(42,74,56,0.1)' : 'transparent'"
                               [style.border-color]="settings.openDays[day.key] ? 'rgba(42,74,56,0.4)' : 'rgba(42,74,56,0.15)'">
                          <input type="checkbox" [(ngModel)]="settings.openDays[day.key]" style="accent-color:#2A4A38;" />
                          {{ day.label }}
                        </label>
                      }
                    </div>
                  </div>
                </div>
              }

              @case ('appointments') {
                <h3 class="section-header">Paramètres des rendez-vous</h3>
                <div class="settings-form">
                  <div class="form-group">
                    <label>Durée par défaut (minutes)</label>
                    <input class="glass-input" type="number" [(ngModel)]="settings.apptDuration" min="15" step="15" />
                  </div>
                  <div class="form-group">
                    <label>Max RDV par jour (par médecin)</label>
                    <input class="glass-input" type="number" [(ngModel)]="settings.maxApptPerDay" min="1" />
                  </div>
                  <div class="form-group">
                    <label>Délai d'annulation (heures avant)</label>
                    <input class="glass-input" type="number" [(ngModel)]="settings.cancelWindow" min="1" />
                  </div>
                  <div class="toggle-row">
                    <div>
                      <p style="font-size:13px;font-weight:600;color:#3A5248;">Confirmation automatique</p>
                      <p style="font-size:12px;color:#7A8A82;">Confirmer les réservations sans validation secrétaire</p>
                    </div>
                    <div class="toggle" [class.on]="settings.autoConfirm" (click)="settings.autoConfirm = !settings.autoConfirm">
                      <div class="toggle-thumb"></div>
                    </div>
                  </div>
                  <div class="toggle-row">
                    <div>
                      <p style="font-size:13px;font-weight:600;color:#3A5248;">Rappels par e-mail</p>
                      <p style="font-size:12px;color:#7A8A82;">Envoyer un e-mail 24h avant le rendez-vous</p>
                    </div>
                    <div class="toggle" [class.on]="settings.emailReminders" (click)="settings.emailReminders = !settings.emailReminders">
                      <div class="toggle-thumb"></div>
                    </div>
                  </div>
                </div>
              }

              @case ('billing') {
                <h3 class="section-header">Facturation & Finance</h3>
                <div class="settings-form">
                  <div class="form-group">
                    <label>Devise</label>
                    <select class="glass-input" [(ngModel)]="settings.currency">
                      <option value="MAD">MAD (DH)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="USD">USD ($)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Tarif consultation par défaut (DH)</label>
                    <input class="glass-input" type="number" [(ngModel)]="settings.defaultFee" min="0" step="0.5" />
                  </div>
                  <div class="form-group">
                    <label>Taux TVA (%)</label>
                    <input class="glass-input" type="number" [(ngModel)]="settings.vatRate" min="0" max="100" step="0.5" />
                  </div>
                  <div class="form-group">
                    <label>Note de bas de facture</label>
                    <textarea class="glass-input" style="height:80px;resize:none;" [(ngModel)]="settings.invoiceNote" placeholder="Merci de votre visite..."></textarea>
                  </div>
                </div>
              }

              @case ('pricing') {
                <h3 class="section-header">Tarification par secteur</h3>
                <div class="settings-form">
                  <p style="font-size:13px;color:#3A5248;line-height:1.6;">
                    Définissez les tarifs de base par secteur conventionnel et par type de consultation.
                  </p>

                  <!-- Sector base rates -->
                  <div class="sector-rates-grid">
                    <div class="sector-card sector1-card">
                      <p class="sector-label">Secteur 1</p>
                      <p class="sector-desc">Conventionné strict</p>
                      <div style="display:flex;align-items:center;gap:6px;margin-top:8px;">
                        <input type="number" class="glass-input" style="text-align:right;" [(ngModel)]="settings.sector1Rate" min="0" step="0.5" />
                        <span style="font-size:12px;color:#7A8A82;white-space:nowrap;">DH / consult.</span>
                      </div>
                    </div>
                    <div class="sector-card sector2-card">
                      <p class="sector-label">Secteur 2</p>
                      <p class="sector-desc">Honoraires libres</p>
                      <div style="display:flex;align-items:center;gap:6px;margin-top:8px;">
                        <input type="number" class="glass-input" style="text-align:right;" [(ngModel)]="settings.sector2Rate" min="0" step="0.5" />
                        <span style="font-size:12px;color:#7A8A82;white-space:nowrap;">DH / consult.</span>
                      </div>
                    </div>
                    <div class="sector-card sector3-card">
                      <p class="sector-label">Secteur 3</p>
                      <p class="sector-desc">Non conventionné</p>
                      <div style="display:flex;align-items:center;gap:6px;margin-top:8px;">
                        <input type="number" class="glass-input" style="text-align:right;" [(ngModel)]="settings.sector3Rate" min="0" step="0.5" />
                        <span style="font-size:12px;color:#7A8A82;white-space:nowrap;">DH / consult.</span>
                      </div>
                    </div>
                  </div>

                  <!-- Consultation types table -->
                  <div>
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                      <p style="font-size:13px;font-weight:700;color:#1B2520;">Actes et consultations</p>
                      <button class="btn-secondary" style="font-size:11px;padding:5px 12px;" (click)="addConsultType()">+ Ajouter un acte</button>
                    </div>
                    <div style="overflow-x:auto;">
                      <table class="pricing-table">
                        <thead>
                          <tr>
                            <th style="text-align:left;min-width:180px;">Type d'acte</th>
                            <th>Secteur 1 (DH)</th>
                            <th>Secteur 2 (DH)</th>
                            <th>Secteur 3 (DH)</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          @for (ct of settings.consultationTypes; track $index; let i = $index) {
                            <tr>
                              <td><input class="glass-input pricing-input" [(ngModel)]="settings.consultationTypes[i].name" placeholder="Nom de l'acte" /></td>
                              <td><input class="glass-input pricing-input" type="number" [(ngModel)]="settings.consultationTypes[i].s1" min="0" step="0.5" style="text-align:right;" /></td>
                              <td><input class="glass-input pricing-input" type="number" [(ngModel)]="settings.consultationTypes[i].s2" min="0" step="0.5" style="text-align:right;" /></td>
                              <td><input class="glass-input pricing-input" type="number" [(ngModel)]="settings.consultationTypes[i].s3" min="0" step="0.5" style="text-align:right;" /></td>
                              <td style="text-align:center;">
                                <button class="row-del-btn" (click)="removeConsultType(i)" [disabled]="settings.consultationTypes.length === 1">×</button>
                              </td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              }

              @case ('permissions') {
                <h3 class="section-header">Permissions par rôle</h3>
                <div class="settings-form">
                  <p style="font-size:13px;color:#3A5248;line-height:1.6;">
                    Définissez les droits d'accès par module pour chaque rôle. Les administrateurs disposent de tous les droits.
                  </p>

                  <div style="overflow-x:auto;">
                    <table class="perm-table">
                      <thead>
                        <tr>
                          <th style="text-align:left;min-width:140px;">Module</th>
                          <th colspan="3" style="background:rgba(42,74,56,0.06);border-radius:8px 8px 0 0;"><span style="display:inline-flex;align-items:center;gap:5px;"><lucide-icon name="stethoscope" [size]="13" /> Médecin</span></th>
                          <th style="width:16px;background:transparent;border:none;"></th>
                          <th colspan="3" style="background:rgba(201,99,60,0.06);border-radius:8px 8px 0 0;"><span style="display:inline-flex;align-items:center;gap:5px;"><lucide-icon name="clipboard-list" [size]="13" /> Secrétaire</span></th>
                        </tr>
                        <tr class="perm-subheader">
                          <th></th>
                          <th>Voir</th><th>Modifier</th><th>Supprimer</th>
                          <th style="border:none;background:transparent;"></th>
                          <th>Voir</th><th>Modifier</th><th>Supprimer</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (mod of permModules; track mod.key) {
                          <tr class="perm-row">
                            <td class="perm-module">{{ mod.label }}</td>
                            <td class="perm-cell"><input type="checkbox" [(ngModel)]="settings.permissions[mod.key].DOCTOR.view" class="perm-check" /></td>
                            <td class="perm-cell"><input type="checkbox" [(ngModel)]="settings.permissions[mod.key].DOCTOR.edit" class="perm-check" /></td>
                            <td class="perm-cell"><input type="checkbox" [(ngModel)]="settings.permissions[mod.key].DOCTOR.delete" class="perm-check" /></td>
                            <td style="border:none;background:transparent;"></td>
                            <td class="perm-cell sec"><input type="checkbox" [(ngModel)]="settings.permissions[mod.key].SECRETARY.view" class="perm-check" /></td>
                            <td class="perm-cell sec"><input type="checkbox" [(ngModel)]="settings.permissions[mod.key].SECRETARY.edit" class="perm-check" /></td>
                            <td class="perm-cell sec"><input type="checkbox" [(ngModel)]="settings.permissions[mod.key].SECRETARY.delete" class="perm-check" /></td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>

                  <p style="font-size:11px;color:#7A8A82;margin-top:4px;">
                    ℹ Les modifications sont appliquées après sauvegarde.
                  </p>
                </div>
              }

              @case ('rooms') {
                <h3 class="section-header">Salles &amp; Équipements</h3>
                <div class="settings-form">
                  <p style="font-size:13px;color:#3A5248;line-height:1.6;">
                    Gérez les salles de consultation disponibles et leur équipement.
                  </p>

                  <!-- Add room form -->
                  <div class="room-add-form glass-card" style="padding:16px;background:rgba(42,74,56,0.03);">
                    <p style="font-size:12px;font-weight:700;color:#3A5248;margin-bottom:12px;">Ajouter une salle</p>
                    <div style="display:grid;grid-template-columns:1fr 100px;gap:10px;margin-bottom:10px;">
                      <div class="form-group">
                        <label>Nom de la salle</label>
                        <input class="glass-input" [(ngModel)]="roomForm.name" placeholder="ex. Salle 1, Salle Cardiologie..." />
                      </div>
                      <div class="form-group">
                        <label>Capacité</label>
                        <input class="glass-input" type="number" [(ngModel)]="roomForm.capacity" min="1" max="20" />
                      </div>
                    </div>
                    <div class="form-group" style="margin-bottom:12px;">
                      <label>Équipements (séparés par des virgules)</label>
                      <input class="glass-input" [(ngModel)]="roomForm.equipment" placeholder="ex. ECG, Tensiomètre, Défibrillateur" />
                    </div>
                    <button class="btn-primary" style="font-size:12px;padding:7px 16px;" (click)="addRoom()" [disabled]="!roomForm.name.trim() || savingRoom()">
                      {{ savingRoom() ? 'Ajout...' : '+ Ajouter la salle' }}
                    </button>
                  </div>

                  <!-- Room list -->
                  @if (rooms().length > 0) {
                    <div class="rooms-grid">
                      @for (r of rooms(); track r.id) {
                        <div class="room-card">
                          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
                            <div>
                              <p style="font-size:14px;font-weight:700;color:#1B2520;">{{ r.name }}</p>
                              <p style="font-size:11px;color:#7A8A82;margin-top:2px;">
                                <span style="background:rgba(42,74,56,0.1);border-radius:999px;padding:1px 8px;font-size:10px;font-weight:600;color:#2A4A38;">
                                  {{ r.capacity }} {{ r.capacity > 1 ? 'places' : 'place' }}
                                </span>
                              </p>
                            </div>
                            <button class="row-del-btn" (click)="deleteRoom(r.id)">×</button>
                          </div>
                          @if (r.equipment?.length > 0) {
                            <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:10px;">
                              @for (eq of r.equipment; track eq) {
                                <span class="equip-tag">{{ eq }}</span>
                              }
                            </div>
                          }
                        </div>
                      }
                    </div>
                  } @else {
                    <div style="text-align:center;color:#7A8A82;padding:32px;border:1px dashed rgba(42,74,56,0.2);border-radius:12px;">
                      Aucune salle configurée — ajoutez votre première salle ci-dessus.
                    </div>
                  }
                </div>
              }

              @case ('security') {
                <h3 class="section-header">Sécurité & Accès</h3>
                <div class="settings-form">
                  <div class="toggle-row">
                    <div>
                      <p style="font-size:13px;font-weight:600;color:#3A5248;">2FA obligatoire pour les admins</p>
                      <p style="font-size:12px;color:#7A8A82;">Tous les comptes admin doivent activer l'authentification à deux facteurs</p>
                    </div>
                    <div class="toggle" [class.on]="settings.require2FA" (click)="settings.require2FA = !settings.require2FA">
                      <div class="toggle-thumb"></div>
                    </div>
                  </div>

                  <!-- TOTP Setup -->
                  <div class="totp-card">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
                      <div>
                        <p style="font-size:13px;font-weight:600;color:#3A5248;">Authentification TOTP (application)</p>
                        <p style="font-size:12px;color:#7A8A82;margin-top:2px;">Configurez votre compte avec Google Authenticator ou Authy</p>
                      </div>
                      @if (!totpSetup()) {
                        <button class="btn-secondary" style="font-size:12px;padding:6px 14px;white-space:nowrap;" (click)="startTotpSetup()" [disabled]="loadingTotp()">
                          @if (!loadingTotp()) { <lucide-icon name="key" [size]="13" style="margin-right:4px;" /> } {{ loadingTotp() ? 'Chargement...' : 'Configurer' }}
                        </button>
                      }
                    </div>

                    @if (totpSetup()) {
                      <div style="margin-top:16px;display:flex;gap:20px;align-items:flex-start;flex-wrap:wrap;">
                        <div style="border:2px solid rgba(42,74,56,0.15);border-radius:10px;padding:8px;background:white;flex-shrink:0;">
                          <img [src]="totpSetup()!.qrCodeUrl" alt="QR Code TOTP" width="140" height="140"
                               style="display:block;border-radius:4px;" />
                        </div>
                        <div style="flex:1;min-width:200px;">
                          <p style="font-size:11px;font-weight:700;color:#7A8A82;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px;">Clé secrète (saisie manuelle)</p>
                          <code style="display:block;background:rgba(42,74,56,0.06);border-radius:8px;padding:8px 12px;font-family:'JetBrains Mono',monospace;font-size:13px;color:#2A4A38;letter-spacing:.15em;word-break:break-all;">
                            {{ totpSetup()!.secret }}
                          </code>
                          <p style="font-size:11px;color:#7A8A82;margin-top:8px;">Scannez le QR avec votre application d'authentification, puis entrez le code à 6 chiffres pour valider.</p>
                          <div style="display:flex;gap:8px;margin-top:12px;align-items:center;">
                            <input class="glass-input" style="width:140px;font-family:'JetBrains Mono',monospace;letter-spacing:.2em;font-size:16px;text-align:center;"
                                   [(ngModel)]="totpCode" maxlength="6" placeholder="000000" />
                            <button class="btn-primary" style="font-size:12px;padding:7px 16px;" (click)="verifyTotp()" [disabled]="totpCode.length !== 6 || verifyingTotp()">
                              {{ verifyingTotp() ? 'Vérification...' : '✓ Activer' }}
                            </button>
                            <button class="btn-secondary" style="font-size:12px;padding:7px 12px;" (click)="cancelTotpSetup()">Annuler</button>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                  <div class="toggle-row">
                    <div>
                      <p style="font-size:13px;font-weight:600;color:#3A5248;">Liste blanche IP</p>
                      <p style="font-size:12px;color:#7A8A82;">Restreindre le panneau admin à des adresses IP spécifiques</p>
                    </div>
                    <div class="toggle" [class.on]="settings.ipAllowlist" (click)="settings.ipAllowlist = !settings.ipAllowlist">
                      <div class="toggle-thumb"></div>
                    </div>
                  </div>
                  <div class="form-group">
                    <label>Délai d'expiration de session (minutes)</label>
                    <input class="glass-input" type="number" [(ngModel)]="settings.sessionTimeout" min="5" />
                  </div>
                  <div class="form-group">
                    <label>Tentatives de connexion max.</label>
                    <input class="glass-input" type="number" [(ngModel)]="settings.maxLoginAttempts" min="3" max="20" />
                  </div>
                </div>
              }

            }

            <div style="margin-top:24px;display:flex;justify-content:flex-end;">
              <button class="btn-primary" (click)="save()" [disabled]="saving()">
                {{ saving() ? 'Enregistrement...' : '✓ Sauvegarder' }}
              </button>
            </div>

          </div>
        </div>

      </div>
    </main>
  `,
  styles: [`
    .settings-nav-item { display:flex;align-items:center;gap:10px;width:100%;padding:10px 14px;border-radius:8px;border:none;background:transparent;color:#7A8A82;cursor:pointer;font-size:13px;font-weight:500;text-align:left;transition:all .2s; }
    .settings-nav-item:hover { background:rgba(42,74,56,0.05);color:#3A5248; }
    .settings-nav-item.active { background:rgba(42,74,56,0.1);color:#2A4A38;font-weight:700; }
    .section-header { font-size:17px;font-weight:700;color:#1B2520;margin-bottom:20px;font-family:'Fraunces',Georgia,serif; }
    .settings-form { display:flex;flex-direction:column;gap:16px; }
    .toggle-row { display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-bottom:1px solid rgba(42,74,56,0.06); }
    .toggle { width:44px;height:24px;border-radius:999px;background:rgba(239,234,224,0.95);border:1px solid rgba(42,74,56,0.15);cursor:pointer;position:relative;transition:background .2s; }
    .toggle.on { background:rgba(61,107,79,0.2);border-color:rgba(0,245,160,0.4); }
    .toggle-thumb { position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#7A8A82;transition:all .2s;transform:translateX(0); }
    .toggle.on .toggle-thumb { background:#3D6B4F;transform:translateX(20px); }
    .sector-rates-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:12px; @media(max-width:600px){grid-template-columns:1fr;} }
    .sector-card { border-radius:12px;padding:16px;border:1px solid; }
    .sector1-card { background:rgba(42,74,56,0.05);border-color:rgba(42,74,56,0.2); }
    .sector2-card { background:rgba(184,121,42,0.05);border-color:rgba(184,121,42,0.2); }
    .sector3-card { background:rgba(194,64,64,0.04);border-color:rgba(194,64,64,0.15); }
    .sector-label { font-size:13px;font-weight:700;color:#1B2520; }
    .sector-desc { font-size:11px;color:#7A8A82;margin-top:2px; }
    .pricing-table { width:100%;border-collapse:collapse; }
    .pricing-table th { padding:8px 10px;background:rgba(42,74,56,0.05);font-size:11px;font-weight:700;color:#7A8A82;text-transform:uppercase;letter-spacing:.05em;text-align:center;border-bottom:1px solid rgba(42,74,56,0.1); }
    .pricing-table td { padding:6px 6px;border-bottom:1px solid rgba(42,74,56,0.06);vertical-align:middle;text-align:center; }
    .pricing-table tr:last-child td { border-bottom:none; }
    .pricing-input { padding:6px 8px;font-size:13px;min-width:0;width:100%; }
    .row-del-btn { background:none;border:1px solid rgba(194,64,64,0.25);border-radius:6px;color:#C24040;font-size:14px;width:26px;height:26px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all .2s; &:hover:not(:disabled){background:rgba(194,64,64,0.08);} &:disabled{opacity:.3;cursor:not-allowed;} }
    .perm-table { width:100%;border-collapse:separate;border-spacing:0;font-size:13px; }
    .perm-table thead th { padding:8px 14px;font-size:11px;font-weight:700;color:#7A8A82;text-transform:uppercase;letter-spacing:.05em;text-align:center; }
    .perm-subheader th { padding:6px 10px;font-size:10px;color:#7A8A82;text-align:center;border-bottom:1px solid rgba(42,74,56,0.1); }
    .perm-row { transition:background .15s; &:hover{background:rgba(42,74,56,0.03);} }
    .perm-module { padding:10px 14px;font-size:13px;font-weight:600;color:#1B2520;border-bottom:1px solid rgba(42,74,56,0.06); }
    .perm-cell { text-align:center;padding:8px;border-bottom:1px solid rgba(42,74,56,0.06);background:rgba(42,74,56,0.02); }
    .perm-cell.sec { background:rgba(201,99,60,0.02); }
    .perm-check { width:16px;height:16px;accent-color:#2A4A38;cursor:pointer; }
    .totp-card { border:1px solid rgba(42,74,56,0.15);border-radius:12px;padding:16px;background:rgba(42,74,56,0.02); }
    .rooms-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px; }
    .room-card { border:1px solid rgba(42,74,56,0.12);border-radius:12px;padding:14px;background:rgba(250,247,241,0.6); }
    .equip-tag { background:rgba(42,122,154,0.1);color:#2A7A9A;border-radius:999px;padding:2px 9px;font-size:10px;font-weight:600; }
  `],
})
export class AdminSettingsComponent implements OnInit {
  activeSection = signal('clinic');
  saving        = signal(false);
  needs2FASetup = signal(false);

  private _rooms = signal<any[]>([]);
  readonly rooms = this._rooms.asReadonly();
  savingRoom     = signal(false);
  roomForm       = { name: '', capacity: 1, equipment: '' };

  weekDays = [
    { key: 'mon', label: 'Lun' },
    { key: 'tue', label: 'Mar' },
    { key: 'wed', label: 'Mer' },
    { key: 'thu', label: 'Jeu' },
    { key: 'fri', label: 'Ven' },
    { key: 'sat', label: 'Sam' },
    { key: 'sun', label: 'Dim' },
  ];

  permModules = [
    { key: 'dashboard',    label: 'Tableau de bord' },
    { key: 'patients',     label: 'Patients'         },
    { key: 'appointments', label: 'Rendez-vous'      },
    { key: 'billing',      label: 'Facturation'      },
    { key: 'staff',        label: 'Personnel'        },
    { key: 'settings',     label: 'Paramètres'       },
  ];

  totpSetup      = signal<{ qrCodeUrl: string; secret: string } | null>(null);
  loadingTotp    = signal(false);
  verifyingTotp  = signal(false);
  totpCode       = '';

  settings: any = {
    clinicName: 'Clinique MediSync',
    address: '',
    phone: '',
    email: '',
    timezone: 'Africa/Casablanca',
    specialties: '',
    openingTime: '08:00',
    closingTime: '18:00',
    openDays: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false },
    apptDuration: 30,
    maxApptPerDay: 20,
    cancelWindow: 24,
    autoConfirm: false,
    emailReminders: true,
    currency: 'MAD',
    defaultFee: 50,
    vatRate: 20,
    invoiceNote: 'Merci de votre visite. Paiement dû sous 30 jours.',
    sector1Rate: 25,
    sector2Rate: 45,
    sector3Rate: 70,
    consultationTypes: [
      { name: 'Consultation standard',  s1: 25, s2: 45, s3: 70  },
      { name: 'Consultation longue',    s1: 50, s2: 80, s3: 110 },
      { name: 'Avis spécialisé',        s1: 50, s2: 85, s3: 120 },
      { name: 'Acte technique mineur',  s1: 30, s2: 50, s3: 75  },
    ],
    require2FA: false,
    ipAllowlist: false,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    permissions: {
      dashboard:    { DOCTOR: { view: true,  edit: false, delete: false }, SECRETARY: { view: true,  edit: false, delete: false } },
      patients:     { DOCTOR: { view: true,  edit: true,  delete: false }, SECRETARY: { view: true,  edit: true,  delete: false } },
      appointments: { DOCTOR: { view: true,  edit: true,  delete: false }, SECRETARY: { view: true,  edit: true,  delete: true  } },
      billing:      { DOCTOR: { view: false, edit: false, delete: false }, SECRETARY: { view: true,  edit: true,  delete: false } },
      staff:        { DOCTOR: { view: false, edit: false, delete: false }, SECRETARY: { view: false, edit: false, delete: false } },
      settings:     { DOCTOR: { view: false, edit: false, delete: false }, SECRETARY: { view: false, edit: false, delete: false } },
    },
  };

  sections = [
    { id: 'clinic',       label: 'Infos clinique',  icon: 'building-2' },
    { id: 'appointments', label: 'Rendez-vous',     icon: 'calendar' },
    { id: 'billing',      label: 'Facturation',     icon: 'banknote' },
    { id: 'pricing',      label: 'Tarification',    icon: 'circle-dollar-sign' },
    { id: 'rooms',        label: 'Salles',           icon: 'door-open' },
    { id: 'permissions',  label: 'Permissions',      icon: 'shield' },
    { id: 'security',     label: 'Sécurité',        icon: 'lock-keyhole' },
  ];

  constructor(
    private api: ApiService,
    private notif: NotificationService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user?.role === 'ADMIN' && !user?.twoFactorEnabled) {
        this.needs2FASetup.set(true);
      }
    } catch {}

    this.route.queryParams.subscribe(params => {
      if (params['section']) this.activeSection.set(params['section']);
    });

    this.api.get<any>('/admin/settings').subscribe({
      next: (res) => { if (res.data) Object.assign(this.settings, res.data); },
    });
    this.api.get<any>('/admin/permissions').subscribe({
      next: (res) => {
        if (res.data) this.settings.permissions = res.data;
      },
    });
    this.loadRooms();
  }

  loadRooms(): void {
    this.api.get<any>('/admin/rooms').subscribe({
      next: (res) => this._rooms.set(res.data || []),
    });
  }

  addRoom(): void {
    if (!this.roomForm.name.trim()) return;
    this.savingRoom.set(true);
    const equipment = this.roomForm.equipment.split(',').map((e: string) => e.trim()).filter(Boolean);
    this.api.post<any>('/admin/rooms', { name: this.roomForm.name, capacity: this.roomForm.capacity, equipment }).subscribe({
      next: (res) => {
        this._rooms.update(list => [...list, res.data || { id: Date.now().toString(), name: this.roomForm.name, capacity: this.roomForm.capacity, equipment }]);
        this.roomForm = { name: '', capacity: 1, equipment: '' };
        this.notif.showToast('Salle ajoutée', 'success');
      },
      error: () => this.notif.showToast('Échec de l\'ajout', 'error'),
      complete: () => this.savingRoom.set(false),
    });
  }

  startTotpSetup(): void {
    this.loadingTotp.set(true);
    this.api.get<any>('/admin/totp/setup').subscribe({
      next: (res) => {
        const secret = res.data?.secret || 'JBSWY3DPEHPK3PXP';
        const otpauth = `otpauth://totp/MediSync:admin?secret=${secret}&issuer=MediSync`;
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(otpauth)}`;
        this.totpSetup.set({ qrCodeUrl, secret });
        this.totpCode = '';
      },
      error: () => {
        const secret = 'JBSWY3DPEHPK3PXP';
        const otpauth = `otpauth://totp/MediSync:admin?secret=${secret}&issuer=MediSync`;
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(otpauth)}`;
        this.totpSetup.set({ qrCodeUrl, secret });
        this.totpCode = '';
      },
      complete: () => this.loadingTotp.set(false),
    });
  }

  verifyTotp(): void {
    if (this.totpCode.length !== 6) return;
    this.verifyingTotp.set(true);
    this.api.post<any>('/admin/totp/verify', { code: this.totpCode }).subscribe({
      next: () => {
        this.notif.showToast('2FA activé avec succès', 'success');
        this.totpSetup.set(null);
        this.settings.require2FA = true;
        this.needs2FASetup.set(false);
        try {
          const u = JSON.parse(localStorage.getItem('user') || '{}');
          localStorage.setItem('user', JSON.stringify({ ...u, twoFactorEnabled: true }));
        } catch {}
      },
      error: () => this.notif.showToast('Code invalide — réessayez', 'error'),
      complete: () => this.verifyingTotp.set(false),
    });
  }

  cancelTotpSetup(): void {
    this.totpSetup.set(null);
    this.totpCode = '';
  }

  deleteRoom(id: string): void {
    this.api.delete<any>(`/admin/rooms/${id}`).subscribe({
      next: () => {
        this._rooms.update(list => list.filter((r: any) => r.id !== id));
        this.notif.showToast('Salle supprimée', 'info');
      },
    });
  }

  addConsultType(): void {
    this.settings.consultationTypes.push({ name: '', s1: 0, s2: 0, s3: 0 });
  }

  removeConsultType(i: number): void {
    if (this.settings.consultationTypes.length > 1) {
      this.settings.consultationTypes.splice(i, 1);
    }
  }

  save(): void {
    this.saving.set(true);
    if (this.activeSection() === 'permissions') {
      const roles = ['DOCTOR', 'SECRETARY', 'PATIENT'] as const;
      const calls = roles.map(role =>
        this.api.put<any>(`/admin/permissions/${role}`, this.settings.permissions[role] || {})
      );
      let done = 0;
      for (const call of calls) {
        call.subscribe({
          next: () => { done++; if (done === roles.length) { this.saving.set(false); this.notif.showToast('Permissions sauvegardées', 'success'); } },
          error: () => { this.saving.set(false); this.notif.showToast('Échec de la sauvegarde', 'error'); },
        });
      }
      return;
    }
    this.api.put<any>('/admin/settings', this.settings).subscribe({
      next: () => { this.saving.set(false); this.notif.showToast('Paramètres sauvegardés', 'success'); },
      error: () => { this.saving.set(false); this.notif.showToast('Échec de la sauvegarde', 'error'); },
    });
  }
}
