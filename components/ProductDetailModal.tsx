import React, { useState, useEffect } from 'react';
import type { Product } from '../types';
import { getProductAvailability, TimeSlot } from '../services/availabilityService';

interface ProductDetailModalProps {
    isOpen: boolean;
    product: Product | null;
    onClose: () => void;
    onAddToCart: (product: Product, options: { quantity: number; details: string; price?: number }) => void;
}

const TimeSlotPicker: React.FC<{ product: Product; onSelect: (details: string) => void; }> = ({ product, onSelect }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [slots, setSlots] = useState<TimeSlot[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (date) {
            setIsLoading(true);
            getProductAvailability(product.id, date)
                .then(setSlots)
                .finally(() => setIsLoading(false));
        }
    }, [date, product.id]);
    
    const handleSelectSlot = (slot: TimeSlot) => {
        const dateFormatted = new Date(date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        // FIX: Completed the onSelect call to pass the formatted details string.
        onSelect(`${dateFormatted}, ${slot.start_time} - ${slot.end_time}`);
    };

    // FIX: Added a return statement with JSX to render the component.
    return (
        <div>
            <label htmlFor="booking-date" className="block text-sm font-medium text-gray-700">Pilih Tanggal</label>
            <input
                type="date"
                id="booking-date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <div className="mt-4">
                {isLoading ? (
                    <p>Memuat slot waktu...</p>
                ) : (
                    <div className="grid grid-cols-3 gap-2">
                        {slots.length > 0 ? slots.map(slot => (
                            <button
                                key={slot.start_time}
                                onClick={() => handleSelectSlot(slot)}
                                disabled={!slot.is_available}
                                className={`p-2 border rounded-md text-sm ${
                                    slot.is_available 
                                        ? 'bg-white hover:bg-indigo-50' 
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                {slot.start_time}
                            </button>
                        )) : <p className="col-span-3 text-center text-gray-500">Tidak ada slot tersedia.</p>}
                    </div>
                )}
            </div>
        </div>
    );
};


const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ isOpen, product, onClose, onAddToCart }) => {
    const [quantity, setQuantity] = useState(1);
    const [details, setDetails] = useState('');

    useEffect(() => {
        if (product) {
            // Reset state when product changes
            setQuantity(1);
            setDetails('');
        }
    }, [product]);

    if (!isOpen || !product) {
        return null;
    }

    const handleSubmit = () => {
        onAddToCart(product, { quantity, details });
    };

    const renderContent = () => {
        switch (product.booking_type) {
            case 'time_slot':
                return <TimeSlotPicker product={product} onSelect={setDetails} />;
            case 'consumable_stock':
            case 'service':
            default:
                return (
                    <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Jumlah</label>
                        <input
                            type="number"
                            id="quantity"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        />
                         <label htmlFor="details" className="block text-sm font-medium text-gray-700 mt-4">Catatan (opsional)</label>
                         <textarea
                            id="details"
                            rows={3}
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                         />
                    </div>
                );
        }
    };
    
    return (
         <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center backdrop-blur-sm" aria-modal="true" role="dialog">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg m-4">
                <div className="flex justify-between items-start mb-6">
                     <div>
                        <h2 className="text-2xl font-bold text-gray-800">{product.name}</h2>
                        <p className="text-gray-500">Masukkan detail item</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl font-bold">&times;</button>
                </div>

                <div className="space-y-4">
                    {renderContent()}
                </div>

                <div className="mt-8 flex justify-end gap-4">
                     <button onClick={onClose} className="bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-lg hover:bg-gray-300">
                        Batal
                    </button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={product.booking_type === 'time_slot' && !details}
                        className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-dark disabled:bg-primary/60"
                    >
                        Tambahkan ke Keranjang
                    </button>
                </div>
            </div>
        </div>
    );
};

// FIX: Added default export to resolve module import error.
export default ProductDetailModal;
