
// This is a mock API service. It simulates a network request.
// In a real application, this would use axios or fetch to call a real backend.

export const login = (username: string, password: string): Promise<{ token: string }> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (username === 'user' && password === 'password') {
        resolve({ token: 'fake_jwt_token_for_demo_purposes' });
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 1000); // Simulate network delay
  });
};
