import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './components/navbar.component';

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
  `,
})
export class AppComponent {}
