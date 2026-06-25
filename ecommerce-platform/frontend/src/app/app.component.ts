import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './components/navbar.component';
import { ToastService } from './services/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <main class="min-h-screen">
      <router-outlet></router-outlet>
    </main>
    <footer class="bg-gray-900 text-gray-400 text-center py-8 text-sm">
      <p>&copy; 2026 ShopEase. All rights reserved.</p>
    </footer>
    <div class="toast-container" role="region" aria-label="Notifications">
      @for (toast of toastSvc.toasts(); track toast.id) {
        <div
          class="toast toast-{{toast.type}}"
          role="alert"
          (click)="toastSvc.remove(toast.id)"
        >
          <span>{{toast.message}}</span>
          <button class="toast-close" aria-label="Dismiss">&times;</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      display: flex; flex-direction: column; gap: 10px; max-width: 380px;
    }
    .toast {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 18px; border-radius: 12px; font-size: 14px; font-weight: 500;
      cursor: pointer; box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease-out;
    }
    .toast-success { background: #065f46; color: #d1fae5; border: 1px solid #059669; }
    .toast-error { background: #7f1d1d; color: #fecaca; border: 1px solid #dc2626; }
    .toast-info { background: #1e3a5f; color: #bfdbfe; border: 1px solid #3b82f6; }
    .toast-close {
      background: none; border: none; color: inherit; font-size: 20px;
      cursor: pointer; margin-left: 12px; opacity: 0.7; line-height: 1;
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(100%); }
      to { opacity: 1; transform: translateX(0); }
    }
  `],
})
export class AppComponent {
  toastSvc = inject(ToastService);
}
