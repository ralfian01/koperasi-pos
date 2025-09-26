import type { Promo } from '../types';

const mockPromos: Promo[] = [
    { id: 'PROMO1', name: 'Diskon Hari Kerja', type: 'weekday', value: 10 },
    { id: 'PROMO2', name: 'Happy Hour Sore', type: 'happy_hour', value: 20, happy_hour_start: 14, happy_hour_end: 17 },
    { id: 'PROMO3', name: 'Diskon Belanja > 50rb', type: 'min_spend', value: 15, min_spend: 50000 },
];

/**
 * Fetches all available promos from a mock source.
 * @returns A Promise that resolves with an array of promos.
 */
export const getActivePromos = async (): Promise<Promo[]> => {
  console.log('MOCK API: Fetching promos...');
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockPromos);
    }, 300); // Simulate network delay
  });
};
