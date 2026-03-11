'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, Clock, CheckCircle, Flag, ClipboardList, Clock3, Users, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/useApi';

interface PendingAppointment {
    _id: string;
    patientId: { _id: string; name: string; email: string; phone: string };
    date: string;
    time: string;
    reason?: string;
    status: string;
}

export default function DoctorDashboard() {
    const { user } = useAuth();
    const { fetchWithAuth } = useApi();
    const [pendingAppointments, setPendingAppointments] = useState<PendingAppointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, completed: 0 });

    useEffect(() => { loadDashboard(); }, []);

    const loadDashboard = async () => {
        try {
            const data = await fetchWithAuth('/api/appointments?limit=50');
            const apts = data.appointments || [];
            setStats({
                total: apts.length,
                pending: apts.filter((a: PendingAppointment) => a.status === 'pending').length,
                approved: apts.filter((a: PendingAppointment) => a.status === 'approved').length,
                completed: apts.filter((a: PendingAppointment) => a.status === 'completed').length
            });
            setPendingAppointments(apts.filter((a: PendingAppointment) => a.status === 'pending').slice(0, 5));
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id: string, status: string) => {
        setUpdating(id);
        try {
            await fetchWithAuth(`/api/appointments/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
            loadDashboard();
        } catch (error) {
            console.error('Error updating appointment:', error);
        } finally {
            setUpdating(null);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    return (
        <div className="animate-fadeIn">
            <div className="mb-8">
                <h1 className="page-header">Welcome, Dr. {user?.name?.split(' ').slice(-1)[0]} 👋</h1>
                <p className="page-subtitle">Your practice overview</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
                {[
                    { label: 'Total', value: stats.total, color: 'border-t-blue-500', icon: <CalendarDays className="w-6 h-6 text-blue-500" /> },
                    { label: 'Pending', value: stats.pending, color: 'border-t-amber-500', icon: <Clock className="w-6 h-6 text-amber-500" /> },
                    { label: 'Approved', value: stats.approved, color: 'border-t-emerald-500', icon: <CheckCircle className="w-6 h-6 text-emerald-500" /> },
                    { label: 'Completed', value: stats.completed, color: 'border-t-indigo-500', icon: <Flag className="w-6 h-6 text-indigo-500" /> },
                ].map((s) => (
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
                    {[
                        { href: '/doctor/appointments', label: 'Appointments', icon: <ClipboardList className="w-6 h-6 text-[var(--text-secondary)]" /> },
                        { href: '/doctor/availability', label: 'Availability', icon: <Clock3 className="w-6 h-6 text-[var(--text-secondary)]" /> },
                        { href: '/doctor/patients', label: 'Patients', icon: <Users className="w-6 h-6 text-[var(--text-secondary)]" /> },
                        { href: '/doctor/records', label: 'Records', icon: <FileText className="w-6 h-6 text-[var(--text-secondary)]" /> },
                    ].map((action) => (
                        <a key={action.href} href={action.href} className="glass-card hoverable p-4 text-center group">
                            <div className="flex justify-center mb-2">{action.icon}</div>
                            <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--primary)] transition-colors">{action.label}</span>
                        </a>
                    ))}
                </div>
            </div>

            {/* Pending Requests */}
            <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Pending Requests</h2>
                {loading ? (
                    <div className="flex items-center justify-center h-32"><div className="spinner" /></div>
                ) : pendingAppointments.length === 0 ? (
                    <div className="glass-card p-10 text-center">
                        <p className="text-[var(--text-muted)]">No pending appointment requests</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {pendingAppointments.map((apt) => (
                            <div key={apt._id} className="glass-card p-5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold">
                                            {apt.patientId.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-[var(--text-primary)]">{apt.patientId.name}</p>
                                            <p className="text-sm text-[var(--text-secondary)]">{formatDate(apt.date)} • {apt.time}</p>
                                            {apt.reason && <p className="text-sm text-[var(--text-muted)] mt-0.5">{apt.reason}</p>}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleStatusChange(apt._id, 'approved')} disabled={updating === apt._id} className="btn-success">
                                            {updating === apt._id ? '...' : 'Approve'}
                                        </button>
                                        <button onClick={() => handleStatusChange(apt._id, 'rejected')} disabled={updating === apt._id} className="btn-danger">
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
