import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';

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

  constructor(private api: ApiService) {}

  connect(): void {}
  disconnect(): void {}

  loadNotifications(): void {
    this.api.get<any>('/notifications').subscribe({
      next: (res) => {
        this._notifications.set(res.data || []);
        this._unreadCount.set(res.unreadCount ?? 0);
      },
      error: () => {},
    });
  }

  clearNotifications(): void {
    this._notifications.set([]);
    this._unreadCount.set(0);
  }

  markAsRead(id: string): void {
    this.api.put(`/notifications/${id}/read`, {}).subscribe({ error: () => {} });
    this._notifications.update(n => n.map(x => x.id === id ? { ...x, isRead: true } : x));
    this._unreadCount.update(c => Math.max(0, c - 1));
  }

  markAllAsRead(): void {
    this.api.put('/notifications/read-all', {}).subscribe({ error: () => {} });
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
