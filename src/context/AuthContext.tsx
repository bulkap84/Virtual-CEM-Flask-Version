import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { DEALERS, type Dealer } from '../data/cemData';

// Mock types based on the requirements
export interface User {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
}

// Dealer interface is now imported from cemData.ts

interface AuthContextType {
    user: User | null;
    dealer: Dealer | null;
    setDealer: (dealer: Dealer) => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock Data Configuration
const MOCK_USER: User = {
    id: 'u-12345',
    name: 'Pawel Bulka',
    email: 'pbulka@mykaarma.com',
    avatarUrl: '',
};

// Defaulting to Keeler Honda for live testing
const DEFAULT_DEALER: Dealer = {
    id: '1719',
    name: 'Keeler Honda',
    vitallyUuid: '336ab112-d93d-4b5a-a718-30023fe5eae9',
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [dealer, setDealerState] = useState<Dealer | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const ctxToken = urlParams.get('ctx');

            let initialDealer = DEFAULT_DEALER;
            let initialUser: User | null = MOCK_USER;

            // 1. Check for token-based context (priority)
            if (ctxToken) {
                console.log("[Auth] Found context token in URL, verifying...");
                try {
                    const response = await fetch('/api/auth/verify-ctx', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token: ctxToken })
                    });

                    if (response.ok) {
                        const verifiedData = await response.json();
                        console.log("[Auth] Token verified successfully:", verifiedData);

                        // Find the local dealer data by UUID
                        const matchedDealer = DEALERS.find(d => d.vitallyUuid === verifiedData.dealerUuid);
                        if (matchedDealer) {
                            initialDealer = matchedDealer;
                            localStorage.setItem('vpm_current_dealer', JSON.stringify(matchedDealer));
                        }

                        initialUser = {
                            id: verifiedData.userId || 'u-remote',
                            name: verifiedData.userName || 'CEM',
                            email: verifiedData.userId?.includes('@') ? verifiedData.userId : 'remote@mykaarma.com'
                        };
                    } else {
                        console.warn("[Auth] Token verification failed or expired.");
                    }
                } catch (error) {
                    console.error("[Auth] Error verifying context token:", error);
                }
            } else {
                // 2. Fallback to localStorage if no token
                const savedDealer = localStorage.getItem('vpm_current_dealer');
                if (savedDealer) {
                    try {
                        initialDealer = JSON.parse(savedDealer);
                    } catch (e) {
                        console.error("Failed to parse saved dealer:", e);
                    }
                }
            }

            // Simulate minor loading delay for UX
            await new Promise(resolve => setTimeout(resolve, 800));
            setUser(initialUser);
            setDealerState(initialDealer);
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const updateDealer = (newDealer: Dealer) => {
        console.log(`[AuthContext] Switching dealer to: ${newDealer.name} (${newDealer.vitallyUuid})`);
        localStorage.setItem('vpm_current_dealer', JSON.stringify(newDealer));
        setDealerState(newDealer);
    };

    return (
        <AuthContext.Provider value={{
            user,
            dealer,
            setDealer: updateDealer,
            isAuthenticated: !!user,
            isLoading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
