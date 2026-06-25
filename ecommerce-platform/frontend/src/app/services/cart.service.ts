import { Injectable, signal } from '@angular/core';
import { CartItem } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  items = signal<CartItem[]>(this.loadCart());

  private loadCart(): CartItem[] {
    try { return JSON.parse(localStorage.getItem('cart') || '[]'); } catch { return []; }
  }

  private save() {
    localStorage.setItem('cart', JSON.stringify(this.items()));
  }

  add(product: { id: number; name: string; price: number; imageUrl: string; stock: number }, quantity = 1) {
    const existing = this.items().find(i => i.product.id === product.id);
    if (existing) {
      this.items.update(items => items.map(i =>
        i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
      ));
    } else {
      this.items.update(items => [...items, { product, quantity }]);
    }
    this.save();
  }

  remove(productId: number) {
    this.items.update(items => items.filter(i => i.product.id !== productId));
    this.save();
  }

  clear() {
    this.items.set([]);
    localStorage.removeItem('cart');
  }

  get total(): number {
    return this.items().reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  }

  get count(): number {
    return this.items().reduce((sum, i) => sum + i.quantity, 0);
  }
}
