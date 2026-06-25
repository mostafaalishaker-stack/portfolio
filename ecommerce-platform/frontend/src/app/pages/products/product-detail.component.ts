import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-10">
      @if (product) {
        <div class="grid md:grid-cols-2 gap-10">
          <div class="h-80 bg-gradient-to-br from-indigo-100 to-cyan-100 rounded-2xl flex items-center justify-center text-7xl text-indigo-300" role="img" [attr.aria-label]="product.name">
            <i class="fas fa-box" aria-hidden="true"></i>
          </div>
          <div>
            <span class="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{{product.category}}</span>
            <h1 class="text-3xl font-bold mt-3">{{product.name}}</h1>
            <p class="text-gray-500 mt-3">{{product.description}}</p>
            <p class="text-3xl font-bold mt-6">\${{product.price}}</p>
            <p class="text-sm text-gray-500 mt-2">Stock: {{product.stock}} units</p>
            <button (click)="addToCart()" class="mt-6 bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition" [disabled]="product.stock===0" [attr.aria-label]="'Add ' + product.name + ' to cart'">
              @if (product.stock > 0) { <i class="fas fa-shopping-cart mr-2"></i> Add to Cart } @else { Out of Stock }
            </button>
            <a routerLink="/" class="ml-3 text-gray-500 hover:text-indigo-600"><i class="fas fa-arrow-left mr-1"></i> Back</a>
          </div>
        </div>
      }
    </div>
  `,
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private cart = inject(CartService);
  product?: Product;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getProduct(id).subscribe(p => this.product = p);
  }

  addToCart() { if (this.product) { this.cart.add(this.product); alert('Added to cart!'); } }
}
