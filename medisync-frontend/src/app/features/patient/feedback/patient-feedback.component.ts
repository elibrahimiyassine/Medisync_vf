import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-patient-feedback',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent, TopbarComponent, DatePipe, LucideAngularModule],
  template: `
    <app-sidebar />
    <app-topbar />
    <main class="page-wrapper">
      <div class="page-content">
        <h2 style="font-family:'Fraunces',Georgia,serif;margin-bottom:24px;">Évaluer vos consultations</h2>
        @for (appt of completedAppointments(); track appt.id) {
          <div class="review-card glass-card">
            <div class="review-top">
              <div style="display:flex;align-items:center;gap:12px;">
                <div class="doc-avatar">{{ appt.doctor.firstName[0] }}{{ appt.doctor.lastName[0] }}</div>
                <div>
                  <p style="font-weight:600;color:#1B2520;">Dr. {{ appt.doctor.firstName }} {{ appt.doctor.lastName }}</p>
                  <p style="font-size:12px;color:#7A8A82;">{{ appt.doctor.specialty }} · {{ appt.slot?.date | date:'d MMM yyyy' }}</p>
                </div>
              </div>
              @if (appt.review) {
                <span class="badge completed">Évalué ✓</span>
              }
            </div>
            @if (!appt.review) {
              <div class="rating-form">
                <p style="font-size:13px;color:#3A5248;margin-bottom:10px;">Comment s'est passée votre consultation ?</p>
                <div class="stars">
                  @for (s of [1,2,3,4,5]; track s) {
                    <button type="button" class="star-btn" [class.active]="getRating(appt.id) >= s" (click)="setRating(appt.id, s)">★</button>
                  }
                </div>
                <textarea class="glass-input" style="margin-top:10px;resize:none;height:80px;" placeholder="Partagez votre expérience (optionnel)..." (input)="setComment(appt.id, $event)"></textarea>
                <button class="btn-primary" style="margin-top:10px;font-size:13px;padding:9px 20px;" (click)="submitReview(appt)">Soumettre l'avis</button>
              </div>
            } @else {
              <div style="margin-top:12px;padding-top:12px;border-top:1px solid rgba(42,74,56,0.06);">
                <div class="stars" style="pointer-events:none;">
                  @for (s of [1,2,3,4,5]; track s) {
                    <span class="star-btn" [class.active]="appt.review.rating >= s">★</span>
                  }
                </div>
                @if (appt.review.comment) {
                  <p style="margin-top:8px;font-size:13px;color:#3A5248;font-style:italic;">"{{ appt.review.comment }}"</p>
                }
              </div>
            }
          </div>
        }
        @if (completedAppointments().length === 0) {
          <div class="glass-card" style="padding:60px;text-align:center;color:#7A8A82;">
            <lucide-icon name="star" [size]="36" style="color:#B8792A;" />
            <p style="margin-top:12px;">Aucune consultation terminée à évaluer pour le moment</p>
          </div>
        }
      </div>
    </main>
  `,
  styles: [`
    .review-card { padding:20px;margin-bottom:14px; }
    .review-top { display:flex;justify-content:space-between;align-items:center;margin-bottom:14px; }
    .doc-avatar { width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#2A4A38,#C9633C);display:flex;align-items:center;justify-content:center;font-weight:700;color:white;font-size:13px; }
    .rating-form { display:flex;flex-direction:column; }
    .stars { display:flex;gap:4px; }
    .star-btn { font-size:28px;background:none;border:none;cursor:pointer;color:#A8B8B0;transition:color .15s;line-height:1; &.active{color:#B8792A;} &:hover{color:#B8792A;} }
  `],
})
export class PatientFeedbackComponent implements OnInit {
  private _appointments = signal<any[]>([]);
  readonly completedAppointments = this._appointments.asReadonly();

  private _ratings  = signal<Record<string, number>>({});
  private _comments = signal<Record<string, string>>({});

  constructor(private api: ApiService, private notifSvc: NotificationService) {}

  ngOnInit(): void {
    this.api.get<any>('/appointments', { status: 'COMPLETED' }).subscribe(res => {
      this._appointments.set((res.data || []).filter((a: any) => a.status === 'COMPLETED'));
    });
  }

  getRating(id: string): number { return this._ratings()[id] || 0; }

  setRating(id: string, r: number): void {
    this._ratings.update(m => ({ ...m, [id]: r }));
  }

  setComment(id: string, e: Event): void {
    const val = (e.target as HTMLTextAreaElement).value;
    this._comments.update(m => ({ ...m, [id]: val }));
  }

  submitReview(appt: any): void {
    const rating = this._ratings()[appt.id];
    if (!rating) { this.notifSvc.showToast('Veuillez sélectionner une note en étoiles', 'warning'); return; }
    const comment = this._comments()[appt.id] || '';

    this.api.post<any>('/reviews', {
      doctorId: appt.doctorId, appointmentId: appt.id,
      rating, comment,
    }).subscribe({
      next: () => {
        this._appointments.update(list =>
          list.map(a => a.id === appt.id ? { ...a, review: { rating, comment } } : a)
        );
        this.notifSvc.showToast('Avis envoyé ! Merci.', 'success');
      },
      error: () => this.notifSvc.showToast("Échec de l'envoi de l'évaluation", 'error'),
    });
  }
}
