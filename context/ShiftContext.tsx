import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { Cashier, ShiftContextType } from '../types';

export const ShiftContext = createContext<ShiftContextType | null>(null);

const getInitialState = (): { isActive: boolean; cashier: Cashier | null; shiftStartTime: string | null; } => {
    try {
        const storedShift = sessionStorage.getItem('shift_session');
        if (storedShift) {
            const { isActive, cashier, shiftStartTime } = JSON.parse(storedShift);
            if (isActive && cashier) {
                return { isActive: true, cashier, shiftStartTime: shiftStartTime || null };
            }
        }
    } catch (error) {
        console.error("Could not parse shift session from sessionStorage", error);
    }
    return { isActive: false, cashier: null, shiftStartTime: null };
};

export const ShiftProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const initialState = getInitialState();
    const [isShiftActive, setIsShiftActive] = useState<boolean>(initialState.isActive);
    const [currentCashier, setCurrentCashier] = useState<Cashier | null>(initialState.cashier);
    const [shiftStartTime, setShiftStartTime] = useState<string | null>(initialState.shiftStartTime);

    useEffect(() => {
        try {
            if (isShiftActive && currentCashier) {
                const shiftSession = JSON.stringify({ isActive: isShiftActive, cashier: currentCashier, shiftStartTime });
                sessionStorage.setItem('shift_session', shiftSession);
            } else {
                sessionStorage.removeItem('shift_session');
            }
        } catch (error) {
             console.error("Could not save shift session to sessionStorage", error);
        }
    }, [isShiftActive, currentCashier, shiftStartTime]);
    
    const startShift = useCallback((cashier: Cashier) => {
        setCurrentCashier(cashier);
        setIsShiftActive(true);
        setShiftStartTime(new Date().toISOString());
    }, []);

    const stopShift = useCallback(() => {
        setIsShiftActive(false);
        setCurrentCashier(null);
        setShiftStartTime(null);
    }, []);

    const contextValue = useMemo(() => ({
        isShiftActive,
        currentCashier,
        shiftStartTime,
        startShift,
        stopShift,
    }), [isShiftActive, currentCashier, shiftStartTime, startShift, stopShift]);

    return (
        <ShiftContext.Provider value={contextValue}>
            {children}
        </ShiftContext.Provider>
    );
};