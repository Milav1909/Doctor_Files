'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Building2 } from 'lucide-react';

export default function RegisterPage() {
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', confirmPassword: '', phone: '', gender: 'male'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await register({ name: formData.name, email: formData.email, password: formData.password, phone: formData.phone, gender: formData.gender });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const updateField = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-body)] px-4 py-12">
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100/50 dark:bg-blue-900/20 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-100/40 dark:bg-indigo-900/15 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-sm">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-bold text-xl text-[var(--text-primary)]">Doctor Files</span>
                    </Link>
                    <p className="text-[var(--text-secondary)] text-sm">Create your patient account</p>
                </div>

                <div className="glass-card p-8">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="form-label">Full Name</label>
                            <input type="text" value={formData.name} onChange={(e) => updateField('name', e.target.value)}
                                className="input-field" placeholder="John Doe" required />
                        </div>
                        <div>
                            <label className="form-label">Email</label>
                            <input type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)}
                                className="input-field" placeholder="you@example.com" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="form-label">Phone</label>
                                <input type="tel" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)}
                                    className="input-field" placeholder="+1 234 567 890" required />
                            </div>
                            <div>
                                <label className="form-label">Gender</label>
                                <select value={formData.gender} onChange={(e) => updateField('gender', e.target.value)}
                                    className="select-field">
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="form-label">Password</label>
                            <input type="password" value={formData.password} onChange={(e) => updateField('password', e.target.value)}
                                className="input-field" placeholder="Minimum 6 characters" required />
                        </div>
                        <div>
                            <label className="form-label">Confirm Password</label>
                            <input type="password" value={formData.confirmPassword} onChange={(e) => updateField('confirmPassword', e.target.value)}
                                className="input-field" placeholder="Re-enter password" required />
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
                        Already have an account?{' '}
                        <Link href="/login" className="text-[var(--primary)] font-medium hover:underline">Sign in</Link>
                    </p>

                    <p className="mt-4 text-xs text-[var(--text-muted)] text-center">
                        Doctor and admin accounts are created by the system administrator.
                    </p>
                </div>
            </div>
        </div>
    );
}
