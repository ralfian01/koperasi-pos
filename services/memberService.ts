import type { Member } from '../types';

// Mock database of members
const members: Member[] = [
  { id: 101, name: 'Adi Prasetyo', phone: '081234567890' },
  { id: 102, name: 'Citra Lestari', phone: '081223344556' },
  { id: 103, name: 'Bambang Gunawan', phone: '085678901234' },
  { id: 104, name: 'Dewi Anggraini', phone: '087712345678' },
  { id: 105, name: 'Fajar Nugroho', phone: '089955556666' },
];

/**
 * Searches for members by name or phone number.
 * @param query The search term.
 * @returns A Promise that resolves with an array of matching members.
 */
export const searchMembers = (query: string): Promise<Member[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!query) {
        resolve([]);
        return;
      }
      const lowercasedQuery = query.toLowerCase();
      const results = members.filter(
        (member) =>
          member.name.toLowerCase().includes(lowercasedQuery) ||
          member.phone.includes(query)
      );
      console.log(`API: Found ${results.length} members for query "${query}".`);
      resolve(results);
    }, 400); // Simulate network delay
  });
};