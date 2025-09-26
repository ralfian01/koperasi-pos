// This is a mock API service for products.
import type { Product } from '../types';

const API_BASE_URL = 'https://api.majukoperasiku.my.id';

const getAuthHeaders = (): Headers => {
  const token = localStorage.getItem('token');
  const headers = new Headers();
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }
  return headers;
}

/**
 * Fetches products from the API.
 * @param booking_type The type of products to fetch.
 * @returns A Promise that resolves with an array of products.
 */
export const getProducts = async (booking_type: 'inventory' | 'service' | 'all' = 'all'): Promise<Product[]> => {
  let url = `${API_BASE_URL}/products`;
  if (booking_type !== 'all') {
    url += `?booking_type=${booking_type}`;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch products' }));
    throw new Error(errorData.message || 'Failed to fetch products');
  }

  return response.json();
};