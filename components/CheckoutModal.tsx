import React, { useState, useMemo } from 'react';
import type { CartSession, PaymentMethod, PaymentDetails } from '../types';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirmPayment: (cart: CartSession, paymentDetails: PaymentDetails) => Promise<void>;
    cart: CartSession | null;
    total: number;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onConfirmPayment, cart, total }) => {
    const [activeTab, setActiveTab] = useState<PaymentMethod>('cash');
    const [isProcessing, setIsProcessing] = useState(false);
    
    // State untuk setiap metode pembayaran
    const [cashAmount, setCashAmount] = useState('');
    const [edcLast4, setEdcLast4] = useState('');

    const handleConfirm = async () => {
        if (!cart) return;

        let paymentDetails: PaymentDetails | null = null;
        switch (activeTab) {
            case 'cash':
                const amount = parseFloat(cashAmount);
                if (amount >= total) {
                    paymentDetails = { method: 'cash', amount_paid: amount, change: amount - total };
                }
                break;
            case 'edc':
                 if (edcLast4.length === 4) {
                    paymentDetails = { method: 'edc', last_4_digits: edcLast4 };
                }
                break;
            case 'qris':
                paymentDetails = { method: 'qris', reference_id: `QRIS-${Date.now()}` };
                break;
        }

        if (paymentDetails) {
            setIsProcessing(true);
            try {
                await onConfirmPayment(cart, paymentDetails);
                 // Reset state on successful payment before closing
                setCashAmount('');
                setEdcLast4('');
            } catch (error) {
                console.error("Pembayaran gagal:", error);
                // Optionally show an error message to the user here
            } finally {
                setIsProcessing(false);
            }
        }
    };

    const isConfirmDisabled = useMemo(() => {
        if (isProcessing) return true;
        switch (activeTab) {
            case 'cash':
                return parseFloat(cashAmount) < total || isNaN(parseFloat(cashAmount));
            case 'edc':
                return edcLast4.length !== 4;
            case 'qris':
                return false;
            default:
                return true;
        }
    }, [activeTab, cashAmount, edcLast4, total, isProcessing]);

    const changeAmount = useMemo(() => {
        const amount = parseFloat(cashAmount);
        return amount >= total ? amount - total : 0;
    }, [cashAmount, total]);
    
    if (!isOpen || !cart) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center backdrop-blur-sm" aria-modal="true" role="dialog">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg m-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-800">Pembayaran</h2>
                    <button onClick={onClose} disabled={isProcessing} className="text-gray-400 hover:text-gray-600 text-3xl">&times;</button>
                </div>
                
                <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-800">Total Belanja</span>
                        <span className="text-2xl font-extrabold text-indigo-600">Rp{total.toLocaleString('id-ID')}</span>
                    </div>
                </div>

                <div className="mb-6 border-b border-gray-200">
                    <nav className="flex -mb-px" aria-label="Tabs">
                        {(['cash', 'edc', 'qris'] as PaymentMethod[]).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                disabled={isProcessing}
                                className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === tab 
                                    ? 'border-indigo-500 text-indigo-600' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {tab.toUpperCase()}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="min-h-[150px]">
                    {activeTab === 'cash' && (
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="cash-amount" className="block text-sm font-medium text-gray-700">Jumlah Bayar</label>
                                <input
                                    type="number"
                                    id="cash-amount"
                                    value={cashAmount}
                                    onChange={(e) => setCashAmount(e.target.value)}
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-lg"
                                    placeholder="e.g., 50000"
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-100 rounded-md">
                                <span className="font-medium text-gray-700">Kembalian:</span>
                                <span className="font-bold text-xl text-green-600">Rp{changeAmount.toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                    )}
                     {activeTab === 'edc' && (
                        <div className="space-y-4">
                            <label htmlFor="edc-last4" className="block text-sm font-medium text-gray-700">4 Digit Terakhir Kartu</label>
                            <input
                                type="text"
                                id="edc-last4"
                                value={edcLast4}
                                onChange={(e) => setEdcLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md tracking-[0.5rem] text-center"
                                placeholder="----"
                                autoFocus
                            />
                        </div>
                    )}
                    {activeTab === 'qris' && (
                        <div className="text-center flex flex-col items-center">
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Example" alt="QR Code" className="w-40 h-40 border rounded-lg" />
                             <p className="mt-4 text-gray-600">Pindai kode QR untuk menyelesaikan pembayaran.</p>
                        </div>
                    )}
                </div>

                 <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-4">
                    <button 
                        type="button" 
                        onClick={onClose}
                        disabled={isProcessing}
                        className="w-full sm:w-auto mt-2 sm:mt-0 justify-center rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:bg-gray-200"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isConfirmDisabled}
                        className="w-full sm:w-auto justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 disabled:bg-indigo-300"
                    >
                        {isProcessing ? 'Memproses...' : 'Konfirmasi Pembayaran'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;