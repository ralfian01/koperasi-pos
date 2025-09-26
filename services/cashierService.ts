// This is a mock API service for cashier management.
import type { Cashier } from '../types';

const API_BASE_URL = 'https://api.majukoperasiky.my.id';

const getAuthHeaders = (): Headers => {
  const token = localStorage.getItem('token');
  const headers = new Headers({
    'Content-Type': 'application/json',
  });
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }
  return headers;
}

/**
 * Verifies a cashier's PIN.
 * In a real application, this would make an API call to the backend.
 * @param pin The 6-digit PIN to verify.
 * @returns A Promise that resolves with the Cashier object if the PIN is valid.
 */
export const verifyCashierPin = async (pin: string): Promise<Cashier> => {
    const response = await fetch(`${API_BASE_URL}/cashiers/verify-pin`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ pin })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Invalid PIN' }));
        throw new Error(errorData.message || 'Invalid PIN');
    }

    return response.json();
};