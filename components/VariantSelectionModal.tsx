import React from 'react';
import type { Product, Variant } from '../types';

interface VariantSelectionModalProps {
    isOpen: boolean;
    product: Product | null;
    onClose: () => void;
    onAddToCart: (product: Product, variant: Variant) => void;
}

const VariantSelectionModal: React.FC<VariantSelectionModalProps> = ({ isOpen, product, onClose, onAddToCart }) => {
    if (!isOpen || !product || !product.variants) {
        return null;
    }

    const handleSelectVariant = (variant: Variant) => {
        onAddToCart(product, variant);
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center backdrop-blur-sm" aria-modal="true" role="dialog">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md m-4">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{product.name}</h2>
                        <p className="text-gray-500">Pilih salah satu varian</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl font-bold">&times;</button>
                </div>

                <div className="space-y-3">
                    {product.variants.map((variant) => (
                        <button
                            key={variant.name}
                            onClick={() => handleSelectVariant(variant)}
                            className="w-full flex justify-between items-center p-4 border rounded-lg text-left hover:bg-indigo-50 hover:border-indigo-500 transition-all duration-200"
                        >
                            <span className="text-lg font-semibold text-gray-700">{variant.name}</span>
                            <span className="text-lg font-bold text-indigo-600">Rp{variant.price.toLocaleString('id-ID')}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default VariantSelectionModal;
