import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';

const SessionsPage: React.FC = () => {
    const { sessions, activeSessionId, switchSession, addSession, isLoading, deleteSession } = useCart();
    const navigate = useNavigate();

    const handleSelectSession = (sessionId: string) => {
        switchSession(sessionId);
        navigate('/pos');
    };

    const handleAddNewSession = () => {
        addSession();
        // The context will automatically switch to the new session,
        // so we just navigate to the POS page.
        navigate('/pos');
    };

    const handleDeleteSession = (sessionId: string, customerName: string) => {
        const sessionName = customerName || 'Pelanggan Umum';
        if (window.confirm(`Apakah Anda yakin ingin menghapus sesi untuk "${sessionName}"? Aksi ini tidak dapat dibatalkan.`)) {
            deleteSession(sessionId);
        }
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-background">Memuat Sesi...</div>;
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-4xl mx-auto bg-surface rounded-2xl shadow-lg p-8">
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                    <h1 className="text-3xl font-bold text-text-primary">Sesi Transaksi Aktif</h1>
                    <button
                        onClick={handleAddNewSession}
                        className="bg-primary text-white font-bold py-2 px-5 rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Transaksi Baru
                    </button>
                </div>

                <div className="space-y-4">
                    {sessions.length === 0 ? (
                        <p className="text-center text-text-secondary py-10">Belum ada sesi aktif. Buat transaksi baru untuk memulai.</p>
                    ) : (
                        sessions.map(session => {
                            const total = session.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
                            const isActive = session.id === activeSessionId;
                            
                            return (
                                <div key={session.id} className={`p-4 rounded-lg border-2 transition-all ${isActive ? 'bg-primary/10 border-primary shadow-md' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h2 className="text-lg font-bold text-text-primary truncate">{session.customer.name || 'Pelanggan Umum'}</h2>
                                                {session.memberId && (
                                                     <span className="text-xs font-bold text-purple-600 bg-purple-100 py-0.5 px-2 rounded-full flex-shrink-0">MEMBER</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-text-secondary">
                                                {session.items.length} item - Total: Rp{total.toLocaleString('id-ID')}
                                                {isActive && <span className="ml-3 text-xs font-bold text-primary bg-primary/20 py-1 px-2 rounded-full">AKTIF</span>}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            <button
                                                onClick={() => navigate(`/pos/customer/${session.id}`)}
                                                className="bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                                            >
                                                Edit Pelanggan
                                            </button>
                                            <button
                                                onClick={() => handleDeleteSession(session.id, session.customer.name)}
                                                disabled={sessions.length <= 1}
                                                className="bg-destructive/10 text-destructive font-semibold py-2 px-4 rounded-lg hover:bg-destructive/20 transition-colors text-sm disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center gap-1.5"
                                                aria-label={`Hapus sesi untuk ${session.customer.name || 'Pelanggan Umum'}`}
                                            >
                                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                                                </svg>
                                                Hapus
                                            </button>
                                            <button
                                                onClick={() => handleSelectSession(session.id)}
                                                className="bg-accent text-white font-bold py-2 px-4 rounded-lg hover:bg-accent-dark transition-colors text-sm"
                                            >
                                                Lanjutkan
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
                 <div className="mt-8 text-center">
                    <button onClick={() => navigate('/pos')} className="text-primary font-semibold hover:underline">
                       &larr; Kembali ke POS
                    </button>
                 </div>
            </div>
        </div>
    );
};

export default SessionsPage;