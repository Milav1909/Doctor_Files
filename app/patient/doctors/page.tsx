'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApi } from '@/hooks/useApi';

interface Doctor {
    _id: string;
    name: string;
    email: string;
    specialization: string;
    phone: string;
    availability: { dayOfWeek: number; startTime: string; endTime: string }[];
}

export default function FindDoctorsPage() {
    const { fetchWithAuth } = useApi();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => { loadDoctors(); }, []);

    const loadDoctors = async () => {
        try {
            const data = await fetchWithAuth('/api/doctors');
            setDoctors(data.doctors || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const filtered = doctors.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.specialization.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="animate-fadeIn">
            <div className="mb-6">
                <h1 className="page-header">Find Doctors</h1>
                <p className="page-subtitle">Browse available doctors and book appointments</p>
            </div>

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search by name or specialization..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input-field max-w-md"
                />
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-40"><div className="spinner" /></div>
            ) : filtered.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-gray-400">No doctors found matching your search.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
                    {filtered.map((doctor) => (
                        <div key={doctor._id} className="glass-card hoverable p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg">
                                    {doctor.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                                    <p className="text-sm text-blue-600">{doctor.specialization}</p>
                                </div>
                            </div>

                            <div className="space-y-1.5 mb-5 text-sm text-gray-500">
                                <p>{doctor.email}</p>
                                <p>{doctor.phone}</p>
                                {doctor.availability?.length > 0 && (
                                    <p className="text-emerald-600 font-medium text-xs">
                                        ✓ {doctor.availability.length} time slot{doctor.availability.length > 1 ? 's' : ''} available
                                    </p>
                                )}
                            </div>

                            <Link href={`/patient/book/${doctor._id}`} className="btn-primary w-full text-sm">
                                Book Appointment
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
