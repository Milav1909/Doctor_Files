'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/useApi';

interface Appointment {
    _id: string;
    doctorId: { name: string; specialization: string };
    date: string;
    time: string;
    status: string;
}

export default function PatientDashboard() {
    const { user } = useAuth();
    const { fetchWithAuth } = useApi();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const data = await fetchWithAuth('/api/appointments?limit=5');
            const apts = data.appointments || [];
            setAppointments(apts);
            setStats({
                total: apts.length,
                pending: apts.filter((a: Appointment) => a.status === 'pending').length,
                approved: apts.filter((a: Appointment) => a.status === 'approved').length
            });
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="animate-fadeIn">
            <div className="mb-8">
                <h1 className="page-header">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
                <p className="page-subtitle">Here&apos;s your health overview</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 stagger-children">
                {[
                    { label: 'Total Appointments', value: stats.total, color: 'border-t-blue-500', icon: '📅' },
                    { label: 'Pending', value: stats.pending, color: 'border-t-amber-500', icon: '⏳' },
                    { label: 'Approved', value: stats.approved, color: 'border-t-emerald-500', icon: '✅' },
                ].map((s) => (
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
                    {[
                        { href: '/patient/doctors', label: 'Find Doctors', icon: '🔍' },
                        { href: '/patient/appointments', label: 'My Appointments', icon: '📋' },
                        { href: '/patient/records', label: 'Medical Records', icon: '📄' },
                    ].map((action) => (
                        <Link key={action.href} href={action.href} className="glass-card hoverable p-4 text-center group">
                            <span className="text-2xl block mb-2">{action.icon}</span>
                            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">{action.label}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Recent Appointments */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Appointments</h2>
                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="spinner" />
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="glass-card p-10 text-center">
                        <p className="text-gray-400 mb-3">No appointments yet</p>
                        <Link href="/patient/doctors" className="btn-primary text-sm">Find a Doctor</Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {appointments.map((apt) => (
                            <div key={apt._id} className="glass-card p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">
                                        {apt.doctorId.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{apt.doctorId.name}</p>
                                        <p className="text-sm text-gray-500">{formatDate(apt.date)} • {apt.time}</p>
                                    </div>
                                </div>
                                <span className={`badge badge-${apt.status}`}>{apt.status}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
