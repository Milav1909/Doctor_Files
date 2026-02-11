'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
    const { login } = useAuth();
    const [role, setRole] = useState<'patient' | 'doctor' | 'admin'>('patient');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showDemo, setShowDemo] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password, role);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const roles = [
        { key: 'patient' as const, label: 'Patient', icon: '👤', desc: 'Book appointments' },
        { key: 'doctor' as const, label: 'Doctor', icon: '🩺', desc: 'Manage patients' },
        { key: 'admin' as const, label: 'Admin', icon: '⚙️', desc: 'System settings' }
    ];

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-body)] px-4 py-12">
            {/* Background decoration */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-100/40 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-sm">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <span className="font-bold text-xl text-gray-900">Doctor Files</span>
                    </Link>
                    <p className="text-gray-500 text-sm">Sign in to your account</p>
                </div>

                <div className="glass-card p-8">
                    {/* Role Selector */}
                    <div className="grid grid-cols-3 gap-2 mb-6">
                        {roles.map((r) => (
                            <button
                                key={r.key}
                                onClick={() => setRole(r.key)}
                                className={`p-3 rounded-lg text-center transition-all border ${role === r.key
                                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="text-lg block">{r.icon}</span>
                                <span className="text-xs font-semibold block mt-1">{r.label}</span>
                            </button>
                        ))}
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-500">
                        Need an account?{' '}
                        <Link href="/register" className="text-blue-600 font-medium hover:text-blue-700">
                            Register here
                        </Link>
                    </p>

                    {/* Demo credentials */}
                    <div className="mt-6 pt-5 border-t border-gray-100">
                        <button
                            onClick={() => setShowDemo(!showDemo)}
                            className="text-xs text-gray-400 hover:text-gray-600 w-full text-center transition-colors"
                        >
                            {showDemo ? 'Hide' : 'Show'} demo credentials
                        </button>
                        {showDemo && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs text-gray-500 space-y-1">
                                <p><strong>Patient:</strong> patient@demo.com / password123</p>
                                <p><strong>Doctor:</strong> doctor@demo.com / password123</p>
                                <p><strong>Admin:</strong> admin@demo.com / password123</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
