import React from 'react';

export interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}

export interface Cashier {
  id: number;
  name: string;
}

export interface ShiftContextType {
  isShiftActive: boolean;
  currentCashier: Cashier | null;
  startShift: (cashier: Cashier) => void;
  stopShift: () => void;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  member_price?: number; // Harga khusus member
  image_url: string;
  booking_type: 'inventory' | 'service' | 'time_slot' | 'consumable_stock';
}

export interface CartItem {
  id: string; // ID unik untuk setiap item baris keranjang
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  details?: string; // Untuk slot waktu, durasi, dll.
}

export interface Customer {
  name: string;
  phone: string;
}

export interface Member {
  id: number;
  name: string;
  phone: string;
}

export interface CartSession {
  id: string;
  customer: Customer;
  memberId?: number; // Lacak apakah pelanggan adalah member
  items: CartItem[];
}

export type PaymentMethod = 'cash' | 'edc' | 'qris';

export type PaymentDetails = 
  | { method: 'cash'; amount_paid: number; change: number; }
  | { method: 'edc'; last_4_digits: string; }
  | { method: 'qris'; reference_id: string; };

export interface Promo {
  id: string;
  name: string;
  type: 'weekday' | 'weekend' | 'happy_hour' | 'min_spend';
  value: number; // Persentase diskon
  min_spend?: number; // Untuk tipe min_spend
  happy_hour_start?: number; // Jam (0-23)
  happy_hour_end?: number; // Jam (0-23)
}

export interface Transaction {
  id: string; // ID Transaksi, mis., TRX-167...
  cart_id: string; // ID sesi keranjang asli
  timestamp: string; // ISO string
  customer: Customer;
  items: CartItem[];
  subtotal: number;
  promo_applied?: string; // Nama promo yang diterapkan
  discount?: number; // Jumlah diskon
  tax: number;
  total: number;
  payment: PaymentDetails;
  status: 'completed' | 'refunded';
}


export interface CartContextType {
  sessions: CartSession[];
  activeSessionId: string | null;
  activeCart: CartSession | null;
  isLoading: boolean;
  switchSession: (sessionId: string) => void;
  addSession: () => void;
  addProductToActiveCart: (product: Product) => void;
  addComplexItemToCart: (product: Product, options: { quantity: number; details: string; price?: number }) => void;
  updateActiveCartQuantity: (itemId: string, change: 1 | -1) => void;
  setSessionCustomer: (sessionId: string, details: { customer?: Customer, member?: Member }) => void;
  clearActiveCart: () => void;
  activeCartSubtotal: number;
  appliedPromo: Promo | null;
  activeCartDiscount: number;
  activeCartTax: number;
  activeCartTotal: number;
  deleteSession: (sessionId: string) => void;
  removeItemFromCart: (itemId: string) => void;
  clearAllDataForNewShift: () => void;
}