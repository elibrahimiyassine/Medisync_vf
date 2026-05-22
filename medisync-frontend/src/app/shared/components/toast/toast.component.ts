import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Toast } from '../../../core/services/notification.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('toastAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(100%)' }),
        animate('300ms cubic-bezier(0.34, 1.56, 0.64, 1)', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateX(100%)' }))
      ]),
    ])
  ],
  template: `
    <div class="toast-container">
      @for (toast of notifSvc.toasts(); track toast.id) {
        <div class="toast" [class]="toast.type" @toastAnim>
          <div class="toast-icon">
            @switch (toast.type) {
              @case ('success') { ✓ }
              @case ('error')   { ✕ }
              @case ('warning') { ⚠ }
              @default          { ℹ }
            }
          </div>
          <p class="toast-msg">{{ toast.message }}</p>
          <button class="toast-close" (click)="notifSvc.removeToast(toast.id)">×</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #FAF7F1;
      border-radius: 12px;
      padding: 14px 16px;
      min-width: 300px;
      max-width: 420px;
      box-shadow: 0 8px 28px rgba(27,37,32,0.14), 0 2px 8px rgba(27,37,32,0.08);
      pointer-events: all;
      border-left: 4px solid;

      &.success {
        border-color: #3D6B4F;
        .toast-icon { color: #3D6B4F; background: rgba(61,107,79,0.12); }
      }
      &.error {
        border-color: #C24040;
        .toast-icon { color: #C24040; background: rgba(194,64,64,0.12); }
      }
      &.warning {
        border-color: #B8792A;
        .toast-icon { color: #B8792A; background: rgba(184,121,42,0.14); }
      }
      &.info {
        border-color: #2A4A38;
        .toast-icon { color: #2A4A38; background: rgba(42,74,56,0.1); }
      }
    }

    .toast-icon {
      width: 30px;
      height: 30px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .toast-msg {
      flex: 1;
      font-size: 13px;
      color: #1B2520;
      line-height: 1.4;
    }

    .toast-close {
      background: none;
      border: none;
      color: #7A8A82;
      font-size: 18px;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      flex-shrink: 0;
      transition: color 0.15s;
      &:hover { color: #1B2520; }
    }
  `],
})
export class ToastComponent {
  notifSvc = inject(NotificationService);
}
