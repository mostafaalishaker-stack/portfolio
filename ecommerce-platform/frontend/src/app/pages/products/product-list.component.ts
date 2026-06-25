import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';
import { Product } from '../../models/product.model';
import { SkeletonComponent } from '../../components/skeleton.component';
import { EmptyStateComponent } from '../../components/empty-state.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [RouterModule, FormsModule, SkeletonComponent, EmptyStateComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="text-center mb-10">
        <h1 class="text-4xl font-extrabold text-gray-900">Our Products</h1>
        <p class="text-gray-500 mt-2">Browse our collection of premium products</p>
      </div>

      <div class="max-w-md mx-auto mb-6">
        <div class="relative">
          <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="currentPage=1" placeholder="Search products..." class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400" />
          @if (searchTerm()) {
            <button (click)="searchTerm.set(''); currentPage=1" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"><i class="fas fa-times"></i></button>
          }
        </div>
      </div>

      <div class="flex gap-2 mb-8 flex-wrap justify-center" role="group" aria-label="Category filters">
        <button (click)="filter=''; loadProducts(); currentPage=1"
          class="px-4 py-2 rounded-lg text-sm font-medium transition"
          [class.bg-indigo-600]="filter===''" [class.text-white]="filter===''"
          [class.bg-gray-200]="filter!==''" aria-label="Show all products">All</button>
        @for (cat of categories; track cat) {
          <button (click)="filter=cat; loadProducts(); currentPage=1"
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
      } @else if (filteredProducts.length === 0) {
        <app-empty-state
          icon="🔍"
          title="No products found"
          message="Try adjusting your search or filter to find what you're looking for."
        />
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (product of paginatedProducts; track product.id) {
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
        <div class="flex items-center justify-center gap-2 mt-8">
          <button (click)="prevPage()" [disabled]="currentPage === 1"
            class="w-9 h-9 rounded-lg border border-gray-300 bg-transparent text-gray-600 cursor-pointer text-sm flex items-center justify-center transition-all hover:border-indigo-400 hover:text-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed">
            <i class="fas fa-chevron-left"></i>
          </button>
          @for (p of pageNumbers; track p) {
            @if (p === -1) {
              <span class="text-gray-400 px-1">...</span>
            } @else {
              <button (click)="goToPage(p)"
                class="w-9 h-9 rounded-lg border text-sm flex items-center justify-center transition-all cursor-pointer"
                [class.bg-indigo-600]="p === currentPage"
                [class.border-indigo-600]="p === currentPage"
                [class.text-white]="p === currentPage"
                [class.border-gray-300]="p !== currentPage"
                [class.bg-transparent]="p !== currentPage"
                [class.text-gray-600]="p !== currentPage"
                [class.hover:border-indigo-400]="p !== currentPage"
                [class.hover:text-indigo-400]="p !== currentPage">
                {{p}}
              </button>
            }
          }
          <button (click)="nextPage()" [disabled]="currentPage === totalPages"
            class="w-9 h-9 rounded-lg border border-gray-300 bg-transparent text-gray-600 cursor-pointer text-sm flex items-center justify-center transition-all hover:border-indigo-400 hover:text-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed">
            <i class="fas fa-chevron-right"></i>
          </button>
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
  searchTerm = signal('');
  loading = signal(true);
  currentPage = 1;
  itemsPerPage = 9;

  get filteredProducts(): Product[] {
    const term = this.searchTerm().toLowerCase();
    const catFiltered = this.filter ? this.products.filter(p => p.category === this.filter) : this.products;
    return term ? catFiltered.filter(p => p.name.toLowerCase().includes(term)) : catFiltered;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredProducts.length / this.itemsPerPage));
  }

  get paginatedProducts(): Product[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredProducts.slice(start, start + this.itemsPerPage);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      if (i === 1 || i === this.totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== -1) {
        pages.push(-1);
      }
    }
    return pages;
  }

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

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  goToPage(p: number) {
    this.currentPage = p;
  }
}
