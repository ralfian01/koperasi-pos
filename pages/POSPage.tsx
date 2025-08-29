import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useShift } from '../hooks/useShift';
import { startShift as startShiftService } from '../services/shiftService';
import { verifyCashierPin } from '../services/cashierService';
import { getProducts } from '../services/productService';
import { processTransaction } from '../services/transactionService';
import type { Product, CartSession, PaymentDetails, Variant } from '../types';
import ProductDetailModal from '../components/ProductDetailModal';
import CheckoutModal from '../components/CheckoutModal';
import VariantSelectionModal from '../components/VariantSelectionModal';

const POSPage: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const { 
        activeCart, 
        addProductToActiveCart, 
        addProductWithVariantToCart,
        addComplexItemToCart,
        updateActiveCartQuantity, 
        removeItemFromCart,
        deleteSession,
        activeCartSubtotal,
        appliedPromo,
        activeCartDiscount,
        activeCartTax,
        activeCartTotal,
        isLoading: isCartLoading
    } = useCart();
    const { isShiftActive, currentCashier, startShift } = useShift();
    
    // Local state
    const [isLoading, setIsLoading] = useState(false);
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [pin, setPin] = useState('');
    const [pinError, setPinError] = useState<string | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [isProductLoading, setIsProductLoading] = useState(true);
    const [modalProduct, setModalProduct] = useState<Product | null>(null);
    const [variantProduct, setVariantProduct] = useState<Product | null>(null);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('Semua');

    useEffect(() => {
        const loadProducts = async () => {
            if (isShiftActive) {
                setIsProductLoading(true);
                try {
                    const fetchedProducts = await getProducts('all');
                    setProducts(fetchedProducts);
                } catch (error) {
                    console.error("Gagal memuat produk:", error);
                } finally {
                    setIsProductLoading(false);
                }
            } else {
                 setProducts([]);
            }
        };
        loadProducts();
    }, [isShiftActive]);

    const categories = useMemo(() => ['Semua', ...Array.from(new Set(products.map(p => p.category)))], [products]);

    const filteredProducts = useMemo(() => {
        if (selectedCategory === 'Semua') {
            return products;
        }
        return products.filter(product => product.category === selectedCategory);
    }, [products, selectedCategory]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    
    const handleOpenPinModal = () => {
        setPinError(null);
        setPin('');
        setIsPinModalOpen(true);
    };
    
    const handlePinSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pin.length !== 6) {
            setPinError("PIN harus terdiri dari 6 digit.");
            return;
        }
        setIsLoading(true);
        setPinError(null);
        try {
            const cashierData = await verifyCashierPin(pin);
            await startShiftService();
            startShift(cashierData);
            setIsPinModalOpen(false);
        } catch (error) {
            setPinError("PIN kasir tidak valid. Silakan coba lagi.");
        } finally {
            setIsLoading(false);
            setPin('');
        }
    };

    const handleProductClick = (product: Product) => {
        if (!activeCart) return;

        if (product.variants && product.variants.length > 0) {
            setVariantProduct(product);
            return;
        }
        
        if (product.booking_type === 'inventory' || product.booking_type === 'service') {
            addProductToActiveCart(product);
        } else {
            setModalProduct(product);
        }
    };

    const handleAddComplexItem = (product: Product, options: { quantity: number; details: string; price?: number }) => {
        addComplexItemToCart(product, options);
        setModalProduct(null);
    };
    
    const handleAddToCartWithVariant = (product: Product, variant: Variant) => {
        addProductWithVariantToCart(product, variant);
        setVariantProduct(null);
    };

    const handleConfirmPayment = async (cart: CartSession, paymentDetails: PaymentDetails) => {
        try {
            const totals = { 
                subtotal: activeCartSubtotal, 
                discount: activeCartDiscount,
                promoApplied: appliedPromo?.name || null,
                tax: activeCartTax, 
                total: activeCartTotal 
            };
            const result = await processTransaction(cart, paymentDetails, totals);
            // After successful transaction, delete the session
            deleteSession(cart.id);
            setIsCheckoutOpen(false); // Close modal
            navigate(`/pos/receipt/${result.transactionId}`); // Navigate to receipt page
        } catch (error)
 {
            console.error("Gagal memproses transaksi:", error);
            // Optionally show an error to the user in the modal
            // For now, we just log it and the modal remains open for retry
            throw error; // Re-throw to let the modal know it failed
        }
    };
    
    const renderCartContent = () => {
        if (isCartLoading) {
            return <p className="text-gray-500 text-center mt-10">Memuat sesi...</p>;
        }
        
        if (!activeCart) {
            return (
                <div className="text-center mt-10 flex flex-col items-center">
                    <p className="text-gray-500 mb-4">Tidak ada sesi transaksi aktif.</p>
                    <button 
                        onClick={() => navigate('/pos/sessions')}
                        className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700"
                    >
                        Pilih atau Buat Sesi
                    </button>
                </div>
            )
        }

        return (
            <>
                <div onClick={() => navigate('/pos/sessions')} className="border-b pb-4 mb-4 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <h3 className="text-md font-semibold text-gray-600 mb-1">Pelanggan (Sesi ID: ...{activeCart.id.slice(-4)})</h3>
                    {activeCart.customer.name ? (
                        <div>
                             <div className="flex items-center gap-2">
                                <p className="font-bold text-gray-800">{activeCart.customer.name}</p>
                                {activeCart.memberId && (
                                    <span className="text-xs font-bold text-purple-600 bg-purple-100 py-0.5 px-2 rounded-full">MEMBER</span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500">{activeCart.customer.phone}</p>
                        </div>
                    ) : (
                        <p className="text-gray-500">Pelanggan Umum <span className="text-indigo-500 text-sm">(Ganti Sesi)</span></p>
                    )}
                </div>
                
                <div className="flex-grow overflow-y-auto">
                    {activeCart.items.length === 0 ? (
                        <p className="text-gray-500 text-center mt-10">Keranjang masih kosong.</p>
                    ) : (
                        activeCart.items.map(item => {
                            const product = products.find(p => p.id === item.product_id);
                            
                            return (
                             <div key={item.id} className="flex justify-between items-center mb-3">
                                <div className="flex-grow">
                                    <p className="font-semibold text-sm text-gray-800">{item.name}</p>
                                    {item.details ? (
                                        <p className="text-xs text-indigo-600 font-medium">{item.details}</p>
                                    ) : (
                                        <p className="text-xs text-gray-500">Rp{item.price.toLocaleString('id-ID')}</p>
                                    )}
                                </div>
                                <div className="flex items-center" style={{minWidth: '100px', justifyContent: 'center'}}>
                                    {(product?.booking_type === 'inventory' || product?.booking_type === 'service') || (item.name.includes('(') && item.name.includes(')')) ? (
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => updateActiveCartQuantity(item.id, -1)} className="w-6 h-6 bg-gray-200 text-black rounded-full font-bold text-sm hover:bg-gray-300">-</button>
                                            <span className="w-8 text-center font-medium text-gray-700">{item.quantity}</span>
                                            <button onClick={() => updateActiveCartQuantity(item.id, 1)} className="w-6 h-6 bg-gray-200 text-black rounded-full font-bold text-sm hover:bg-gray-300">+</button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-700">x{item.quantity}</span>
                                            <button 
                                                onClick={() => removeItemFromCart(item.id)}
                                                className="text-red-500 hover:text-red-700 p-1 rounded-full transition-colors"
                                                aria-label={`Hapus ${item.name}`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <p className="w-20 text-right font-semibold text-sm text-gray-700">Rp{(item.price * item.quantity).toLocaleString('id-ID')}</p>
                             </div>
                            );
                        })
                    )}
                </div>
                
                <div className="border-t pt-4 mt-4 space-y-2">
                    <div className="flex justify-between items-center text-md">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium text-gray-800">Rp{activeCartSubtotal.toLocaleString('id-ID')}</span>
                    </div>
                    {appliedPromo && (
                        <div className="flex justify-between items-center text-md text-green-600">
                            <span className="font-semibold">{appliedPromo.name}</span>
                            <span className="font-semibold">-Rp{activeCartDiscount.toLocaleString('id-ID')}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center text-md">
                        <span className="text-gray-600">PPN (11%)</span>
                        <span className="font-medium text-gray-800">Rp{activeCartTax.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg pt-2 border-t mt-2">
                        <span className="font-bold text-gray-800">Total</span>
                        <span className="font-extrabold text-indigo-600">Rp{activeCartTotal.toLocaleString('id-ID')}</span>
                    </div>
                    <button 
                        onClick={() => setIsCheckoutOpen(true)}
                        disabled={activeCart.items.length === 0} 
                        className="w-full !mt-4 bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
                    >
                        Checkout
                    </button>
                </div>
            </>
        )
    }

  return (
    <>
    <ProductDetailModal 
        isOpen={!!modalProduct}
        product={modalProduct}
        onClose={() => setModalProduct(null)}
        onAddToCart={handleAddComplexItem}
    />
    <VariantSelectionModal
        isOpen={!!variantProduct}
        product={variantProduct}
        onClose={() => setVariantProduct(null)}
        onAddToCart={handleAddToCartWithVariant}
    />
    <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={activeCart}
        total={activeCartTotal}
        onConfirmPayment={handleConfirmPayment}
    />
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
        {!isShiftActive && (
            <div className="absolute inset-0 bg-gray-900 bg-opacity-70 z-40 flex items-center justify-center backdrop-blur-sm">
                <div className="bg-white p-10 rounded-xl shadow-2xl text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Shift Belum Dimulai</h2>
                    <p className="text-gray-600 mb-8">Klik tombol di bawah untuk memulai shift baru.</p>
                    <button onClick={handleOpenPinModal} className="w-full bg-green-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 shadow-lg">
                        Mulai Shift
                    </button>
                </div>
            </div>
        )}
        {isPinModalOpen && (
            <div className="absolute inset-0 bg-gray-900 bg-opacity-80 z-50 flex items-center justify-center backdrop-blur-md">
                <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-sm">
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Masukkan PIN Kasir</h2>
                    <form onSubmit={handlePinSubmit}>
                        <input type="password" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} maxLength={6} autoFocus className="w-full text-center text-3xl tracking-[1rem] text-gray-800 bg-gray-100 border-2 border-gray-300 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="------" />
                        {pinError && <p className="text-red-500 text-sm text-center mt-4">{pinError}</p>}
                        <div className="flex gap-4 mt-8">
                             <button type="button" onClick={() => setIsPinModalOpen(false)} className="w-full bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors">Batal</button>
                             <button type="submit" disabled={isLoading || pin.length !== 6} className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition-colors">
                                {isLoading ? 'Memverifikasi...' : 'Verifikasi'}
                             </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
        
        <header className="bg-white shadow-md p-4 flex justify-between items-center z-10">
             <h1 className="text-2xl font-bold text-gray-800">Sistem POS</h1>
             <div className="space-x-4 flex items-center">
                {isShiftActive && currentCashier && (<span className="text-gray-700 font-medium">Kasir: <span className="font-bold text-indigo-600">{currentCashier.name}</span></span>)}
                {isShiftActive && (
                    <>
                        <Link to="/pos/history" className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-300">
                           Riwayat Transaksi
                        </Link>
                        <Link to="/pos/shift-report" className="bg-yellow-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors duration-300">
                           Selesai Shift
                        </Link>
                    </>
                )}
                <button onClick={handleLogout} className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors duration-300">Logout</button>
             </div>
        </header>
        
        <main className={`flex-grow p-4 grid grid-cols-10 gap-4 transition-filter duration-300 ${!isShiftActive || !!modalProduct || !!variantProduct || isCheckoutOpen ? 'blur-sm pointer-events-none' : ''}`}>
            <div className={`col-span-7 bg-white p-4 rounded-lg shadow ${!activeCart ? 'opacity-50 pointer-events-none' : ''}`}>
                <h2 className="text-xl font-bold text-gray-700 mb-4">Daftar Produk</h2>
                <div className="flex flex-wrap gap-2 mb-4 border-b pb-4">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
                                selectedCategory === category
                                    ? 'bg-indigo-600 text-white shadow'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
                {isProductLoading ? (
                    <div className="text-center p-10">Memuat produk...</div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filteredProducts.map(product => (
                            <div key={product.id} onClick={() => handleProductClick(product)} className="border rounded-lg p-2 cursor-pointer hover:shadow-lg hover:border-indigo-500 transition-all duration-200 flex flex-col">
                                <img src={product.image_url} alt={product.name} className="w-full h-32 object-cover rounded-md mb-2" />
                                <h3 className="font-semibold text-sm text-gray-800 flex-grow">{product.name}</h3>
                                <p className="text-indigo-600 font-bold mt-1">Rp{product.price.toLocaleString('id-ID')}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="col-span-3 bg-white p-4 rounded-lg shadow flex flex-col">
                <h2 className="text-xl font-bold text-gray-700 mb-4">Keranjang</h2>
                {renderCartContent()}
            </div>
        </main>
    </div>
    </>
  );
};

export default POSPage;