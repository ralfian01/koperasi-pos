import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getSessions, saveSessions, getActiveSessionId, saveActiveSessionId } from '../services/cartService';
import { getActivePromos } from '../services/promoService';
import { getProducts } from '../services/productService'; // Import product service
import type { CartSession, CartContextType, Customer, Product, CartItem, Promo, Member, Variant } from '../types';

export const CartContext = createContext<CartContextType | null>(null);

const createNewSession = (): CartSession => ({
    id: Date.now().toString() + Math.random().toString(36).substring(2),
    customer: { name: '', phone: '' },
    items: [],
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [sessions, setSessions] = useState<CartSession[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [promos, setPromos] = useState<Promo[]>([]);
    const [products, setProducts] = useState<Product[]>([]); // State for products

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [storedSessions, availablePromos, allProducts] = await Promise.all([
                    getSessions(),
                    getActivePromos(),
                    getProducts('all')
                ]);

                setPromos(availablePromos);
                setProducts(allProducts);
                
                const storedActiveId = getActiveSessionId();
                
                if (storedSessions.length > 0) {
                    setSessions(storedSessions);
                    if (storedActiveId && storedSessions.some(s => s.id === storedActiveId)) {
                        setActiveSessionId(storedActiveId);
                    } else {
                        setActiveSessionId(storedSessions[0].id);
                    }
                } else {
                    const newSession = createNewSession();
                    setSessions([newSession]);
                    setActiveSessionId(newSession.id);
                }
            } catch (error) {
                console.error("Gagal memuat data awal:", error);
                 const newSession = createNewSession();
                 setSessions([newSession]);
                 setActiveSessionId(newSession.id);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        if (!isLoading) {
            saveSessions(sessions);
        }
    }, [sessions, isLoading]);

    useEffect(() => {
        if (activeSessionId) {
            saveActiveSessionId(activeSessionId);
        }
    }, [activeSessionId]);

    const updateSessions = (updatedSession: CartSession) => {
        setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
    };

    const addProductToActiveCart = useCallback((product: Product) => {
        const active = sessions.find(s => s.id === activeSessionId);
        if (!active) return;

        const isMember = !!active.memberId;
        const price = isMember && product.member_price ? product.member_price : product.price;

        const existingItem = active.items.find(item => item.product_id === product.id && !item.details);
        let newItems: CartItem[];

        if (existingItem) {
            newItems = active.items.map(item =>
                item.id === existingItem.id ? { ...item, quantity: item.quantity + 1, price } : item // Update price on re-add
            );
        } else {
            const newItem: CartItem = {
                id: Date.now().toString(),
                product_id: product.id,
                name: product.name,
                price: price,
                quantity: 1
            };
            newItems = [...active.items, newItem];
        }
        updateSessions({ ...active, items: newItems });
    }, [sessions, activeSessionId]);

    const addProductWithVariantToCart = useCallback((product: Product, variant: Variant) => {
        const active = sessions.find(s => s.id === activeSessionId);
        if (!active) return;

        const itemName = `${product.name} (${variant.name})`;
        const itemPrice = variant.price;

        const existingItem = active.items.find(item => item.name === itemName);
        let newItems: CartItem[];

        if (existingItem) {
            newItems = active.items.map(item =>
                item.id === existingItem.id ? { ...item, quantity: item.quantity + 1 } : item
            );
        } else {
            const newItem: CartItem = {
                id: Date.now().toString(),
                product_id: product.id,
                name: itemName,
                price: itemPrice,
                quantity: 1
            };
            newItems = [...active.items, newItem];
        }
        updateSessions({ ...active, items: newItems });
    }, [sessions, activeSessionId]);

    const addComplexItemToCart = useCallback((product: Product, options: { quantity: number; details: string; price?: number }) => {
        const active = sessions.find(s => s.id === activeSessionId);
        if (!active) return;

        const isMember = !!active.memberId;
        const defaultPrice = isMember && product.member_price ? product.member_price : product.price;

        const newItem: CartItem = {
            id: Date.now().toString(),
            product_id: product.id,
            name: product.name,
            price: options.price ?? defaultPrice,
            quantity: options.quantity,
            details: options.details,
        };
        
        const newItems = [...active.items, newItem];
        updateSessions({ ...active, items: newItems });
    }, [sessions, activeSessionId]);


    const updateActiveCartQuantity = useCallback((itemId: string, change: 1 | -1) => {
        const active = sessions.find(s => s.id === activeSessionId);
        if (!active) return;
        
        const newItems = active.items
            .map(item => item.id === itemId ? { ...item, quantity: item.quantity + change } : item)
            .filter(item => item.quantity > 0);
        
        updateSessions({ ...active, items: newItems });
    }, [sessions, activeSessionId]);
    
    const removeItemFromCart = useCallback((itemId: string) => {
        const active = sessions.find(s => s.id === activeSessionId);
        if (!active) return;

        const newItems = active.items.filter(item => item.id !== itemId);

        updateSessions({ ...active, items: newItems });
    }, [sessions, activeSessionId]);


    const switchSession = useCallback((sessionId: string) => {
        if (sessions.some(s => s.id === sessionId)) {
            setActiveSessionId(sessionId);
        }
    }, [sessions]);

    const addSession = useCallback(() => {
        const newSession = createNewSession();
        setSessions(prev => [...prev, newSession]);
        setActiveSessionId(newSession.id);
    }, []);

    const deleteSession = useCallback((sessionIdToDelete: string) => {
        setSessions(prevSessions => {
            const remainingSessions = prevSessions.filter(s => s.id !== sessionIdToDelete);
            if (remainingSessions.length === 0) {
                const newSession = createNewSession();
                setActiveSessionId(newSession.id);
                return [newSession];
            }
            setActiveSessionId(prevActiveId => {
                if (prevActiveId === sessionIdToDelete) {
                    return remainingSessions[0].id;
                }
                return prevActiveId;
            });
            return remainingSessions;
        });
    }, []);

    const setSessionCustomer = useCallback((sessionId: string, details: { customer?: Customer; member?: Member; }) => {
        setSessions(prev => prev.map(s => {
            if (s.id !== sessionId) return s;

            const isNowMember = !!details.member;
            const newMemberId = details.member?.id;

            // Recalculate prices for all items in the cart based on new member status
            const updatedItems = s.items.map(item => {
                const product = products.find(p => p.id === item.product_id);
                if (!product) return item;

                const newPrice = isNowMember && product.member_price ? product.member_price : product.price;
                return { ...item, price: newPrice };
            });

            const newCustomer: Customer = details.member 
                ? { name: details.member.name, phone: details.member.phone } 
                : details.customer || { name: '', phone: '' };

            return { ...s, customer: newCustomer, memberId: newMemberId, items: updatedItems };
        }));
    }, [products]);



    const clearActiveCart = useCallback(() => {
         const active = sessions.find(s => s.id === activeSessionId);
        if (!active) return;
        updateSessions({ ...active, items: [] });
    }, [sessions, activeSessionId]);

    const clearAllDataForNewShift = useCallback(() => {
        // Hapus semua data dari storage
        localStorage.removeItem('pos_transaction_sessions');
        sessionStorage.removeItem('pos_shift_transactions');
        sessionStorage.removeItem('pos_active_session_id');

        // Atur ulang state internal
        const newSession = createNewSession();
        setSessions([newSession]);
        setActiveSessionId(newSession.id);
        console.log("Semua data sesi dan transaksi telah dibersihkan untuk shift baru.");
    }, []);

    const activeCart = useMemo(() => {
        return sessions.find(s => s.id === activeSessionId) || null;
    }, [sessions, activeSessionId]);

    const activeCartSubtotal = useMemo(() => {
        if (!activeCart) return 0;
        return activeCart.items.reduce((total, item) => total + item.price * item.quantity, 0);
    }, [activeCart]);

    const appliedPromo = useMemo(() => {
        if (!activeCart || activeCart.items.length === 0) return null;

        const now = new Date();
        const currentDay = now.getDay();
        const currentHour = now.getHours();

        const applicablePromos = promos.filter(promo => {
            switch (promo.type) {
                case 'weekday':
                    return currentDay >= 1 && currentDay <= 5;
                case 'weekend':
                    return currentDay === 0 || currentDay === 6;
                case 'happy_hour':
                    return currentHour >= (promo.happy_hour_start ?? 0) && currentHour < (promo.happy_hour_end ?? 24);
                case 'min_spend':
                    return activeCartSubtotal >= (promo.min_spend ?? Infinity);
                default:
                    return false;
            }
        });

        if (applicablePromos.length === 0) return null;
        return applicablePromos.reduce((best, current) => current.value > best.value ? current : best);

    }, [activeCart, activeCartSubtotal, promos]);

    const activeCartDiscount = useMemo(() => {
        if (!appliedPromo) return 0;
        const discountAmount = (activeCartSubtotal * appliedPromo.value) / 100;
        return Math.round(discountAmount);
    }, [activeCartSubtotal, appliedPromo]);

    const activeCartTax = useMemo(() => {
        const taxableAmount = activeCartSubtotal - activeCartDiscount;
        return Math.round(taxableAmount * 0.11);
    }, [activeCartSubtotal, activeCartDiscount]);

    const activeCartTotal = useMemo(() => {
        return activeCartSubtotal - activeCartDiscount + activeCartTax;
    }, [activeCartSubtotal, activeCartDiscount, activeCartTax]);

    const contextValue = useMemo(() => ({
        sessions,
        activeSessionId,
        activeCart,
        isLoading,
        switchSession,
        addSession,
        addProductToActiveCart,
        addProductWithVariantToCart,
        addComplexItemToCart,
        updateActiveCartQuantity,
        setSessionCustomer,
        clearActiveCart,
        activeCartSubtotal,
        appliedPromo,
        activeCartDiscount,
        activeCartTax,
        activeCartTotal,
        deleteSession,
        removeItemFromCart,
        clearAllDataForNewShift
    }), [
        sessions, activeSessionId, activeCart, isLoading, 
        switchSession, addSession, addProductToActiveCart, addProductWithVariantToCart, addComplexItemToCart, 
        updateActiveCartQuantity, setSessionCustomer, clearActiveCart, 
        activeCartSubtotal, appliedPromo, activeCartDiscount, activeCartTax, 
        activeCartTotal, deleteSession, removeItemFromCart, clearAllDataForNewShift
    ]);

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
};