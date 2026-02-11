'use client';

import { useEffect, useState } from 'react';
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
    const { fetchWithAuth } = useApi();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await fetchWithAuth('/api/admin/stats');
            setStats(data);
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="spinner" /></div>;
    }

    const statCards = [
        { label: 'Patients', value: stats?.totalPatients || 0, color: 'border-t-emerald-500', icon: '👥' },
        { label: 'Doctors', value: stats?.totalDoctors || 0, color: 'border-t-blue-500', icon: '🩺' },
        { label: 'Appointments', value: stats?.totalAppointments || 0, color: 'border-t-violet-500', icon: '📅' },
        { label: 'Pending', value: stats?.pendingAppointments || 0, color: 'border-t-amber-500', icon: '⏳' },
    ];

    return (
        <div className="animate-fadeIn">
            <div className="mb-8">
                <h1 className="page-header">Admin Dashboard</h1>
                <p className="page-subtitle">System overview and management</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
                {statCards.map((s) => (
                    <div key={s.label} className={`stat-card border-t-4 ${s.color}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">{s.label}</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{s.value}</p>
                            </div>
                            <span className="text-2xl">{s.icon}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 stagger-children">
                    {[
                        { href: '/admin/users', label: 'Manage Users', icon: '👤' },
                        { href: '/admin/appointments', label: 'All Appointments', icon: '📋' },
                    ].map((action) => (
                        <a key={action.href} href={action.href} className="glass-card hoverable p-4 text-center group">
                            <span className="text-2xl block mb-2">{action.icon}</span>
                            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">{action.label}</span>
                        </a>
                    ))}
                </div>
            </div>

            {/* Breakdown */}
            <div className="grid md:grid-cols-2 gap-4">
                <div className="glass-card p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Appointment Breakdown</h3>
                    <div className="space-y-3">
                        {[
                            { label: 'Pending', value: stats?.pendingAppointments || 0, bar: 'bg-amber-400' },
                            { label: 'Completed', value: stats?.completedAppointments || 0, bar: 'bg-blue-400' },
                            { label: 'Total', value: stats?.totalAppointments || 0, bar: 'bg-violet-400' },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${item.bar}`} />
                                    <span className="text-sm text-gray-600">{item.label}</span>
                                </div>
                                <span className="font-semibold text-gray-900">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-card p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">User Breakdown</h3>
                    <div className="space-y-3">
                        {[
                            { label: 'Patients', value: stats?.totalPatients || 0, bar: 'bg-emerald-400' },
                            { label: 'Doctors', value: stats?.totalDoctors || 0, bar: 'bg-blue-400' },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${item.bar}`} />
                                    <span className="text-sm text-gray-600">{item.label}</span>
                                </div>
                                <span className="font-semibold text-gray-900">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
