import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-6xl mx-auto px-4 py-10">
      <h1 class="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div class="bg-white rounded-xl border p-6 mb-8">
        <h2 class="text-xl font-semibold mb-4">All Orders</h2>
        @if (orders.length === 0) {
          <p class="text-gray-400">No orders yet</p>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b text-left text-gray-500">
                  <th class="pb-3">#</th>
                  <th class="pb-3">Date</th>
                  <th class="pb-3">Items</th>
                  <th class="pb-3">Total</th>
                  <th class="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                @for (order of orders; track order.id) {
                  <tr class="border-b">
                    <td class="py-3">{{order.id}}</td>
                    <td class="py-3">{{order.createdAt | date}}</td>
                    <td class="py-3">{{order.items.length}} items</td>
                    <td class="py-3 font-semibold">\${{order.total}}</td>
                    <td class="py-3">
                      <span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">{{order.status}}</span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
})
export class AdminComponent implements OnInit {
  private api = inject(ApiService);
  orders: Order[] = [];

  ngOnInit() {
    this.api.getOrders().subscribe(o => this.orders = o);
  }
}
