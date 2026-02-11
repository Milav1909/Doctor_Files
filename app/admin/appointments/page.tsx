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
}

export default function AdminAppointmentsPage() {
    const { fetchWithAuth } = useApi();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => { loadAppointments(); }, []);

    const loadAppointments = async () => {
        try {
            const data = await fetchWithAuth('/api/admin/appointments');
            setAppointments(data.appointments || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id: string) => {
        try {
            await fetchWithAuth(`/api/appointments/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'cancelled' }) });
            loadAppointments();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);
    const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <div className="animate-fadeIn">
            <div className="mb-6">
                <h1 className="page-header">All Appointments</h1>
                <p className="page-subtitle">View and manage all system appointments</p>
            </div>

            <div className="flex gap-2 mb-6 flex-wrap">
                {['all', 'pending', 'approved', 'completed', 'rejected', 'cancelled'].map((s) => (
                    <button key={s} onClick={() => setFilter(s)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${filter === s ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-40"><div className="spinner" /></div>
            ) : filtered.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-400">No appointments found</p>
                </div>
            ) : (
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Doctor</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((apt) => (
                                    <tr key={apt._id}>
                                        <td>
                                            <p className="font-medium text-gray-900">{apt.patientId.name}</p>
                                            <p className="text-sm text-gray-500">{apt.patientId.email}</p>
                                        </td>
                                        <td>
                                            <p className="font-medium text-gray-900">{apt.doctorId.name}</p>
                                            <p className="text-sm text-gray-500">{apt.doctorId.specialization}</p>
                                        </td>
                                        <td className="text-gray-700">{formatDate(apt.date)}</td>
                                        <td className="text-gray-700">{apt.time}</td>
                                        <td><span className={`badge badge-${apt.status}`}>{apt.status}</span></td>
                                        <td>
                                            {!['cancelled', 'completed', 'rejected'].includes(apt.status) && (
                                                <button onClick={() => handleCancel(apt._id)} className="btn-danger text-xs">Cancel</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
