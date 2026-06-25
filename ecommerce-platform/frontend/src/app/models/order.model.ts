export interface Order {
  id: number;
  createdAt: string;
  total: number;
  status: string;
  items: OrderItem[];
}

export interface OrderItem {
  productName: string;
  price: number;
  quantity: number;
}

export interface CartItem {
  product: { id: number; name: string; price: number; imageUrl: string };
  quantity: number;
}
