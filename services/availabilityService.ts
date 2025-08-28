// This is a mock API service for product availability.
export interface TimeSlot {
  start_time: string;
  end_time: string;
  is_available: boolean;
}

// Mock database of availability. In a real app, this would be a database query.
const availability: Record<string, TimeSlot[]> = {
  '11': [ // Corresponds to Product ID 11
    { start_time: "09:00", end_time: "10:00", is_available: true },
    { start_time: "10:00", end_time: "11:00", is_available: true },
    { start_time: "11:00", end_time: "12:00", is_available: false }, // Booked
    { start_time: "12:00", end_time: "13:00", is_available: true },
    { start_time: "13:00", end_time: "14:00", is_available: false }, // Booked
    { start_time: "14:00", end_time: "15:00", is_available: true },
    { start_time: "15:00", end_time: "16:00", is_available: true },
    { start_time: "16:00", end_time: "17:00", is_available: true },
  ]
};

/**
 * Fetches the availability schedule for a given product on a specific date.
 * @param productId The ID of the product.
 * @param date The date in YYYY-MM-DD format (currently unused in mock).
 * @returns A Promise that resolves with an array of time slots.
 */
export const getProductAvailability = (productId: number, date: string): Promise<TimeSlot[]> => {
  console.log(`API: Fetching availability for product ${productId} on ${date}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const productSlots = availability[productId.toString()];
      if (productSlots) {
        // Simulate some random changes for different days
        const dayOfMonth = parseInt(date.split('-')[2], 10);
        const dynamicSlots = productSlots.map((slot, index) => ({
            ...slot,
            is_available: (index + dayOfMonth) % 3 !== 0 ? slot.is_available : !slot.is_available,
        }));
        resolve(dynamicSlots);
      } else {
        // Return empty array if product has no time slots defined
        resolve([]);
      }
    }, 500); // Simulate network delay
  });
};
