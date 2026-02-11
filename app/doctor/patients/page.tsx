'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApi } from '@/hooks/useApi';

interface Patient {
    _id: string;
    name: string;
    email: string;
    phone: string;
    gender: string;
}

export default function DoctorPatientsPage() {
    const { fetchWithAuth } = useApi();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => { loadPatients(); }, []);

    const loadPatients = async () => {
        try {
            const data = await fetchWithAuth('/api/patients?limit=100');
            setPatients(data.patients || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const filtered = patients.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="animate-fadeIn">
            <div className="mb-6">
                <h1 className="page-header">My Patients</h1>
                <p className="page-subtitle">View and manage your patients</p>
            </div>

            <div className="mb-6">
                <input type="text" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)}
                    className="input-field max-w-md" />
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-40"><div className="spinner" /></div>
            ) : filtered.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <p className="text-gray-400">No patients found.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
                    {filtered.map((patient) => (
                        <div key={patient._id} className="glass-card hoverable p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-11 h-11 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700 font-bold">
                                    {patient.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                                    <p className="text-sm text-gray-500">{patient.email}</p>
                                </div>
                            </div>
                            <div className="text-sm text-gray-500 space-y-1 mb-4">
                                <p>📱 {patient.phone}</p>
                                <p className="capitalize">⚤ {patient.gender}</p>
                            </div>
                            <Link href={`/doctor/records/new?patientId=${patient._id}`} className="btn-primary text-sm w-full">
                                Create Record
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
