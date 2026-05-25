import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toasts$ = new BehaviorSubject<Toast[]>([]);
  toasts = this.toasts$.asObservable();

  show(toast: Omit<Toast, 'id'>) {
    const id = Math.random().toString(36).slice(2);
    const newToast: Toast = { ...toast, id, duration: toast.duration ?? 4000 };
    this.toasts$.next([...this.toasts$.value, newToast]);
    setTimeout(() => this.dismiss(id), newToast.duration);
  }

  dismiss(id: string) {
    this.toasts$.next(this.toasts$.value.filter(t => t.id !== id));
  }

  success(title: string, message?: string) {
    this.show({ type: 'success', title, message });
  }

  error(title: string, message?: string) {
    this.show({ type: 'error', title, message });
  }

  warning(title: string, message?: string) {
    this.show({ type: 'warning', title, message });
  }

  info(title: string, message?: string) {
    this.show({ type: 'info', title, message });
  }
}
