import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTransactionById } from '../services/transactionService';
import type { Transaction, CartItem } from '../types';

const ReceiptPage: React.FC = () => {
    const { transactionId } = useParams<{ transactionId: string }>();
    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (transactionId) {
            getTransactionById(transactionId)
                .then(setTransaction)
                .catch(err => setError(err.message || "Gagal memuat detail transaksi."))
                .finally(() => setIsLoading(false));
        } else {
            setError("ID Transaksi tidak ditemukan.");
            setIsLoading(false);
        }
    }, [transactionId]);
    
    const handlePrint = () => {
        window.print();
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Memuat struk...</div>;
    }
    
    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center">
                <p className="text-red-500 text-xl mb-4">{error}</p>
                <Link to="/pos" className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700">
                    Kembali ke POS
                </Link>
            </div>
        );
    }
    
    if (!transaction) {
        return null;
    }

    return (
        <>
            <style>
                {`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        .receipt-container, .receipt-container * {
                            visibility: visible;
                        }
                        .receipt-container {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            box-shadow: none;
                            border: none;
                        }
                        .no-print {
                            display: none;
                        }
                        body {
                           background-color: #fff;
                        }
                    }
                `}
            </style>
            <div className="min-h-screen bg-gray-200 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md bg-white shadow-lg receipt-container text-black">
                    <div className="p-8">
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold">Struk Belanja</h1>
                            <p>Toko Serba Ada</p>
                        </div>

                        <div className="border-t border-b border-dashed border-black py-3 text-sm">
                            <div className="flex justify-between">
                                <span>No. Transaksi:</span>
                                <span>{transaction.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tanggal:</span>
                                <span>{new Date(transaction.timestamp).toLocaleDateString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Waktu:</span>
                                <span>{new Date(transaction.timestamp).toLocaleTimeString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Pelanggan:</span>
                                <span>{transaction.customer.name || 'Umum'}</span>
                            </div>
                        </div>

                        <div className="py-4">
                            {transaction.items.map((item: CartItem) => (
                                <div key={item.id} className="flex justify-between text-sm mb-2">
                                    <div className="flex-grow">
                                        <p>{item.name}</p>
                                        <p>{item.quantity} x @{item.price.toLocaleString('id-ID')}</p>
                                    </div>
                                    <span className="w-24 text-right">Rp{(item.price * item.quantity).toLocaleString('id-ID')}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-dashed border-black pt-4 text-sm space-y-1">
                             <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>Rp{transaction.subtotal.toLocaleString('id-ID')}</span>
                            </div>
                            {transaction.discount && transaction.discount > 0 && (
                                <div className="flex justify-between">
                                    <span>Diskon ({transaction.promo_applied || 'Promo'})</span>
                                    <span>-Rp{transaction.discount.toLocaleString('id-ID')}</span>
                                </div>
                             )}
                             <div className="flex justify-between">
                                <span>PPN (11%)</span>
                                <span>Rp{transaction.tax.toLocaleString('id-ID')}</span>
                            </div>
                             <div className="flex justify-between font-bold text-base pt-1">
                                <span>Total</span>
                                <span>Rp{transaction.total.toLocaleString('id-ID')}</span>
                            </div>
                            {transaction.payment.method === 'cash' && (
                                <>
                                <div className="flex justify-between mt-2 border-t border-dashed pt-2">
                                    <span>Tunai</span>
                                    <span>Rp{transaction.payment.amount_paid.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Kembalian</span>
                                    <span>Rp{transaction.payment.change.toLocaleString('id-ID')}</span>
                                </div>
                                </>
                            )}
                            {transaction.payment.method === 'edc' && (
                                <div className="flex justify-between mt-2 border-t border-dashed pt-2">
                                    <span>EDC/Kartu</span>
                                    <span>**** {transaction.payment.last_4_digits}</span>
                                </div>
                            )}
                            {transaction.payment.method === 'qris' && (
                                <div className="flex justify-between mt-2 border-t border-dashed pt-2">
                                    <span>QRIS</span>
                                    <span>Dibayar</span>
                                </div>
                            )}
                        </div>

                        <div className="text-center mt-8 text-xs">
                            <p>Terima kasih telah berbelanja!</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex gap-4 w-full max-w-md no-print">
                    <Link to="/pos" className="w-full text-center bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700">
                        Transaksi Baru
                    </Link>
                    <button onClick={handlePrint} className="w-full bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600">
                        Cetak Struk
                    </button>
                </div>
            </div>
        </>
    );
};

export default ReceiptPage;
