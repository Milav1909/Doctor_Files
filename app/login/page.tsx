'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, User, Stethoscope, Settings } from 'lucide-react';
import { ReactNode } from 'react';

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

    const roles: { key: 'patient' | 'doctor' | 'admin'; label: string; icon: ReactNode; desc: string }[] = [
        { key: 'patient', label: 'Patient', icon: <User className="w-5 h-5" />, desc: 'Book appointments' },
        { key: 'doctor', label: 'Doctor', icon: <Stethoscope className="w-5 h-5" />, desc: 'Manage patients' },
        { key: 'admin', label: 'Admin', icon: <Settings className="w-5 h-5" />, desc: 'System settings' }
    ];

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-body)] px-4 py-12">
            {/* Background decoration */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100/50 dark:bg-blue-900/20 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-100/40 dark:bg-indigo-900/15 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-sm">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-bold text-xl text-[var(--text-primary)]">Doctor Files</span>
                    </Link>
                    <p className="text-[var(--text-secondary)] text-sm">Sign in to your account</p>
                </div>

                <div className="glass-card p-8">
                    {/* Role Selector */}
                    <div className="grid grid-cols-3 gap-2 mb-6">
                        {roles.map((r) => (
                            <button
                                key={r.key}
                                onClick={() => setRole(r.key)}
                                className={`p-3 rounded-lg text-center transition-all border ${role === r.key
                                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-400'
                                    : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-body)]'
                                    }`}
                            >
                                <div className="flex justify-center">{r.icon}</div>
                                <span className="text-xs font-semibold block mt-1">{r.label}</span>
                            </button>
                        ))}
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
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

                    <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
                        Need an account?{' '}
                        <Link href="/register" className="text-[var(--primary)] font-medium hover:underline">
                            Register here
                        </Link>
                    </p>

                    {/* Demo credentials */}
                    <div className="mt-6 pt-5 border-t border-[var(--border-color)]">
                        <button
                            onClick={() => setShowDemo(!showDemo)}
                            className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] w-full text-center transition-colors"
                        >
                            {showDemo ? 'Hide' : 'Show'} demo credentials
                        </button>
                        {showDemo && (
                            <div className="mt-3 p-3 bg-[var(--bg-body)] rounded-lg text-xs text-[var(--text-secondary)] space-y-1">
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
