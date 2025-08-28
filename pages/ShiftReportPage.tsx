import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCurrentShiftTransactions } from '../services/transactionService';
import { stopShift as stopShiftService } from '../services/shiftService';
import { verifyCashierPin } from '../services/cashierService';
import { useShift } from '../hooks/useShift';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import type { Transaction, PaymentMethod } from '../types';
import EndShiftPinModal from '../components/EndShiftPinModal';

interface ProductSalesSummary {
    [productName: string]: {
        quantity: number;
        total: number;
    };
}

const ShiftReportPage: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    
    const navigate = useNavigate();
    const { stopShift, currentCashier } = useShift();
    const { clearAllDataForNewShift } = useCart();
    const { logout } = useAuth();

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const data = await getCurrentShiftTransactions();
                setTransactions(data);
            } catch (error) {
                console.error("Gagal memuat riwayat transaksi shift:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    const completedTransactions = useMemo(() => transactions.filter(tx => tx.status === 'completed'), [transactions]);
    const refundedTransactions = useMemo(() => transactions.filter(tx => tx.status === 'refunded'), [transactions]);

    const productSales = useMemo((): ProductSalesSummary => {
        const summary: ProductSalesSummary = {};
        completedTransactions.forEach(tx => {
            tx.items.forEach(item => {
                if (!summary[item.name]) {
                    summary[item.name] = { quantity: 0, total: 0 };
                }
                summary[item.name].quantity += item.quantity;
                summary[item.name].total += item.price * item.quantity;
            });
        });
        return summary;
    }, [completedTransactions]);

    const grossSales = useMemo(() => completedTransactions.reduce((sum, tx) => sum + tx.total, 0), [completedTransactions]);
    const totalRefunds = useMemo(() => refundedTransactions.reduce((sum, tx) => sum + tx.total, 0), [refundedTransactions]);
    const netSales = useMemo(() => grossSales - totalRefunds, [grossSales, totalRefunds]);

    const paymentMethodBreakdown = useMemo(() => {
        const breakdown: Record<PaymentMethod, number> = { cash: 0, edc: 0, qris: 0 };
        completedTransactions.forEach(tx => {
            breakdown[tx.payment.method] += tx.total;
        });
        return breakdown;
    }, [completedTransactions]);
    
    const handleEndShiftConfirm = async (pin: string) => {
        if (!currentCashier) {
            throw new Error("Tidak ada kasir yang aktif.");
        }
        await verifyCashierPin(pin); // Throws error if pin is incorrect
        await stopShiftService();
        stopShift();
        clearAllDataForNewShift();
        logout();
        navigate('/login');
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Menghitung laporan shift...</div>;
    }

    return (
        <>
            <EndShiftPinModal
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                onConfirm={handleEndShiftConfirm}
            />
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
                    <div className="text-center mb-8 border-b pb-4">
                        <h1 className="text-3xl font-bold text-gray-800">Laporan Shift</h1>
                        <p className="text-gray-500">Kasir: <span className="font-semibold">{currentCashier?.name || 'N/A'}</span></p>
                        <p className="text-sm text-gray-500">{new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}</p>
                    </div>

                    {/* Sales Summary */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">Ringkasan Penjualan</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                            <div className="bg-green-100 p-4 rounded-lg">
                                <p className="text-sm text-green-700 font-semibold">Penjualan Kotor</p>
                                <p className="text-2xl font-bold text-green-800">Rp{grossSales.toLocaleString('id-ID')}</p>
                            </div>
                            <div className="bg-yellow-100 p-4 rounded-lg">
                                <p className="text-sm text-yellow-700 font-semibold">Total Refund</p>
                                <p className="text-2xl font-bold text-yellow-800">Rp{totalRefunds.toLocaleString('id-ID')}</p>
                            </div>
                            <div className="bg-blue-100 p-4 rounded-lg">
                                <p className="text-sm text-blue-700 font-semibold">Penjualan Bersih</p>
                                <p className="text-2xl font-bold text-blue-800">Rp{netSales.toLocaleString('id-ID')}</p>
                            </div>
                        </div>
                    </div>

                     {/* Payment Methods */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">Rincian Metode Pembayaran</h2>
                         <div className="space-y-2 text-md">
                            <div className="flex justify-between p-3 bg-gray-50 rounded-md">
                                <span className="font-semibold text-gray-600">Tunai (Cash)</span>
                                <span className="font-bold text-gray-800">Rp{paymentMethodBreakdown.cash.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between p-3 bg-gray-50 rounded-md">
                                <span className="font-semibold text-gray-600">EDC/Kartu</span>
                                <span className="font-bold text-gray-800">Rp{paymentMethodBreakdown.edc.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between p-3 bg-gray-50 rounded-md">
                                <span className="font-semibold text-gray-600">QRIS</span>
                                <span className="font-bold text-gray-800">Rp{paymentMethodBreakdown.qris.toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Product Sales */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-700 mb-4">Penjualan per Produk</h2>
                        <div className="overflow-x-auto max-h-72 border rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Produk</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Terjual</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Penjualan</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {Object.entries(productSales).length > 0 ? Object.entries(productSales).map(([name, data]) => (
                                        <tr key={name}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{data.quantity}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-right font-semibold">Rp{data.total.toLocaleString('id-ID')}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={3} className="text-center py-10 text-gray-500">Tidak ada produk yang terjual.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t flex justify-between items-center">
                         <Link 
                            to="/pos"
                            className="bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            &larr; Kembali ke POS
                        </Link>
                        <button 
                            onClick={() => setIsPinModalOpen(true)}
                            className="bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 transition-colors shadow-lg"
                        >
                            Selesaikan Shift & Logout
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
};

export default ShiftReportPage;