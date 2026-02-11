'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';

interface TimeSlot {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
}

export default function DoctorAvailabilityPage() {
    const { fetchWithAuth } = useApi();
    const [availability, setAvailability] = useState<TimeSlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    useEffect(() => { loadAvailability(); }, []);

    const loadAvailability = async () => {
        try {
            const data = await fetchWithAuth('/api/doctors/me/availability');
            setAvailability(data.availability || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const addSlot = (dayOfWeek: number) => {
        setAvailability([...availability, { dayOfWeek, startTime: '09:00', endTime: '17:00' }]);
    };

    const removeSlot = (index: number) => {
        setAvailability(availability.filter((_, i) => i !== index));
    };

    const updateSlot = (index: number, field: string, value: string) => {
        const updated = [...availability];
        updated[index] = { ...updated[index], [field]: value };
        setAvailability(updated);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetchWithAuth('/api/doctors/me/availability', {
                method: 'PUT',
                body: JSON.stringify({ availability })
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-64"><div className="spinner" /></div>;

    return (
        <div className="animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="page-header">Availability</h1>
                    <p className="page-subtitle">Set your working hours</p>
                </div>
                <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
                    {saving ? (
                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                    ) : saved ? '✓ Saved' : 'Save Changes'}
                </button>
            </div>

            <div className="space-y-3">
                {days.map((day, dayIdx) => {
                    const daySlots = availability.map((s, i) => ({ ...s, originalIndex: i })).filter(s => s.dayOfWeek === dayIdx);
                    return (
                        <div key={day} className="glass-card p-5">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-gray-900">{day}</h3>
                                <button onClick={() => addSlot(dayIdx)} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                                    + Add Slot
                                </button>
                            </div>

                            {daySlots.length === 0 ? (
                                <p className="text-sm text-gray-400">No hours set</p>
                            ) : (
                                <div className="space-y-2">
                                    {daySlots.map((slot) => (
                                        <div key={slot.originalIndex} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                                            <input type="time" value={slot.startTime}
                                                onChange={(e) => updateSlot(slot.originalIndex, 'startTime', e.target.value)}
                                                className="input-field !w-auto !py-1.5 !px-3 text-sm" />
                                            <span className="text-gray-400">to</span>
                                            <input type="time" value={slot.endTime}
                                                onChange={(e) => updateSlot(slot.originalIndex, 'endTime', e.target.value)}
                                                className="input-field !w-auto !py-1.5 !px-3 text-sm" />
                                            <button onClick={() => removeSlot(slot.originalIndex)} className="text-red-400 hover:text-red-600 ml-auto">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
