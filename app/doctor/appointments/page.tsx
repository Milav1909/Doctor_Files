'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';

interface Appointment {
    _id: string;
    patientId: { name: string; email: string; phone: string };
    date: string;
    time: string;
    reason?: string;
    status: string;
}

export default function DoctorAppointmentsPage() {
    const { fetchWithAuth } = useApi();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => { loadAppointments(); }, []);

    const loadAppointments = async () => {
        try {
            const data = await fetchWithAuth('/api/appointments');
            setAppointments(data.appointments || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id: string, status: string) => {
        setUpdating(id);
        try {
            await fetchWithAuth(`/api/appointments/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
            loadAppointments();
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setUpdating(null);
        }
    };

    const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);
    const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <div className="animate-fadeIn">
            <div className="mb-6">
                <h1 className="page-header">Appointments</h1>
                <p className="page-subtitle">Manage your appointment requests</p>
            </div>

            <div className="flex gap-2 mb-6 flex-wrap">
                {['all', 'pending', 'approved', 'completed', 'rejected'].map((s) => (
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
                <div className="space-y-3">
                    {filtered.map((apt) => (
                        <div key={apt._id} className="glass-card p-5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700 font-bold">
                                        {apt.patientId.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{apt.patientId.name}</p>
                                        <p className="text-sm text-gray-500">{formatDate(apt.date)} • {apt.time}</p>
                                        {apt.reason && <p className="text-sm text-gray-400 mt-0.5">{apt.reason}</p>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`badge badge-${apt.status}`}>{apt.status}</span>
                                    {apt.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <button onClick={() => handleStatusChange(apt._id, 'approved')} disabled={updating === apt._id} className="btn-success text-xs">Approve</button>
                                            <button onClick={() => handleStatusChange(apt._id, 'rejected')} disabled={updating === apt._id} className="btn-danger text-xs">Reject</button>
                                        </div>
                                    )}
                                    {apt.status === 'approved' && (
                                        <button onClick={() => handleStatusChange(apt._id, 'completed')} disabled={updating === apt._id} className="btn-primary text-xs py-1.5 px-3">Complete</button>
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
