import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentShiftTransactions } from '../services/transactionService';
import type { Transaction } from '../types';
import TransactionDetailModal from '../components/TransactionDetailModal';

const TransactionHistoryPage: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    const fetchTransactions = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getCurrentShiftTransactions();
            // Sort by most recent first
            setTransactions(data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
        } catch (error) {
            console.error("Gagal memuat riwayat transaksi:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const handleTransactionClick = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
    };

    const handleModalClose = () => {
        setSelectedTransaction(null);
    };
    
    const handleRefundSuccess = (updatedTransaction: Transaction) => {
        // Update the list without refetching from the API for better UX
        setTransactions(prev => 
            prev.map(tx => tx.id === updatedTransaction.id ? updatedTransaction : tx)
        );
    };

    return (
        <>
            <TransactionDetailModal 
                isOpen={!!selectedTransaction}
                onClose={handleModalClose}
                transaction={selectedTransaction}
                onRefundSuccess={handleRefundSuccess}
            />
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-8">
                    <div className="flex justify-between items-center mb-8 border-b pb-4">
                        <h1 className="text-3xl font-bold text-gray-800">Riwayat Transaksi Shift</h1>
                        <Link to="/pos" className="text-indigo-600 font-semibold hover:underline">
                            &larr; Kembali ke POS
                        </Link>
                    </div>

                    {isLoading ? (
                        <p className="text-center text-gray-500 py-10">Memuat riwayat...</p>
                    ) : transactions.length === 0 ? (
                        <p className="text-center text-gray-500 py-10">Belum ada transaksi yang tercatat pada shift ini.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Transaksi</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pelanggan</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {transactions.map(tx => (
                                        <tr key={tx.id} onClick={() => handleTransactionClick(tx)} className="hover:bg-gray-50 cursor-pointer">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tx.id.slice(0, 18)}...</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(tx.timestamp).toLocaleTimeString('id-ID')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.customer.name || 'Pelanggan Umum'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-800">Rp{tx.total.toLocaleString('id-ID')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                                {tx.status === 'completed' ? (
                                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        Selesai
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                        Refunded
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default TransactionHistoryPage;
