'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import Link from 'next/link';

interface MedicalRecord {
    _id: string;
    patientId: { _id: string; name: string; email: string };
    diagnosis: string;
    prescription: string;
    notes: string;
    createdAt: string;
}

export default function DoctorRecordsPage() {
    const { fetchWithAuth } = useApi();
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRecords();
    }, []);

    const loadRecords = async () => {
        try {
            const data = await fetchWithAuth('/api/medical-records?limit=50');
            setRecords(data.records);
        } catch (error) {
            console.error('Error loading records:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Medical Records</h1>
                    <p className="text-slate-400">View and manage patient medical records</p>
                </div>

                <Link href="/doctor/records/new" className="btn-primary mt-4 md:mt-0 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Record
                </Link>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="spinner" />
                </div>
            ) : records.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-slate-400 mb-4">No medical records yet</p>
                    <Link href="/doctor/records/new" className="btn-primary inline-block">
                        Create First Record
                    </Link>
                </div>
            ) : (
                <div className="overflow-x-auto glass-card">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Diagnosis</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((record) => (
                                <tr key={record._id}>
                                    <td>
                                        <div>
                                            <p className="font-medium text-white">{record.patientId.name}</p>
                                            <p className="text-sm text-slate-400">{record.patientId.email}</p>
                                        </div>
                                    </td>
                                    <td className="text-white">{record.diagnosis}</td>
                                    <td className="text-slate-400">{formatDate(record.createdAt)}</td>
                                    <td>
                                        <Link
                                            href={`/doctor/records/${record._id}`}
                                            className="text-sky-400 hover:text-sky-300 text-sm font-medium"
                                        >
                                            View Details
                                        </Link>
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
