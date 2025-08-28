import type { CartSession, PaymentDetails, Transaction } from '../types';

const SHIFT_TRANSACTIONS_KEY = 'pos_shift_transactions';

interface TransactionResponse {
  success: boolean;
  transactionId: string;
  message: string;
}

// Helper function to get transactions from sessionStorage without delay
const getCurrentShiftTransactionsSync = (): Transaction[] => {
  try {
    const storedData = sessionStorage.getItem(SHIFT_TRANSACTIONS_KEY);
    return storedData ? JSON.parse(storedData) : [];
  } catch (error) {
    console.error("Gagal membaca riwayat transaksi dari sessionStorage", error);
    return [];
  }
};

/**
 * Mocks processing a transaction, then saves it to sessionStorage to simulate a shift history.
 */
export const processTransaction = (
  cart: CartSession,
  paymentDetails: PaymentDetails,
  totals: { subtotal: number; tax: number; total: number; discount: number; promoApplied: string | null; }
): Promise<TransactionResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!cart || cart.items.length === 0) {
        return reject(new Error('Keranjang kosong, tidak dapat memproses transaksi.'));
      }

      const transactionId = `TRX-${Date.now()}`;

      const newTransaction: Transaction = {
        id: transactionId,
        cart_id: cart.id,
        timestamp: new Date().toISOString(),
        customer: cart.customer,
        items: cart.items,
        subtotal: totals.subtotal,
        promo_applied: totals.promoApplied ?? undefined,
        discount: totals.discount,
        tax: totals.tax,
        total: totals.total,
        payment: paymentDetails,
        status: 'completed',
      };

      try {
        const existingTransactions = getCurrentShiftTransactionsSync();
        const updatedTransactions = [...existingTransactions, newTransaction];
        sessionStorage.setItem(SHIFT_TRANSACTIONS_KEY, JSON.stringify(updatedTransactions));
        
        console.log('API: Transaksi berhasil diproses dan disimpan ke riwayat shift:', newTransaction);
        
        resolve({
          success: true,
          transactionId,
          message: 'Pembayaran berhasil dikonfirmasi.',
        });
      } catch (error) {
        console.error("Gagal menyimpan transaksi ke riwayat shift", error);
        reject(new Error("Gagal menyimpan riwayat transaksi."));
      }
    }, 1500);
  });
};

/**
 * Fetches the list of completed transactions for the current shift from sessionStorage.
 */
export const getCurrentShiftTransactions = (): Promise<Transaction[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(getCurrentShiftTransactionsSync());
        }, 500); // Simulate network delay
    });
};


/**
 * Fetches a single transaction by its ID from sessionStorage.
 */
export const getTransactionById = (transactionId: string): Promise<Transaction> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const transactions = getCurrentShiftTransactionsSync();
            const transaction = transactions.find(tx => tx.id === transactionId);
            if (transaction) {
                resolve(transaction);
            } else {
                reject(new Error("Transaksi tidak ditemukan."));
            }
        }, 300); // Simulate network delay
    });
};

/**
 * Mocks refunding a transaction by updating its status in sessionStorage.
 */
export const refundTransaction = (transactionId: string): Promise<Transaction> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const transactions = getCurrentShiftTransactionsSync();
            let refundedTransaction: Transaction | null = null;
            
            const updatedTransactions = transactions.map(tx => {
                if (tx.id === transactionId) {
                    if (tx.status === 'refunded') {
                        reject(new Error("Transaksi ini sudah di-refund."));
                        return tx;
                    }
                    refundedTransaction = { ...tx, status: 'refunded' };
                    return refundedTransaction;
                }
                return tx;
            });

            if (refundedTransaction) {
                 try {
                    sessionStorage.setItem(SHIFT_TRANSACTIONS_KEY, JSON.stringify(updatedTransactions));
                    console.log(`API: Transaksi ${transactionId} berhasil di-refund.`);
                    resolve(refundedTransaction);
                 } catch (error) {
                    reject(new Error("Gagal menyimpan status refund."));
                 }
            } else {
                reject(new Error("Transaksi tidak ditemukan."));
            }
        }, 1000); // Simulate network delay for refund process
    });
};
