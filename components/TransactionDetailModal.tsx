import React, { useState } from 'react';
import type { Transaction, CartItem } from '../types';
import { refundTransaction } from '../services/transactionService';

interface TransactionDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: Transaction | null;
    onRefundSuccess: (updatedTransaction: Transaction) => void;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({ isOpen, onClose, transaction, onRefundSuccess }) => {
    const [isRefunding, setIsRefunding] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    if (!isOpen || !transaction) return null;

    const handleRefund = async () => {
        if (!transaction) return;
        setIsRefunding(true);
        setError(null);
        try {
            const updatedTx = await refundTransaction(transaction.id);
            onRefundSuccess(updatedTx);
            onClose(); // Close modal on success
        } catch (err: any) {
            setError(err.message || "Gagal memproses refund.");
        } finally {
            setIsRefunding(false);
        }
    };

    const renderPaymentDetails = () => {
        switch(transaction.payment.method) {
            case 'cash':
                return (
                    <div>
                        <p>Metode: <span className="font-semibold">Tunai</span></p>
                        <p>Dibayar: <span className="font-semibold">Rp{transaction.payment.amount_paid.toLocaleString('id-ID')}</span></p>
                        <p>Kembalian: <span className="font-semibold">Rp{transaction.payment.change.toLocaleString('id-ID')}</span></p>
                    </div>
                );
            case 'edc':
                 return (
                    <div>
                        <p>Metode: <span className="font-semibold">EDC/Kartu</span></p>
                        <p>4 Digit Terakhir: <span className="font-semibold">**** **** **** {transaction.payment.last_4_digits}</span></p>
                    </div>
                );
            case 'qris':
                return (
                    <div>
                        <p>Metode: <span className="font-semibold">QRIS</span></p>
                        <p>ID Referensi: <span className="font-semibold">{transaction.payment.reference_id}</span></p>
                    </div>
                );
        }
    }

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center backdrop-blur-sm" aria-modal="true" role="dialog">
            <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-2xl m-4 max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4 border-b pb-3">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Detail Transaksi</h2>
                        <p className="text-sm text-gray-500">ID: {transaction.id}</p>
                    </div>
                    <button onClick={onClose} disabled={isRefunding} className="text-gray-400 hover:text-gray-600 text-3xl">&times;</button>
                </div>

                <div className="overflow-y-auto flex-grow pr-2">
                    {transaction.status === 'refunded' && (
                        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
                            <p className="font-bold">Transaksi Dibatalkan</p>
                            <p>Transaksi ini telah di-refund dan tidak berlaku lagi.</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Customer & Time Details */}
                        <div className="space-y-4">
                             <div className="text-gray-700">
                                <h3 className="text-lg font-semibold text-gray-700 mb-2 border-b pb-1">Informasi Pelanggan</h3>
                                <p>Nama: <span className="font-semibold">{transaction.customer.name || 'Pelanggan Umum'}</span></p>
                                <p>Telepon: <span className="font-semibold">{transaction.customer.phone || '-'}</span></p>
                            </div>
                            <div className="text-gray-700" >
                                <h3 className="text-lg font-semibold text-gray-700 mb-2 border-b pb-1">Waktu Transaksi</h3>
                                <p>{new Date(transaction.timestamp).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'long' })}</p>
                            </div>
                        </div>

                        {/* Payment Details */}
                        <div className="text-gray-700">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2 border-b pb-1">Detail Pembayaran</h3>
                            {renderPaymentDetails()}
                        </div>
                    </div>

                     {/* Items List */}
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2 border-b pb-1">Item yang Dibeli</h3>
                        <div className="space-y-2 text-gray-700">
                            {transaction.items.map((item: CartItem) => (
                                <div key={item.id} className="flex justify-between items-start bg-gray-50 p-2 rounded-md">
                                    <div>
                                        <p className="font-semibold">{item.name} <span className="font-normal text-gray-600">x{item.quantity}</span></p>
                                        <p className="text-sm text-gray-500">@{item.price.toLocaleString('id-ID')}</p>
                                        {item.details && <p className="text-sm text-indigo-600">{item.details}</p>}
                                    </div>
                                    <p className="font-semibold">Rp{(item.price * item.quantity).toLocaleString('id-ID')}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="mt-4 border-t pt-4 space-y-1 text-md">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-semibold text-gray-800">Rp{transaction.subtotal.toLocaleString('id-ID')}</span>
                        </div>
                         {transaction.discount && transaction.discount > 0 && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Diskon ({transaction.promo_applied || 'Promo'})</span>
                                <span className="font-semibold text-green-600">-Rp{transaction.discount.toLocaleString('id-ID')}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-gray-600">PPN (11%)</span>
                            <span className="font-semibold text-gray-800">Rp{transaction.tax.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between font-bold text-xl pt-1">
                            <span>Total</span>
                            <span className="text-indigo-600">Rp{transaction.total.toLocaleString('id-ID')}</span>
                        </div>
                    </div>

                </div>

                <div className="mt-6 border-t pt-4">
                     {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                     <div className="flex justify-end gap-4">
                        <button onClick={onClose} disabled={isRefunding} className="bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-lg hover:bg-gray-300">Tutup</button>
                        <button 
                            onClick={handleRefund}
                            disabled={isRefunding || transaction.status === 'refunded'}
                            className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed"
                        >
                            {isRefunding ? 'Memproses...' : 'Refund Transaksi'}
                        </button>
                     </div>
                </div>

            </div>
        </div>
    );
};

export default TransactionDetailModal;
