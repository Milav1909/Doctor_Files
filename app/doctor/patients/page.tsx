'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import Link from 'next/link';

interface Patient {
    _id: string;
    name: string;
    email: string;
    phone: string;
    gender: string;
    createdAt: string;
}

export default function DoctorPatientsPage() {
    const { fetchWithAuth } = useApi();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadPatients();
    }, []);

    const loadPatients = async () => {
        try {
            setLoading(true);
            let url = '/api/patients?limit=50';
            if (search) url += `&search=${encodeURIComponent(search)}`;

            const data = await fetchWithAuth(url);
            setPatients(data.patients);
        } catch (error) {
            console.error('Error loading patients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        loadPatients();
    };

    return (
        <div className="animate-fadeIn">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Patients</h1>
                <p className="text-slate-400">View and manage patient information</p>
            </div>

            <form onSubmit={handleSearch} className="glass-card p-4 mb-6">
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or email..."
                        className="input-field flex-1"
                    />
                    <button type="submit" className="btn-primary">
                        Search
                    </button>
                </div>
            </form>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="spinner" />
                </div>
            ) : patients.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <p className="text-slate-400">No patients found</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {patients.map((patient) => (
                        <div key={patient._id} className="glass-card p-6 hover:scale-[1.02] transition-transform">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-bold">{patient.name.charAt(0)}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-white truncate">{patient.name}</h3>
                                    <p className="text-slate-400 text-sm truncate">{patient.email}</p>
                                    <p className="text-slate-500 text-sm">{patient.phone}</p>
                                    <p className="text-slate-500 text-xs mt-1 capitalize">{patient.gender}</p>
                                </div>
                            </div>
                            <Link
                                href={`/doctor/records/new?patientId=${patient._id}`}
                                className="mt-4 btn-secondary w-full text-center block text-sm"
                            >
                                Create Record
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
