import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-10">
      <h1 class="text-3xl font-bold mb-8">Shopping Cart</h1>

      @if (cart.items().length === 0) {
        <div class="text-center py-16 text-gray-400">
          <i class="fas fa-shopping-cart text-6xl mb-4"></i>
          <p class="text-xl">Your cart is empty</p>
          <a routerLink="/" class="text-indigo-600 hover:underline mt-2 inline-block">Continue Shopping</a>
        </div>
      } @else {
        <div class="space-y-4">
          @for (item of cart.items(); track item.product.id) {
            <div class="bg-white rounded-xl border p-4 flex items-center gap-6">
              <div class="w-20 h-20 bg-gradient-to-br from-indigo-100 to-cyan-100 rounded-xl flex items-center justify-center text-2xl text-indigo-300 flex-shrink-0">
                <i class="fas fa-box"></i>
              </div>
              <div class="flex-1">
                <h3 class="font-semibold">{{item.product.name}}</h3>
                <p class="text-gray-500 text-sm">\${{item.product.price}} x {{item.quantity}}</p>
              </div>
              <p class="font-bold">\${{(item.product.price * item.quantity).toFixed(2)}}</p>
              <button (click)="cart.remove(item.product.id)" class="text-red-400 hover:text-red-600" [attr.aria-label]="'Remove ' + item.product.name + ' from cart'"><i class="fas fa-trash" aria-hidden="true"></i></button>
            </div>
          }
        </div>

        <div class="bg-white rounded-xl border p-6 mt-6">
          <div class="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>\${{cart.total.toFixed(2)}}</span>
          </div>
          <div class="mt-4">
            <label for="shippingAddress" class="sr-only">Shipping Address</label>
            <input #address id="shippingAddress" type="text" placeholder="Shipping Address" class="w-full border rounded-lg px-4 py-3 mb-3" autocomplete="street-address">
            <button (click)="checkout(address.value)" class="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition" aria-label="Proceed to checkout">
              <i class="fas fa-credit-card mr-2"></i> Checkout
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class CartComponent {
  cart = inject(CartService);
  private api = inject(ApiService);

  async checkout(address: string) {
    if (!address) { alert('Please enter shipping address'); return; }
    const items = this.cart.items().map(i => ({ productId: i.product.id, quantity: i.quantity }));
    this.api.createOrder(address, items).subscribe({
      next: () => { alert('Order placed!'); this.cart.clear(); },
      error: () => alert('Please login first'),
    });
  }
}
