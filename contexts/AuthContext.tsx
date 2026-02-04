'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'patient' | 'doctor' | 'admin';
    specialization?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string, role: 'patient' | 'doctor' | 'admin') => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
}

interface RegisterData {
    name: string;
    email: string;
    phone: string;
    gender: string;
    password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Load user from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string, role: 'patient' | 'doctor' | 'admin') => {
        const endpoint = `/api/auth/${role}/login`;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }

        const userWithRole = { ...data.user, role };
        setToken(data.token);
        setUser(userWithRole);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userWithRole));

        // Redirect based on role
        router.push(`/${role}`);
    };

    // Only patients can self-register
    const register = async (registerData: RegisterData) => {
        const response = await fetch('/api/auth/patient/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registerData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }

        const userWithRole = { ...data.user, role: 'patient' as const };
        setToken(data.token);
        setUser(userWithRole);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userWithRole));

        router.push('/patient');
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
