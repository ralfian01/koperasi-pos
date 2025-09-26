import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import MemberSearchModal from '../components/MemberSearchModal';
import type { Member, Customer } from '../types';

const CustomerPage: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const { sessions, setSessionCustomer, isLoading } = useCart();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [isMemberSearchOpen, setIsMemberSearchOpen] = useState(false);

    useEffect(() => {
        if (!isLoading && sessionId) {
            const currentSession = sessions.find(s => s.id === sessionId);
            if (currentSession) {
                setName(currentSession.customer.name || '');
                setPhone(currentSession.customer.phone || '');
            } else {
                navigate('/pos/sessions');
            }
        }
    }, [isLoading, sessions, sessionId, navigate]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (sessionId) {
            const customer: Customer = { name, phone };
            // Check if the current info matches any existing member to retain member status
            const currentSession = sessions.find(s => s.id === sessionId);
            if (currentSession?.memberId && currentSession.customer.name === name && currentSession.customer.phone === phone) {
                 // No changes that would affect member status, just save
                 setSessionCustomer(sessionId, { customer });
            } else {
                // Treat as a regular customer, this will remove member status and revert prices
                setSessionCustomer(sessionId, { customer });
            }
        }
        navigate('/pos/sessions');
    };
    
    const handleCancel = () => {
      navigate('/pos/sessions');
    };

    const handleMemberSelect = (member: Member) => {
        if (sessionId) {
            setSessionCustomer(sessionId, { member });
        }
        setIsMemberSearchOpen(false);
        // We don't need to manually set name/phone anymore, context does it
        // and it will re-render this component with the new data from `sessions`
    };

    const handleRemoveCustomer = () => {
        if (sessionId) {
             setSessionCustomer(sessionId, { customer: { name: '', phone: ''} });
        }
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Memuat data sesi...</div>
    }

    return (
        <>
            <MemberSearchModal
                isOpen={isMemberSearchOpen}
                onClose={() => setIsMemberSearchOpen(false)}
                onSelect={handleMemberSelect}
            />
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-full max-w-lg p-8 space-y-8 bg-surface rounded-2xl shadow-lg">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-text-primary">Informasi Pelanggan</h1>
                        <p className="text-text-secondary">Sesi ...{sessionId?.slice(-4)}</p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsMemberSearchOpen(true)}
                        className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-primary text-sm font-medium rounded-md text-primary bg-primary/10 hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                        Cari dari Database Member
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-surface px-2 text-sm text-text-secondary">atau isi manual</span>
                        </div>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSave}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="customer-name" className="text-sm font-medium text-text-secondary">
                                    Nama Pelanggan
                                </label>
                                <input
                                    id="customer-name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="mt-1 appearance-none block w-full px-4 py-3 bg-white border border-gray-300 rounded-md shadow-sm text-text-primary placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
                                    placeholder="Masukkan nama pelanggan"
                                />
                            </div>
                            <div>
                                <label htmlFor="customer-phone" className="text-sm font-medium text-text-secondary">
                                    Nomor Telepon
                                </label>
                                <input
                                    id="customer-phone"
                                    name="phone"
                                    type="tel"
                                    autoComplete="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="mt-1 appearance-none block w-full px-4 py-3 bg-white border border-gray-300 rounded-md shadow-sm text-text-primary placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
                                    placeholder="Masukkan nomor telepon"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            >
                                Kembali
                            </button>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            >
                                Simpan Perubahan
                            </button>
                        </div>
                    </form>
                    
                    <div className="pt-4 border-t">
                        <button
                            type="button"
                            onClick={handleRemoveCustomer}
                            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-destructive bg-destructive/10 hover:bg-destructive/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-destructive"
                        >
                            Hapus Pelanggan dari Sesi
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
};

export default CustomerPage;