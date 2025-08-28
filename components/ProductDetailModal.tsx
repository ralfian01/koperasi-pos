import React, { useState, useEffect, useCallback } from 'react';
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
        onSelect(`Slot: ${slot.start_time} - ${slot.end_time} (${dateFormatted})`);
    }

    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="date-picker" className="block text-sm font-medium text-gray-700 mb-1">Pilih Tanggal</label>
                <input 
                    type="date"
                    id="date-picker"
                    value={date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>
            <div>
                <h4 className="text-md font-medium text-gray-800 mb-2">Pilih Slot Waktu</h4>
                {isLoading ? (
                    <p>Memuat slot...</p>
                ) : (
                    <div className="grid grid-cols-3 gap-2">
                        {slots.length > 0 ? slots.map(slot => (
                            <button 
                                key={slot.start_time}
                                disabled={!slot.is_available}
                                onClick={() => handleSelectSlot(slot)}
                                className="px-3 py-2 text-sm font-semibold border rounded-md transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed bg-white text-gray-700 border-gray-300 hover:bg-indigo-50 enabled:hover:border-indigo-500"
                            >
                                {slot.start_time}
                            </button>
                        )) : <p className="text-gray-500 col-span-3">Tidak ada slot tersedia untuk tanggal ini.</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

const ConsumableStockForm: React.FC<{ product: Product; onAdd: (quantity: number, details: string) => void; }> = ({ product, onAdd }) => {
    const [quantity, setQuantity] = useState(1);
    const [duration, setDuration] = useState(1);
    const [unit, setUnit] = useState('Jam');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd(quantity, `Durasi: ${duration} ${unit}`);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Kuantitas</label>
                <input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                />
            </div>
             <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Durasi Sewa</label>
                <div className="mt-1 flex">
                     <input
                        id="duration"
                        type="number"
                        min="1"
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-l-md"
                        required
                    />
                    <select value={unit} onChange={(e) => setUnit(e.target.value)} className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-black">
                        <option>Jam</option>
                        <option>Hari</option>
                    </select>
                </div>
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700">
                Tambahkan ke Keranjang
            </button>
        </form>
    );
};

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ isOpen, product, onClose, onAddToCart }) => {
    if (!isOpen || !product) {
        return null;
    }
    
    const renderContent = () => {
        switch (product.booking_type) {
            case 'time_slot':
                return <TimeSlotPicker 
                    product={product} 
                    onSelect={(details) => onAddToCart(product, { quantity: 1, details })}
                />;
            case 'consumable_stock':
                 return <ConsumableStockForm 
                    product={product} 
                    onAdd={(quantity, details) => onAddToCart(product, { quantity, details })}
                />;
            default:
                return <p>Tipe produk tidak didukung untuk modal ini.</p>
        }
    }

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center backdrop-blur-sm" aria-modal="true" role="dialog">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md m-4">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{product.name}</h2>
                        <p className="text-indigo-600 font-bold mt-1">Rp{product.price.toLocaleString('id-ID')}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
                </div>
                {renderContent()}
            </div>
        </div>
    );
};

export default ProductDetailModal;
