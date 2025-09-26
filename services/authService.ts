// This is a mock API service. It simulates a network request.
// In a real application, this would use axios or fetch to call a real backend.

const API_BASE_URL = 'https://api.majukoperasiku.my.id';

export const login = async (username: string, password: string): Promise<{ token: string }> => {
  const credentials = btoa(`${username}:${password}`);
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  headers.append('Authorization', `Basic ${credentials}`);
  
  const response = await fetch(`${API_BASE_URL}/auth/account`, {
    method: 'POST',
    headers: headers,
  });

  if (!response.ok) {
    // Throws an error for 4xx/5xx responses
    const errorData = await response.json().catch(() => ({ message: 'Invalid credentials' }));
    throw new Error(errorData.message || 'Invalid credentials');
  }

  const data = await response.json();
  
  if (!data.token) {
    throw new Error('Token not found in login response');
  }
  
  return data;
};
