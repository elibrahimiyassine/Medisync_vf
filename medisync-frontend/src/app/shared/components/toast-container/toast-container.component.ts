import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-container.component.html',
  styleUrls:  ['./toast-container.component.scss']
})
export class ToastContainerComponent {
  toasts$: Observable<Toast[]>;

  constructor(private toastService: ToastService) {
    this.toasts$ = this.toastService.toasts;
  }

  dismiss(id: string) {
    this.toastService.dismiss(id);
  }

  iconFor(type: string): string {
    const icons: Record<string, string> = {
      success: '✓',
      error:   '✕',
      warning: '⚠',
      info:    'ℹ',
    };
    return icons[type] ?? 'ℹ';
  }
}
