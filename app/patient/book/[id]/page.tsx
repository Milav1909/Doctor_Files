'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApi } from '@/hooks/useApi';

interface Doctor {
    _id: string;
    name: string;
    email: string;
    phone: string;
    specialization: string;
    availability: { dayOfWeek: number; startTime: string; endTime: string }[];
}

export default function BookAppointmentPage() {
    const { id } = useParams();
    const router = useRouter();
    const { fetchWithAuth } = useApi();
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        date: '',
        time: '',
        reason: ''
    });

    useEffect(() => { loadDoctor(); }, [id]);

    const loadDoctor = async () => {
        try {
            const data = await fetchWithAuth(`/api/doctors/${id}`);
            setDoctor(data.doctor);
        } catch (error) {
            console.error('Error loading doctor:', error);
            setError('Doctor not found');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await fetchWithAuth('/api/appointments', {
                method: 'POST',
                body: JSON.stringify({ doctorId: id, date: formData.date, time: formData.time, reason: formData.reason })
            });
            setSuccess(true);
            setTimeout(() => router.push('/patient/appointments'), 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to book appointment');
        } finally {
            setSubmitting(false);
        }
    };

    const getDayName = (day: number) => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day];

    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 9; hour <= 17; hour++) {
            for (const min of ['00', '30']) {
                if (hour === 17 && min === '30') continue;
                slots.push(`${hour.toString().padStart(2, '0')}:${min}`);
            }
        }
        return slots;
    };

    if (loading) return <div className="flex items-center justify-center h-64"><div className="spinner" /></div>;

    if (!doctor) return <div className="glass-card p-12 text-center"><p className="text-red-500">Doctor not found</p></div>;

    if (success) {
        return (
            <div className="max-w-xl mx-auto animate-fadeIn">
                <div className="glass-card p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Appointment Requested!</h2>
                    <p className="text-[var(--text-secondary)] mb-2">Your request has been sent to Dr. {doctor.name}.</p>
                    <p className="text-sm text-[var(--text-muted)]">Redirecting to appointments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto animate-fadeIn">
            <div className="mb-6">
                <button onClick={() => router.back()} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-2 mb-4 text-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>
                <h1 className="page-header">Book Appointment</h1>
                <p className="page-subtitle">Schedule an appointment with {doctor.name}</p>
            </div>

            {/* Doctor Info */}
            <div className="glass-card p-6 mb-5">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl">
                        {doctor.name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">{doctor.name}</h3>
                        <p className="text-[var(--primary)] text-sm">{doctor.specialization}</p>
                        <p className="text-[var(--text-secondary)] text-sm">{doctor.email}</p>
                    </div>
                </div>

                {doctor.availability?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
                        <p className="text-sm text-[var(--text-secondary)] mb-2">Available Hours:</p>
                        <div className="grid grid-cols-2 gap-2">
                            {doctor.availability.map((slot, idx) => (
                                <div key={idx} className="text-sm text-[var(--text-secondary)]">
                                    {getDayName(slot.dayOfWeek)}: {slot.startTime} - {slot.endTime}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Form */}
            <div className="glass-card p-6">
                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="form-label">Preferred Date</label>
                        <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            min={new Date().toISOString().split('T')[0]} className="input-field" required />
                    </div>
                    <div>
                        <label className="form-label">Preferred Time</label>
                        <select value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="select-field" required>
                            <option value="">Select a time slot</option>
                            {generateTimeSlots().map((time) => <option key={time} value={time}>{time}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="form-label">Reason for Visit (Optional)</label>
                        <textarea value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            className="input-field min-h-[100px] resize-none" placeholder="Briefly describe your symptoms or reason for visit..." />
                    </div>
                    <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2">
                        {submitting ? (
                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
                        ) : 'Request Appointment'}
                    </button>
                </form>
            </div>
        </div>
    );
}
