'use client';

import { useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function useApi() {
    const { token, isLoading } = useAuth();
    // Use a ref so that fetchWithAuth has a stable identity across renders
    const tokenRef = useRef(token);
    tokenRef.current = token;

    const isLoadingRef = useRef(isLoading);
    isLoadingRef.current = isLoading;

    const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}) => {
        if (isLoadingRef.current) {
            throw new Error('Auth not ready');
        }

        if (!tokenRef.current) {
            throw new Error('Not authenticated');
        }

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        (headers as Record<string, string>)['Authorization'] = `Bearer ${tokenRef.current}`;

        const response = await fetch(url, {
            ...options,
            headers
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
        }

        return data;
    }, []);

    return { fetchWithAuth, isAuthReady: !isLoading && !!token };
}
