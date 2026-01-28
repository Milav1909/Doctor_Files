'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';

interface Appointment {
    _id: string;
    patientId: { name: string; email: string };
    doctorId: { name: string; specialization: string };
    date: string;
    time: string;
    status: string;
    createdAt: string;
}

export default function AdminAppointmentsPage() {
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
            let url = '/api/appointments?limit=100';
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
                    <h1 className="text-3xl font-bold text-white mb-2">All Appointments</h1>
                    <p className="text-slate-400">Monitor and manage all appointments</p>
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
                    <p className="text-slate-400">No appointments found</p>
                </div>
            ) : (
                <div className="glass-card overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Doctor</th>
                                <th>Date & Time</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map((apt) => (
                                <tr key={apt._id}>
                                    <td>
                                        <div>
                                            <p className="font-medium text-white">{apt.patientId?.name || 'N/A'}</p>
                                            <p className="text-sm text-slate-400">{apt.patientId?.email || 'N/A'}</p>
                                        </div>
                                    </td>
                                    <td>
                                        <div>
                                            <p className="text-white">{apt.doctorId?.name || 'N/A'}</p>
                                            <p className="text-sm text-slate-400">{apt.doctorId?.specialization || 'N/A'}</p>
                                        </div>
                                    </td>
                                    <td>
                                        <div>
                                            <p className="text-white">{formatDate(apt.date)}</p>
                                            <p className="text-sm text-slate-400">{apt.time}</p>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${apt.status}`}>{apt.status}</span>
                                    </td>
                                    <td>
                                        {(apt.status === 'pending' || apt.status === 'approved') && (
                                            <button
                                                onClick={() => handleCancel(apt._id)}
                                                disabled={cancelling === apt._id}
                                                className="btn-danger text-sm"
                                            >
                                                {cancelling === apt._id ? 'Cancelling...' : 'Cancel'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
