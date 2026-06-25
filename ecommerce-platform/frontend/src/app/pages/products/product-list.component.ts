import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';
import { Product } from '../../models/product.model';
import { SkeletonComponent } from '../../components/skeleton.component';
import { EmptyStateComponent } from '../../components/empty-state.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [RouterModule, SkeletonComponent, EmptyStateComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="text-center mb-10">
        <h1 class="text-4xl font-extrabold text-gray-900">Our Products</h1>
        <p class="text-gray-500 mt-2">Browse our collection of premium products</p>
      </div>

      <div class="flex gap-2 mb-8 flex-wrap justify-center" role="group" aria-label="Category filters">
        <button (click)="filter=''; loadProducts()"
          class="px-4 py-2 rounded-lg text-sm font-medium transition"
          [class.bg-indigo-600]="filter===''" [class.text-white]="filter===''"
          [class.bg-gray-200]="filter!==''" aria-label="Show all products">All</button>
        @for (cat of categories; track cat) {
          <button (click)="filter=cat; loadProducts()"
            class="px-4 py-2 rounded-lg text-sm font-medium transition"
            [class.bg-indigo-600]="filter===cat" [class.text-white]="filter===cat"
            [class.bg-gray-200]="filter!==cat" [attr.aria-label]="'Filter by ' + cat">{{cat}}</button>
        }
      </div>

      @if (loading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (_ of [1,2,3,4,5,6]; track _) {
            <div class="bg-white rounded-xl border overflow-hidden">
              <app-skeleton height="224px" />
              <div class="p-5 space-y-3">
                <app-skeleton height="20px" />
                <app-skeleton height="16px" />
                <app-skeleton height="16px" />
                <div class="flex justify-between mt-4">
                  <app-skeleton height="24px" />
                  <app-skeleton height="32px" />
                </div>
              </div>
            </div>
          }
        </div>
      } @else if (products.length === 0) {
        <app-empty-state
          icon="🔍"
          title="No products found"
          message="Try adjusting your search or filter to find what you're looking for."
        />
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (product of products; track product.id) {
            <div class="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition group">
              <div class="h-56 bg-gradient-to-br from-indigo-100 to-cyan-100 flex items-center justify-center text-5xl text-indigo-300" role="img" aria-label="{{product.name}}">
                <i class="fas fa-box" aria-hidden="true"></i>
              </div>
              <div class="p-5">
                <span class="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">{{product.category}}</span>
                <h3 class="text-lg font-semibold mt-2">{{product.name}}</h3>
                <p class="text-gray-500 text-sm mt-1 line-clamp-2">{{product.description}}</p>
                <div class="flex items-center justify-between mt-4">
                  <span class="text-xl font-bold text-gray-900">\${{product.price}}</span>
                  <div class="flex gap-2">
                    <a [routerLink]="['/products', product.id]" class="text-sm text-indigo-600 hover:underline" [attr.aria-label]="'View details for ' + product.name">Details</a>
                    <button (click)="addToCart(product)" class="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition" [disabled]="product.stock===0" [attr.aria-label]="'Add ' + product.name + ' to cart'">
                      @if (product.stock > 0) { Add to Cart } @else { Out of Stock }
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class ProductListComponent implements OnInit {
  private api = inject(ApiService);
  private cart = inject(CartService);
  private toastSvc = inject(ToastService);
  products: Product[] = [];
  categories = ['Electronics', 'Sports', 'Home', 'Accessories'];
  filter = '';
  loading = signal(true);

  ngOnInit() { this.loadProducts(); }

  loadProducts() {
    this.loading.set(true);
    this.api.getProducts(this.filter || undefined).subscribe({
      next: p => { this.products = p; this.loading.set(false); },
      error: () => { this.loading.set(false); this.toastSvc.show('Failed to load products', 'error'); },
    });
  }

  addToCart(product: Product) {
    this.cart.add(product);
    this.toastSvc.show(`${product.name} added to cart!`, 'success');
  }
}
