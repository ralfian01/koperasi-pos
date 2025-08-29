// This is a mock API service for products.
import type { Product } from '../types';

const allProducts: Product[] = [
  { 
    id: 1, 
    name: 'Kopi Americano', 
    price: 18000, 
    member_price: 15000, 
    image_url: 'https://images.unsplash.com/photo-1511920183353-3c0a1d5a57de?q=80&w=400', 
    booking_type: 'inventory',
    variants: [
      { name: 'Panas', price: 18000 },
      { name: 'Dingin', price: 20000 }
    ] 
  },
  { id: 2, name: 'Croissant Coklat', price: 22000, image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=400', booking_type: 'inventory' },
  { id: 3, name: 'Teh Melati', price: 15000, member_price: 12000, image_url: 'https://images.unsplash.com/photo-1627435601361-ec25f2b740ba?q=80&w=400', booking_type: 'inventory' },
  { id: 4, name: 'Sandwich Daging Asap', price: 35000, image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=400', booking_type: 'inventory' },
  { id: 5, name: 'Jus Jeruk Segar', price: 20000, image_url: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=400', booking_type: 'inventory' },
  { id: 6, name: 'Donat Gula', price: 12000, image_url: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=400', booking_type: 'inventory' },
  { id: 7, name: 'Air Mineral Botol', price: 8000, image_url: 'https://images.unsplash.com/photo-1587057799568-7d3c0a815a1f?q=80&w=400', booking_type: 'inventory' },
  { id: 8, name: 'Voucher Game 50k', price: 50000, member_price: 48000, image_url: 'https://images.unsplash.com/photo-1580634282835-4b067135a532?q=80&w=400', booking_type: 'service' },
  { id: 9, name: 'Paket Cuci Mobil', price: 75000, member_price: 65000, image_url: 'https://images.unsplash.com/photo-1607280287823-ca2d45c22a8a?q=80&w=400', booking_type: 'service' },
  { 
    id: 10, 
    name: 'Kopi Latte', 
    price: 25000, 
    member_price: 22000, 
    image_url: 'https://images.unsplash.com/photo-1572442388796-11668a67d5b2?q=80&w=400', 
    booking_type: 'inventory',
    variants: [
      { name: 'Reguler', price: 25000 },
      { name: 'Large', price: 28000 }
    ]
  },
  { id: 11, name: 'Sewa Ruang Rapat (per jam)', price: 150000, member_price: 125000, image_url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=400', booking_type: 'time_slot' },
  { id: 12, name: 'Sewa Proyektor', price: 50000, image_url: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?q=80&w=400', booking_type: 'consumable_stock' },
];

/**
 * Fetches products from the mock API.
 * @param booking_type The type of products to fetch.
 * @returns A Promise that resolves with an array of products.
 */
export const getProducts = (booking_type: 'inventory' | 'service' | 'all' = 'all'): Promise<Product[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (booking_type === 'all') {
         resolve(allProducts);
      } else {
        const filteredProducts = allProducts.filter(p => p.booking_type === booking_type);
        console.log(`API: Fetched ${filteredProducts.length} products with booking_type '${booking_type}'.`);
        resolve(filteredProducts);
      }
    }, 800); // Simulate network delay
  });
};