import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private _notifications = signal<Notification[]>([]);
  private _toasts        = signal<Toast[]>([]);
  private _unreadCount   = signal(0);

  readonly notifications = this._notifications.asReadonly();
  readonly toasts        = this._toasts.asReadonly();
  readonly unreadCount   = this._unreadCount.asReadonly();

  connect(): void {}
  disconnect(): void {}

  loadNotifications(): void {
    this._notifications.set([
      { id: '1', message: 'Bienvenue sur MediSync !', type: 'INFO', isRead: false, createdAt: new Date().toISOString() },
      { id: '2', message: 'Le Dr. Chen a confirmé votre rendez-vous', type: 'APPOINTMENT', isRead: false, createdAt: new Date(Date.now() - 3_600_000).toISOString() },
    ]);
    this._unreadCount.set(2);
  }

  markAsRead(id: string): void {
    this._notifications.update(n => n.map(x => x.id === id ? { ...x, isRead: true } : x));
    this._unreadCount.update(c => Math.max(0, c - 1));
  }

  markAllAsRead(): void {
    this._notifications.update(n => n.map(x => ({ ...x, isRead: true })));
    this._unreadCount.set(0);
  }

  showToast(message: string, type: Toast['type'] = 'info', duration = 4000): void {
    const id = Date.now().toString();
    this._toasts.update(t => [...t, { id, message, type, duration }]);
    setTimeout(() => this.removeToast(id), duration);
  }

  removeToast(id: string): void {
    this._toasts.update(t => t.filter(x => x.id !== id));
  }
}
