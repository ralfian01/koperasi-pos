import type { CartSession } from '../types';

const SESSIONS_STORAGE_KEY = 'pos_transaction_sessions';
const ACTIVE_SESSION_ID_KEY = 'pos_active_session_id';

/**
 * Saves all transaction sessions to localStorage.
 */
export const saveSessions = (sessions: CartSession[]): Promise<void> => {
    return new Promise((resolve) => {
        try {
            localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
            resolve();
        } catch (error) {
            console.error('API: Failed to save sessions.', error);
            resolve(); // Resolve even on failure to not block UI
        }
    });
};

/**
 * Retrieves all transaction sessions from localStorage.
 */
export const getSessions = (): Promise<CartSession[]> => {
    return new Promise((resolve) => {
        setTimeout(() => { // Simulate network delay
            try {
                const savedSessions = localStorage.getItem(SESSIONS_STORAGE_KEY);
                if (savedSessions) {
                    resolve(JSON.parse(savedSessions));
                } else {
                    resolve([]);
                }
            } catch (error) {
                console.error('API: Failed to retrieve sessions.', error);
                resolve([]);
            }
        }, 300);
    });
};

/**
 * Saves the active session ID to sessionStorage.
 */
export const saveActiveSessionId = (sessionId: string): void => {
    try {
        sessionStorage.setItem(ACTIVE_SESSION_ID_KEY, sessionId);
    } catch (error) {
        console.error('Failed to save active session ID.', error);
    }
};

/**
 * Retrieves the active session ID from sessionStorage.
 */
export const getActiveSessionId = (): string | null => {
    try {
        return sessionStorage.getItem(ACTIVE_SESSION_ID_KEY);
    } catch (error) {
        console.error('Failed to retrieve active session ID.', error);
        return null;
    }
};