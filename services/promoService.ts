import type { Promo } from '../types';

const API_BASE_URL = 'https://api.majukoperasiky.my.id';

const getAuthHeaders = (): Headers => {
  const token = localStorage.getItem('token');
  const headers = new Headers();
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }
  return headers;
}

/**
 * Fetches all available promos from the API.
 * @returns A Promise that resolves with an array of promos.
 */
export const getActivePromos = async (): Promise<Promo[]> => {
  const response = await fetch(`${API_BASE_URL}/promos`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch promos' }));
    throw new Error(errorData.message || 'Failed to fetch promos');
  }
  
  return response.json();
};