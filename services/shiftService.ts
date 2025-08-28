// This is a mock API service for shift management.
// It simulates network requests for starting and stopping a shift.

export const startShift = (): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real app, you would make a POST request to /api/shifts/start
      console.log('API: Shift started successfully.');
      resolve({ success: true, message: 'Shift started successfully.' });
    }, 500); // Simulate network delay
  });
};

export const stopShift = (): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real app, you would make a POST request to /api/shifts/stop
      console.log('API: Shift stopped successfully.');
      resolve({ success: true, message: 'Shift stopped successfully.' });
    }, 500); // Simulate network delay
  });
};
