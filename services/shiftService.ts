// This is a mock API service for shift management.
// It simulates network requests for starting and stopping a shift.
import type { Cashier } from '../types';
import { verifyCashierPin } from './cashierService';

const API_BASE_URL = 'https://api.majukoperasiku.my.id';

const getAuthHeaders = (hasBody: boolean = false): Headers => {
  const token = localStorage.getItem('token');
  const headers = new Headers();
  if (hasBody) {
    headers.append('Content-Type', 'application/json');
  }
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }
  return headers;
}

export const startShift = async (pin: string): Promise<Cashier> => {
  const response = await fetch(`${API_BASE_URL}/shifts/clock-in`, {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: JSON.stringify({ pin }),
  });

  // Handle successful clock-in
  if (response.ok) {
    return response.json();
  }

  // For non-ok responses, try to parse the body once
  const errorBody = await response.json().catch(() => null);

  // Handle case where shift is already active (409 Conflict)
  if (response.status === 409 && errorBody && errorBody.message === "Employee already has an active shift.") {
      // If the shift is already active, we treat this as a success.
      // We verify the PIN to get the cashier's details and proceed.
      return verifyCashierPin(pin);
  }

  // Handle all other errors
  const errorMessage = errorBody?.message || 'Failed to start shift';
  throw new Error(errorMessage);
};

export const stopShift = async (): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/shifts/stop`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to stop shift' }));
    throw new Error(errorData.message || 'Failed to stop shift');
  }

  return response.json();
};