'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/useApi';

interface Availability {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function DoctorAvailabilityPage() {
    const { user } = useAuth();
    const { fetchWithAuth } = useApi();
    const [availability, setAvailability] = useState<Availability[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        loadAvailability();
    }, [user]);

    const loadAvailability = async () => {
        if (!user) return;
        try {
            const data = await fetchWithAuth(`/api/doctors/${user.id}/availability`);
            setAvailability(data.availability || []);
        } catch (error) {
            console.error('Error loading availability:', error);
        } finally {
            setLoading(false);
        }
    };

    const addSlot = (dayOfWeek: number) => {
        setAvailability([
            ...availability,
            { dayOfWeek, startTime: '09:00', endTime: '17:00' }
        ]);
    };

    const removeSlot = (index: number) => {
        setAvailability(availability.filter((_, i) => i !== index));
    };

    const updateSlot = (index: number, field: keyof Availability, value: string | number) => {
        const updated = [...availability];
        updated[index] = { ...updated[index], [field]: value };
        setAvailability(updated);
    };

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        setSuccess(false);

        try {
            await fetchWithAuth(`/api/doctors/${user.id}/availability`, {
                method: 'PUT',
                body: JSON.stringify({ availability })
            });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error('Error saving availability:', error);
        } finally {
            setSaving(false);
        }
    };

    const getSlotsByDay = (dayOfWeek: number) => {
        return availability
            .map((slot, index) => ({ ...slot, index }))
            .filter(slot => slot.dayOfWeek === dayOfWeek);
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Availability</h1>
                    <p className="text-slate-400">Set your working hours for each day</p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary mt-4 md:mt-0 flex items-center gap-2"
                >
                    {saving ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Saving...
                        </>
                    ) : success ? (
                        <>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Saved!
                        </>
                    ) : (
                        'Save Changes'
                    )}
                </button>
            </div>

            <div className="space-y-4">
                {DAYS.map((day, dayOfWeek) => (
                    <div key={day} className="glass-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">{day}</h3>
                            <button
                                onClick={() => addSlot(dayOfWeek)}
                                className="text-sky-400 hover:text-sky-300 text-sm font-medium flex items-center gap-1"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Slot
                            </button>
                        </div>

                        {getSlotsByDay(dayOfWeek).length === 0 ? (
                            <p className="text-slate-500 text-sm">Not available on this day</p>
                        ) : (
                            <div className="space-y-3">
                                {getSlotsByDay(dayOfWeek).map((slot) => (
                                    <div key={slot.index} className="flex flex-wrap items-center gap-3">
                                        <div className="flex items-center gap-2">
                                            <label className="text-slate-400 text-sm">From:</label>
                                            <input
                                                type="time"
                                                value={slot.startTime}
                                                onChange={(e) => updateSlot(slot.index, 'startTime', e.target.value)}
                                                className="input-field w-auto py-2"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label className="text-slate-400 text-sm">To:</label>
                                            <input
                                                type="time"
                                                value={slot.endTime}
                                                onChange={(e) => updateSlot(slot.index, 'endTime', e.target.value)}
                                                className="input-field w-auto py-2"
                                            />
                                        </div>
                                        <button
                                            onClick={() => removeSlot(slot.index)}
                                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
