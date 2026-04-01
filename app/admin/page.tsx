'use client';

import { useEffect, useState, useCallback } from 'react';
import { Users, Stethoscope, CalendarDays, Clock, UserCog, ClipboardList, RefreshCw } from 'lucide-react';
import { useApi } from '@/hooks/useApi';

interface Stats {
    totalPatients: number;
    totalDoctors: number;
    totalAppointments: number;
    pendingAppointments: number;
    completedAppointments: number;
    recentActivity: { _id: string; type: string; description: string; createdAt: string }[];
}

export default function AdminDashboard() {
    const { fetchWithAuth, isAuthReady } = useApi();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadStats = useCallback(async (isRefresh = false) => {
        if (!isAuthReady) return;
        if (isRefresh) setRefreshing(true);
        setError(null);
        try {
            const data = await fetchWithAuth('/api/admin/stats');
            // API returns { stats: { ... }, recentActivity: [...] }
            setStats({
                totalPatients: data.stats.totalPatients,
                totalDoctors: data.stats.totalDoctors,
                totalAppointments: data.stats.totalAppointments,
                pendingAppointments: data.stats.pendingAppointments,
                completedAppointments: data.stats.completedAppointments,
                recentActivity: data.recentActivity || []
            });
        } catch (err) {
            console.error('Error loading stats:', err);
            setError(err instanceof Error ? err.message : 'Failed to load stats');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [isAuthReady, fetchWithAuth]);

    useEffect(() => {
        if (isAuthReady) loadStats();
    }, [isAuthReady, loadStats]);

    if (loading || !isAuthReady) {
        return <div className="flex items-center justify-center h-64"><div className="spinner" /></div>;
    }

    if (error && !stats) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <p className="text-red-500">{error}</p>
                <button onClick={() => { setLoading(true); loadStats(); }} className="btn-primary">
                    Retry
                </button>
            </div>
        );
    }

    const statCards = [
        { label: 'Patients', value: stats?.totalPatients || 0, color: 'border-t-emerald-500', icon: <Users className="w-6 h-6 text-emerald-500" /> },
        { label: 'Doctors', value: stats?.totalDoctors || 0, color: 'border-t-blue-500', icon: <Stethoscope className="w-6 h-6 text-blue-500" /> },
        { label: 'Appointments', value: stats?.totalAppointments || 0, color: 'border-t-violet-500', icon: <CalendarDays className="w-6 h-6 text-violet-500" /> },
        { label: 'Pending', value: stats?.pendingAppointments || 0, color: 'border-t-amber-500', icon: <Clock className="w-6 h-6 text-amber-500" /> },
    ];

    return (
        <div className="animate-fadeIn">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="page-header">Admin Dashboard</h1>
                    <p className="page-subtitle">System overview and management</p>
                </div>
                <button
                    onClick={() => loadStats(true)}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all duration-200 disabled:opacity-50"
                    title="Refresh data"
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
                {statCards.map((s) => (
                    <div key={s.label} className={`stat-card border-t-4 ${s.color}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[var(--text-secondary)]">{s.label}</p>
                                <p className="text-3xl font-bold text-[var(--text-primary)] mt-1">{s.value}</p>
                            </div>
                            {s.icon}
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 stagger-children">
                    {[
                        { href: '/admin/users', label: 'Manage Users', icon: <UserCog className="w-6 h-6 text-[var(--text-secondary)]" /> },
                        { href: '/admin/appointments', label: 'All Appointments', icon: <ClipboardList className="w-6 h-6 text-[var(--text-secondary)]" /> },
                    ].map((action) => (
                        <a key={action.href} href={action.href} className="glass-card hoverable p-4 text-center group">
                            <div className="flex justify-center mb-2">{action.icon}</div>
                            <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--primary)] transition-colors">{action.label}</span>
                        </a>
                    ))}
                </div>
            </div>

            {/* Breakdown */}
            <div className="grid md:grid-cols-2 gap-4">
                <div className="glass-card p-6">
                    <h3 className="font-semibold text-[var(--text-primary)] mb-4">Appointment Breakdown</h3>
                    <div className="space-y-3">
                        {[
                            { label: 'Pending', value: stats?.pendingAppointments || 0, bar: 'bg-amber-400' },
                            { label: 'Completed', value: stats?.completedAppointments || 0, bar: 'bg-blue-400' },
                            { label: 'Total', value: stats?.totalAppointments || 0, bar: 'bg-violet-400' },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${item.bar}`} />
                                    <span className="text-sm text-[var(--text-secondary)]">{item.label}</span>
                                </div>
                                <span className="font-semibold text-[var(--text-primary)]">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-card p-6">
                    <h3 className="font-semibold text-[var(--text-primary)] mb-4">User Breakdown</h3>
                    <div className="space-y-3">
                        {[
                            { label: 'Patients', value: stats?.totalPatients || 0, bar: 'bg-emerald-400' },
                            { label: 'Doctors', value: stats?.totalDoctors || 0, bar: 'bg-blue-400' },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${item.bar}`} />
                                    <span className="text-sm text-[var(--text-secondary)]">{item.label}</span>
                                </div>
                                <span className="font-semibold text-[var(--text-primary)]">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
