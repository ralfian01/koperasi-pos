import type { CartSession, PaymentDetails, Transaction } from '../types';

// Kunci untuk menyimpan transaksi di sessionStorage
const SHIFT_TRANSACTIONS_KEY = 'pos_shift_transactions';

interface TransactionResponse {
  success: boolean;
  transactionId: string;
  message: string;
}

/**
 * MOCK: Mengambil transaksi shift dari sessionStorage.
 */
const getStoredTransactions = (): Transaction[] => {
    try {
        const stored = sessionStorage.getItem(SHIFT_TRANSACTIONS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error("Gagal mem-parsing transaksi dari sessionStorage", e);
        return [];
    }
};

/**
 * MOCK: Menyimpan transaksi shift ke sessionStorage.
 */
const saveStoredTransactions = (transactions: Transaction[]): void => {
    sessionStorage.setItem(SHIFT_TRANSACTIONS_KEY, JSON.stringify(transactions));
};


/**
 * MOCK: Memproses transaksi dengan menyimpannya ke sessionStorage.
 */
export const processTransaction = async (
  cart: CartSession,
  paymentDetails: PaymentDetails,
  totals: { subtotal: number; tax: number; total: number; discount: number; promoApplied: string | null; }
): Promise<TransactionResponse> => {
  console.log("MOCK API: Memproses transaksi...");
  return new Promise((resolve, reject) => {
    setTimeout(() => {
        if (!cart || cart.items.length === 0) {
            return reject(new Error('Keranjang kosong, tidak dapat memproses transaksi.'));
        }

        const newTransaction: Transaction = {
            id: `TRX-${Date.now()}`,
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

        const transactions = getStoredTransactions();
        transactions.push(newTransaction);
        saveStoredTransactions(transactions);

        resolve({
            success: true,
            transactionId: newTransaction.id,
            message: 'Transaksi berhasil diproses.',
        });
    }, 500); // Simulasi jeda jaringan
  });
};

/**
 * MOCK: Mengambil daftar transaksi yang selesai untuk shift saat ini dari sessionStorage.
 */
export const getCurrentShiftTransactions = async (): Promise<Transaction[]> => {
    console.log('MOCK API: Mengambil transaksi shift saat ini...');
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(getStoredTransactions());
        }, 300); // Simulasi jeda jaringan
    });
};


/**
 * MOCK: Mengambil satu transaksi berdasarkan ID-nya dari sessionStorage.
 */
export const getTransactionById = async (transactionId: string): Promise<Transaction> => {
     console.log(`MOCK API: Mengambil transaksi berdasarkan ID: ${transactionId}`);
     return new Promise((resolve, reject) => {
        setTimeout(() => {
            const transactions = getStoredTransactions();
            const transaction = transactions.find(tx => tx.id === transactionId);
            if (transaction) {
                resolve(transaction);
            } else {
                reject(new Error('Transaksi tidak ditemukan.'));
            }
        }, 200);
     });
};

/**
 * MOCK: Me-refund transaksi dengan memperbarui statusnya di sessionStorage.
 */
export const refundTransaction = async (transactionId: string): Promise<Transaction> => {
    console.log(`MOCK API: Me-refund transaksi: ${transactionId}`);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            let transactions = getStoredTransactions();
            let transactionFound = false;
            let alreadyRefunded = false;

            const updatedTransactions = transactions.map(tx => {
                if (tx.id === transactionId) {
                    if (tx.status === 'refunded') {
                        alreadyRefunded = true;
                        return tx;
                    }
                    transactionFound = true;
                    return { ...tx, status: 'refunded' as 'refunded' };
                }
                return tx;
            });
            
            if (alreadyRefunded) {
                return reject(new Error("Transaksi sudah di-refund."));
            }

            if (transactionFound) {
                saveStoredTransactions(updatedTransactions);
                const updatedTx = updatedTransactions.find(tx => tx.id === transactionId);
                if (updatedTx) {
                   resolve(updatedTx);
                } else {
                    reject(new Error('Gagal menemukan transaksi yang diperbarui.'));
                }
            } else {
                reject(new Error('Gagal menemukan transaksi untuk di-refund.'));
            }
        }, 400);
    });
};
