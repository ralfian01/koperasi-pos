import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { Cashier, ShiftContextType } from '../types';

export const ShiftContext = createContext<ShiftContextType | null>(null);

const getInitialState = (): { isActive: boolean; cashier: Cashier | null } => {
    try {
        const storedShift = sessionStorage.getItem('shift_session');
        if (storedShift) {
            const { isActive, cashier } = JSON.parse(storedShift);
            if (isActive && cashier) {
                return { isActive: true, cashier };
            }
        }
    } catch (error) {
        console.error("Could not parse shift session from sessionStorage", error);
    }
    return { isActive: false, cashier: null };
};

export const ShiftProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const initialState = getInitialState();
    const [isShiftActive, setIsShiftActive] = useState<boolean>(initialState.isActive);
    const [currentCashier, setCurrentCashier] = useState<Cashier | null>(initialState.cashier);

    useEffect(() => {
        try {
            if (isShiftActive && currentCashier) {
                const shiftSession = JSON.stringify({ isActive: isShiftActive, cashier: currentCashier });
                sessionStorage.setItem('shift_session', shiftSession);
            } else {
                sessionStorage.removeItem('shift_session');
            }
        } catch (error) {
             console.error("Could not save shift session to sessionStorage", error);
        }
    }, [isShiftActive, currentCashier]);
    
    const startShift = useCallback((cashier: Cashier) => {
        setCurrentCashier(cashier);
        setIsShiftActive(true);
    }, []);

    const stopShift = useCallback(() => {
        setIsShiftActive(false);
        setCurrentCashier(null);
    }, []);

    const contextValue = useMemo(() => ({
        isShiftActive,
        currentCashier,
        startShift,
        stopShift,
    }), [isShiftActive, currentCashier, startShift, stopShift]);

    return (
        <ShiftContext.Provider value={contextValue}>
            {children}
        </ShiftContext.Provider>
    );
};
