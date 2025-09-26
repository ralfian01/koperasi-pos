import type { Member } from '../types';

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
 * Searches for members by name or phone number.
 * @param query The search term.
 * @returns A Promise that resolves with an array of matching members.
 */
export const searchMembers = async (query: string): Promise<Member[]> => {
  if (!query) {
    return [];
  }
  
  const response = await fetch(`${API_BASE_URL}/members/search?q=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to search members' }));
    throw new Error(errorData.message || 'Failed to search members');
  }

  return response.json();
};