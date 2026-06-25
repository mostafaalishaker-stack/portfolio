import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);
  private nextId = 0;

  show(message: string, type: Toast['type'] = 'info') {
    const toast: Toast = { id: this.nextId++, message, type };
    this.toasts.update(prev => [...prev, toast]);
    setTimeout(() => this.remove(toast.id), 3500);
  }

  remove(id: number) {
    this.toasts.update(prev => prev.filter(t => t.id !== id));
  }
}
