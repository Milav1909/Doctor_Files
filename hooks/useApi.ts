'use client';

import { useAuth } from '@/contexts/AuthContext';

export function useApi() {
    const { token } = useAuth();

    const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
        }

        return data;
    };

    return { fetchWithAuth };
}
