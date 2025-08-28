// This is a mock API service for cashier management.
import type { Cashier } from '../types';

// Mock database of cashiers
const cashiers: Record<string, Cashier> = {
  '123456': { id: 1, name: 'Budi Santoso' },
  '654321': { id: 2, name: 'Siti Aminah' },
  '112233': { id: 3, name: 'Eka Wijaya' },
};

/**
 * Verifies a cashier's PIN.
 * In a real application, this would make an API call to the backend.
 * @param pin The 6-digit PIN to verify.
 * @returns A Promise that resolves with the Cashier object if the PIN is valid.
 */
export const verifyCashierPin = (pin: string): Promise<Cashier> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const cashier = cashiers[pin];
      if (cashier) {
        console.log(`API: PIN ${pin} verified for cashier: ${cashier.name}`);
        resolve(cashier);
      } else {
        console.log(`API: PIN ${pin} is invalid.`);
        reject(new Error('Invalid PIN'));
      }
    }, 700); // Simulate network delay
  });
};