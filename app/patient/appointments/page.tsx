'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';

interface Appointment {
    _id: string;
    doctorId: { _id: string; name: string; specialization: string };
    date: string;
    time: string;
    reason?: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
}

export default function PatientAppointmentsPage() {
    const { fetchWithAuth } = useApi();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [cancelling, setCancelling] = useState<string | null>(null);

    useEffect(() => {
        loadAppointments();
    }, [statusFilter]);

    const loadAppointments = async () => {
        try {
            setLoading(true);
            let url = '/api/appointments?limit=50';
            if (statusFilter) url += `&status=${statusFilter}`;

            const data = await fetchWithAuth(url);
            setAppointments(data.appointments);
        } catch (error) {
            console.error('Error loading appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id: string) => {
        if (!confirm('Are you sure you want to cancel this appointment?')) return;

        setCancelling(id);
        try {
            await fetchWithAuth(`/api/appointments/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status: 'cancelled' })
            });
            loadAppointments();
        } catch (error) {
            console.error('Error cancelling appointment:', error);
        } finally {
            setCancelling(null);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">My Appointments</h1>
                    <p className="text-slate-400">View and manage your appointment history</p>
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="select-field md:w-48 mt-4 md:mt-0"
                >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="spinner" />
                </div>
            ) : appointments.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-slate-400">No appointments found</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {appointments.map((apt) => (
                        <div key={apt._id} className="glass-card p-6 hover:scale-[1.01] transition-transform">
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-xl font-bold">
                                        {apt.doctorId.name.charAt(0)}
                                    </span>
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-white">{apt.doctorId.name}</h3>
                                    <p className="text-sky-400 text-sm">{apt.doctorId.specialization}</p>
                                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {formatDate(apt.date)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {apt.time}
                                        </span>
                                    </div>
                                    {apt.reason && (
                                        <p className="text-slate-500 text-sm mt-2">
                                            <span className="text-slate-400">Reason:</span> {apt.reason}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className={`badge badge-${apt.status}`}>{apt.status}</span>

                                    {(apt.status === 'pending' || apt.status === 'approved') && (
                                        <button
                                            onClick={() => handleCancel(apt._id)}
                                            disabled={cancelling === apt._id}
                                            className="btn-danger text-sm"
                                        >
                                            {cancelling === apt._id ? 'Cancelling...' : 'Cancel'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
