import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule],
  template: `
    <nav class="bg-white shadow-sm border-b sticky top-0 z-50" aria-label="Main navigation">
      <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <a routerLink="/" class="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent" aria-label="Home">
          ShopEase
        </a>
        <div class="flex items-center gap-6">
          <a routerLink="/" class="text-sm font-medium text-gray-600 hover:text-indigo-600" aria-label="Products page">Products</a>
          <a routerLink="/cart" class="relative text-gray-600 hover:text-indigo-600" aria-label="Shopping cart">
            <i class="fas fa-shopping-cart text-lg" aria-hidden="true"></i>
            @if (cart.count > 0) {
              <span class="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" aria-label="{{cart.count}} items in cart">
                {{cart.count}}
              </span>
            }
          </a>
          @if (token) {
            <button (click)="logout()" class="text-sm text-gray-500 hover:text-red-600" aria-label="Logout">Logout</button>
          } @else {
            <a routerLink="/auth" class="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700" aria-label="Login or register">Login</a>
          }
        </div>
      </div>
    </nav>
  `,
})
export class NavbarComponent {
  cart = inject(CartService);
  token: string | null = null;

  ngOnInit() {
    this.token = localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    this.token = null;
  }
}
