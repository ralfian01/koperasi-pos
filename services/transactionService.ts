import type { CartSession, PaymentDetails, Transaction } from '../types';

const API_BASE_URL = 'https://api.majukoperasiky.my.id';

interface TransactionResponse {
  success: boolean;
  transactionId: string;
  message: string;
}

const getAuthHeaders = (hasBody: boolean = false): Headers => {
  const token = localStorage.getItem('token');
  const headers = new Headers();
  if (hasBody) {
    headers.append('Content-Type', 'application/json');
  }
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }
  return headers;
}

const handleApiError = async (response: Response, defaultMessage: string): Promise<never> => {
    const errorData = await response.json().catch(() => ({ message: defaultMessage }));
    throw new Error(errorData.message || defaultMessage);
}

/**
 * Processes a transaction by sending it to the backend API.
 */
export const processTransaction = async (
  cart: CartSession,
  paymentDetails: PaymentDetails,
  totals: { subtotal: number; tax: number; total: number; discount: number; promoApplied: string | null; }
): Promise<TransactionResponse> => {
  if (!cart || cart.items.length === 0) {
    throw new Error('Keranjang kosong, tidak dapat memproses transaksi.');
  }
  
  const payload = {
    cart,
    paymentDetails,
    totals
  };

  const response = await fetch(`${API_BASE_URL}/transactions`, {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return handleApiError(response, 'Gagal memproses transaksi.');
  }

  return response.json();
};

/**
 * Fetches the list of completed transactions for the current shift from the API.
 */
export const getCurrentShiftTransactions = async (): Promise<Transaction[]> => {
    const response = await fetch(`${API_BASE_URL}/transactions/shift`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        return handleApiError(response, 'Gagal mengambil riwayat transaksi.');
    }
    return response.json();
};


/**
 * Fetches a single transaction by its ID from the API.
 */
export const getTransactionById = async (transactionId: string): Promise<Transaction> => {
    const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        return handleApiError(response, 'Transaksi tidak ditemukan.');
    }
    return response.json();
};

/**
 * Refunds a transaction by calling the API.
 */
export const refundTransaction = async (transactionId: string): Promise<Transaction> => {
    const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}/refund`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        return handleApiError(response, 'Gagal me-refund transaksi.');
    }
    return response.json();
};