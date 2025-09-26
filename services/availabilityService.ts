// This is a mock API service for product availability.
export interface TimeSlot {
  start_time: string;
  end_time: string;
  is_available: boolean;
}

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
 * Fetches the availability schedule for a given product on a specific date.
 * @param productId The ID of the product.
 * @param date The date in YYYY-MM-DD format (currently unused in mock).
 * @returns A Promise that resolves with an array of time slots.
 */
export const getProductAvailability = async (productId: number, date: string): Promise<TimeSlot[]> => {
  const response = await fetch(`${API_BASE_URL}/products/${productId}/availability?date=${date}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch availability' }));
    throw new Error(errorData.message || 'Failed to fetch availability');
  }

  return response.json();
};