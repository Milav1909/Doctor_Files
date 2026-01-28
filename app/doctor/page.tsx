'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/useApi';
import Link from 'next/link';

interface Appointment {
    _id: string;
    patientId: { name: string; email: string };
    date: string;
    time: string;
    status: string;
    reason?: string;
}

export default function DoctorDashboard() {
    const { user } = useAuth();
    const { fetchWithAuth } = useApi();
    const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ pending: 0, today: 0, total: 0 });
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [pendingData, allData] = await Promise.all([
                fetchWithAuth('/api/appointments?status=pending&limit=10'),
                fetchWithAuth('/api/appointments?limit=100')
            ]);

            setPendingAppointments(pendingData.appointments);

            const today = new Date().toISOString().split('T')[0];
            const todayCount = allData.appointments.filter((a: Appointment) =>
                a.date.startsWith(today)
            ).length;

            setStats({
                pending: pendingData.pagination.total,
                today: todayCount,
                total: allData.pagination.total
            });
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id: string, status: 'approved' | 'rejected') => {
        setUpdating(id);
        try {
            await fetchWithAuth(`/api/appointments/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status })
            });
            loadData();
        } catch (error) {
            console.error('Error updating appointment:', error);
        } finally {
            setUpdating(null);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="animate-fadeIn">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                    Welcome, Dr. {user?.name?.split(' ').pop()}! 👨‍⚕️
                </h1>
                <p className="text-slate-400">Here&apos;s your practice overview</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="stat-card">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center">
                            <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm">Pending Requests</p>
                            <p className="text-2xl font-bold text-white">{stats.pending}</p>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500/20 to-sky-500/5 flex items-center justify-center">
                            <svg className="w-6 h-6 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm">Today&apos;s Appointments</p>
                            <p className="text-2xl font-bold text-white">{stats.today}</p>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center">
                            <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm">Total Appointments</p>
                            <p className="text-2xl font-bold text-white">{stats.total}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Link href="/doctor/availability" className="glass-card p-6 hover:scale-[1.02] transition-transform group">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center shadow-lg shadow-sky-500/30">
                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white group-hover:text-sky-400 transition-colors">Manage Availability</h3>
                            <p className="text-slate-400 text-sm">Set your working hours</p>
                        </div>
                        <svg className="w-5 h-5 text-slate-400 ml-auto group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </Link>

                <Link href="/doctor/records" className="glass-card p-6 hover:scale-[1.02] transition-transform group">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white group-hover:text-violet-400 transition-colors">Medical Records</h3>
                            <p className="text-slate-400 text-sm">Create patient records</p>
                        </div>
                        <svg className="w-5 h-5 text-slate-400 ml-auto group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </Link>
            </div>

            {/* Pending Requests */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">Pending Appointment Requests</h2>
                    <Link href="/doctor/appointments" className="text-sky-400 hover:text-sky-300 text-sm font-medium">
                        View All →
                    </Link>
                </div>

                {pendingAppointments.length === 0 ? (
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-slate-400">No pending requests</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingAppointments.map((apt) => (
                            <div key={apt._id} className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-slate-800/50 rounded-xl">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-bold">{apt.patientId.name.charAt(0)}</span>
                                </div>

                                <div className="flex-1">
                                    <h4 className="font-medium text-white">{apt.patientId.name}</h4>
                                    <p className="text-slate-400 text-sm">{apt.patientId.email}</p>
                                    <div className="flex gap-4 mt-1 text-sm text-slate-500">
                                        <span>{formatDate(apt.date)}</span>
                                        <span>{apt.time}</span>
                                    </div>
                                    {apt.reason && <p className="text-slate-500 text-sm mt-1">Reason: {apt.reason}</p>}
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleStatusChange(apt._id, 'approved')}
                                        disabled={updating === apt._id}
                                        className="btn-success"
                                    >
                                        {updating === apt._id ? '...' : 'Approve'}
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange(apt._id, 'rejected')}
                                        disabled={updating === apt._id}
                                        className="btn-danger"
                                    >
                                        {updating === apt._id ? '...' : 'Reject'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
