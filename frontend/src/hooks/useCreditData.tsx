import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { CreditData } from '../types';

// ─── Context Shape ──────────────────────────────────────────────
interface CreditDataState {
    data: CreditData | null;
    loading: boolean;
    error: string | null;
}

const CreditDataContext = createContext<CreditDataState>({
    data: null,
    loading: true,
    error: null,
});

// ─── Provider ───────────────────────────────────────────────────
// Simulates an API call: fetch('/api/v1/credit-data')
// When backend is ready, swap the import with a real fetch() — zero changes to any component.
export const CreditDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<CreditDataState>({
        data: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        let cancelled = false;

        const fetchData = async () => {
            try {
                // Simulate network latency
                await new Promise(resolve => setTimeout(resolve, 300));

                // Dynamic import of local JSON (swap with fetch('/api/v1/credit-data') for production)
                const module = await import('../data/mock_credit_data.json');
                const json = module.default as CreditData;

                if (!cancelled) {
                    setState({ data: json, loading: false, error: null });
                }
            } catch (err) {
                if (!cancelled) {
                    setState({ data: null, loading: false, error: 'Failed to load credit data' });
                }
            }
        };

        fetchData();
        return () => { cancelled = true; };
    }, []);

    return (
        <CreditDataContext.Provider value={state}>
            {children}
        </CreditDataContext.Provider>
    );
};

// ─── Hook ───────────────────────────────────────────────────────
export const useCreditData = (): CreditDataState => {
    return useContext(CreditDataContext);
};

// ─── Loading Skeleton Component ─────────────────────────────────
export const DataLoading: React.FC = () => (
    <div className="flex items-center justify-center py-20 animate-fade-in">
        <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
            <span className="text-sm text-slate-400">Loading credit data...</span>
        </div>
    </div>
);
