import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { Order } from '../models/order.model';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProducts(category?: string, search?: string): Observable<Product[]> {
    let params = new URLSearchParams();
    if (category) params.set('category', category);
    if (search) params.set('search', search);
    return this.http.get<Product[]>(`${this.base}/products?${params}`);
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.base}/products/${id}`);
  }

  createOrder(shippingAddress: string, items: { productId: number; quantity: number }[]): Observable<Order> {
    return this.http.post<Order>(`${this.base}/orders`, { shippingAddress, items });
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.base}/orders`);
  }

  login(email: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.base}/auth/login`, { email, password });
  }

  register(email: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.base}/auth/register`, { email, password });
  }
}
