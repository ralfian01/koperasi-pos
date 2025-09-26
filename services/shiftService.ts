// This is a mock API service for shift management.
// It simulates network requests for starting and stopping a shift.

const API_BASE_URL = 'https://api.majukoperasiku.my.id';

const getAuthHeaders = (): Headers => {
  const token = localStorage.getItem('token');
  const headers = new Headers();
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }
  return headers;
}

export const startShift = async (): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/shifts/start`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to start shift' }));
    throw new Error(errorData.message || 'Failed to start shift');
  }

  return response.json();
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