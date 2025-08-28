import React, { useState } from 'react';

interface EndShiftPinModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (pin: string) => Promise<void>;
}

const EndShiftPinModal: React.FC<EndShiftPinModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const [pin, setPin] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await onConfirm(pin);
            onClose(); // Close on success
        } catch (err: any) {
            setError(err.message || "Terjadi kesalahan. Silakan coba lagi.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleClose = () => {
        if (isLoading) return;
        setPin('');
        setError(null);
        onClose();
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 z-50 flex items-center justify-center backdrop-blur-md">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-sm">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Konfirmasi Selesai Shift</h2>
                <p className="text-center text-gray-500 mb-6">Masukkan PIN Anda untuk mengotorisasi.</p>
                <form onSubmit={handleSubmit}>
                    <input 
                        type="password" 
                        value={pin} 
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} 
                        maxLength={6} 
                        autoFocus 
                        className="w-full text-center text-3xl tracking-[1rem] text-gray-800 bg-gray-100 border-2 border-gray-300 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                        placeholder="------" 
                    />
                    {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
                    <div className="flex gap-4 mt-8">
                         <button 
                            type="button" 
                            onClick={handleClose} 
                            disabled={isLoading}
                            className="w-full bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                        >
                            Batal
                        </button>
                         <button 
                            type="submit" 
                            disabled={isLoading || pin.length !== 6} 
                            className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300 transition-colors"
                        >
                            {isLoading ? 'Memproses...' : 'Konfirmasi'}
                         </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EndShiftPinModal;