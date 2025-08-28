import type { Promo } from '../types';

const allPromos: Promo[] = [
  {
    id: 'PROMO01',
    name: 'Diskon Hari Kerja',
    type: 'weekday',
    value: 10, // 10%
  },
  {
    id: 'PROMO02',
    name: 'Diskon Akhir Pekan',
    type: 'weekend',
    value: 15, // 15%
  },
  {
    id: 'PROMO03',
    name: 'Diskon Happy Hour',
    type: 'happy_hour',
    value: 20, // 20%
    happy_hour_start: 15, // 3 PM
    happy_hour_end: 17,   // 5 PM
  },
  {
    id: 'PROMO04',
    name: 'Diskon Belanja Min. 100rb',
    type: 'min_spend',
    value: 5, // 5%
    min_spend: 100000,
  },
];

/**
 * Fetches all available promos from the mock API.
 * @returns A Promise that resolves with an array of promos.
 */
export const getActivePromos = (): Promise<Promo[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('API: Fetched all active promos.');
      resolve(allPromos);
    }, 300); // Simulate network delay
  });
};
