// This is a mock API service for products.
import type { Product } from '../types';

const allProducts: Product[] = [
  { 
    id: 1, 
    name: 'Sewa Gedung Aula I', 
    price: 500000, 
    member_price: 450000, 
    image_url: 'https://images.unsplash.com/photo-1594943336308-601320494270?q=80&w=400', 
    booking_type: 'time_slot',
    category: 'Sewa Gedung'
  },
  { 
    id: 2, 
    name: 'Sewa Gedung Aula II', 
    price: 750000, 
    member_price: 700000, 
    image_url: 'https://images.unsplash.com/photo-1542665952-14513db15293?q=80&w=400', 
    booking_type: 'time_slot',
    category: 'Sewa Gedung'
  },
  { 
    id: 3, 
    name: 'Driving Range Gold', 
    price: 60000, 
    image_url: 'https://images.unsplash.com/photo-1627993202157-5079a8345731?q=80&w=400', 
    booking_type: 'inventory',
    category: 'Olahraga',
    variants: [
      { name: 'Paket 200 Bola', price: 120000 },
      { name: 'Paket 100 Bola', price: 80000 },
      { name: 'Paket 50 Bola', price: 60000 }
    ] 
  },
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