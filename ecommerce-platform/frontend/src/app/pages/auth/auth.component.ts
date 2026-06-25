import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="min-h-[80vh] flex items-center justify-center">
      <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md mx-4">
        <h1 class="text-3xl font-bold text-center mb-2">Welcome</h1>
        <p class="text-gray-500 text-center mb-6">{{isLogin() ? 'Sign in to your account' : 'Create a new account'}}</p>

        <form (ngSubmit)="submit()">
          <label for="email" class="sr-only">Email</label>
          <input [(ngModel)]="email" name="email" id="email" type="email" placeholder="Email" class="w-full border rounded-lg px-4 py-3 mb-4" required autocomplete="email">
          <label for="password" class="sr-only">Password</label>
          <input [(ngModel)]="password" name="password" id="password" type="password" placeholder="Password" class="w-full border rounded-lg px-4 py-3 mb-6" required autocomplete="current-password">
          <button type="submit" class="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition" aria-label="{{isLogin() ? 'Login' : 'Register'}}">
            {{isLogin() ? 'Login' : 'Register'}}
          </button>
        </form>

        <p class="text-center mt-4 text-sm text-gray-500">
          {{isLogin() ? "Don't have an account?" : 'Already have an account?'}}
          <button (click)="toggle()" class="text-indigo-600 font-semibold ml-1">
            {{isLogin() ? 'Register' : 'Login'}}
          </button>
        </p>
      </div>
    </div>
  `,
})
export class AuthComponent {
  private api = inject(ApiService);
  private router = inject(Router);
  isLogin = signal(true);
  email = '';
  password = '';

  toggle() { this.isLogin.update(v => !v); }

  submit() {
    const action = this.isLogin() ? this.api.login(this.email, this.password) : this.api.register(this.email, this.password);
    action.subscribe({
      next: (res: { token: string }) => { localStorage.setItem('token', res.token); this.router.navigate(['/']); },
      error: (err: { error?: { message?: string } }) => alert(err.error?.message || 'Something went wrong'),
    });
  }
}
