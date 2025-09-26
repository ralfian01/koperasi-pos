// This is a mock API service for products.
import type { Product, Variant } from '../types';

const mockProducts: Product[] = [
    { id: 1, name: 'Kopi Susu Gula Aren', price: 18000, member_price: 15000, image_url: 'https://images.unsplash.com/photo-1579989973211-9540b63a75b6?q=80&w=200&auto=format&fit=crop', booking_type: 'inventory', category: 'Kopi' },
    { id: 2, name: 'Americano', price: 15000, image_url: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=200&auto=format&fit=crop', booking_type: 'inventory', category: 'Kopi' },
    { id: 3, name: 'Croissant Coklat', price: 22000, image_url: 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?q=80&w=200&auto=format&fit=crop', booking_type: 'inventory', category: 'Roti' },
    { id: 4, name: 'Donat Gula', price: 12000, image_url: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=200&auto=format&fit=crop', booking_type: 'inventory', category: 'Roti' },
    { id: 5, name: 'Teh Melati', price: 10000, image_url: 'https://images.unsplash.com/photo-1627435601361-ec25f2b740ba?q=80&w=200&auto=format&fit=crop', booking_type: 'inventory', category: 'Minuman Lain' },
    { id: 6, name: 'Sewa Ruang Meeting (per jam)', price: 100000, image_url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=200&auto=format&fit=crop', booking_type: 'time_slot', category: 'Layanan' },
    {
        id: 7, name: 'Es Teh Manis', price: 8000, image_url: 'https://images.unsplash.com/photo-1575823155398-2f6472e03512?q=80&w=200&auto=format&fit=crop', booking_type: 'inventory', category: 'Minuman Lain',
        variants: [
            { name: 'Normal', price: 8000 },
            { name: 'Jumbo', price: 12000 },
        ]
    },
    { id: 8, name: 'Air Mineral', price: 5000, image_url: 'https://images.unsplash.com/photo-1543272266-7dd356543232?q=80&w=200&auto=format&fit=crop', booking_type: 'inventory', category: 'Minuman Lain' },
];

/**
 * Fetches products from a mock source.
 * @param booking_type The type of products to fetch.
 * @returns A Promise that resolves with an array of products.
 */
export const getProducts = async (booking_type: 'inventory' | 'service' | 'all' = 'all'): Promise<Product[]> => {
  console.log('MOCK API: Fetching products...');
  return new Promise(resolve => {
    setTimeout(() => {
      if (booking_type === 'all') {
        resolve(mockProducts);
      } else {
        resolve(mockProducts.filter(p => p.booking_type === booking_type));
      }
    }, 500); // Simulate network delay
  });
};
