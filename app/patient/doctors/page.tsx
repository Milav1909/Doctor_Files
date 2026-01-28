'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import Link from 'next/link';

interface Doctor {
    _id: string;
    name: string;
    email: string;
    phone: string;
    specialization: string;
    availability: { dayOfWeek: number; startTime: string; endTime: string }[];
}

export default function FindDoctorsPage() {
    const { fetchWithAuth } = useApi();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [specialization, setSpecialization] = useState('');

    const specializations = [
        'Cardiology',
        'Dermatology',
        'Pediatrics',
        'Orthopedics',
        'Neurology',
        'General Medicine'
    ];

    useEffect(() => {
        loadDoctors();
    }, [specialization]);

    const loadDoctors = async () => {
        try {
            setLoading(true);
            let url = '/api/doctors?limit=50';
            if (specialization) url += `&specialization=${encodeURIComponent(specialization)}`;
            if (search) url += `&search=${encodeURIComponent(search)}`;

            const data = await fetchWithAuth(url);
            setDoctors(data.doctors);
        } catch (error) {
            console.error('Error loading doctors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        loadDoctors();
    };

    const getDayName = (day: number) => {
        return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day];
    };

    return (
        <div className="animate-fadeIn">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Find a Doctor</h1>
                <p className="text-slate-400">Search for healthcare professionals by specialty</p>
            </div>

            {/* Search & Filter */}
            <div className="glass-card p-6 mb-8">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or specialization..."
                            className="input-field"
                        />
                    </div>
                    <div className="md:w-48">
                        <select
                            value={specialization}
                            onChange={(e) => setSpecialization(e.target.value)}
                            className="select-field"
                        >
                            <option value="">All Specializations</option>
                            {specializations.map((spec) => (
                                <option key={spec} value={spec}>{spec}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="btn-primary">
                        Search
                    </button>
                </form>
            </div>

            {/* Results */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="spinner" />
                </div>
            ) : doctors.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-slate-400">No doctors found matching your criteria</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {doctors.map((doctor) => (
                        <div key={doctor._id} className="glass-card p-6 hover:scale-[1.02] transition-transform">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-xl font-bold">
                                        {doctor.name.charAt(0)}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold text-white truncate">{doctor.name}</h3>
                                    <p className="text-sky-400 text-sm">{doctor.specialization}</p>
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-slate-400 text-sm">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    {doctor.email}
                                </div>
                                <div className="flex items-center gap-2 text-slate-400 text-sm">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    {doctor.phone}
                                </div>
                            </div>

                            {/* Availability */}
                            {doctor.availability?.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Available:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {doctor.availability.map((slot, idx) => (
                                            <span key={idx} className="text-xs px-2 py-1 bg-slate-800 rounded text-slate-300">
                                                {getDayName(slot.dayOfWeek)} {slot.startTime}-{slot.endTime}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <Link
                                href={`/patient/book/${doctor._id}`}
                                className="btn-primary w-full text-center block"
                            >
                                Book Appointment
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
