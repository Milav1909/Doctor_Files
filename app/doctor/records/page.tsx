'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApi } from '@/hooks/useApi';

interface Record {
    _id: string;
    patientId: { name: string; email: string };
    diagnosis: string;
    createdAt: string;
}

export default function DoctorRecordsPage() {
    const { fetchWithAuth } = useApi();
    const [records, setRecords] = useState<Record[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadRecords(); }, []);

    const loadRecords = async () => {
        try {
            const data = await fetchWithAuth('/api/medical-records');
            setRecords(data.records || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <div className="animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="page-header">Medical Records</h1>
                    <p className="page-subtitle">Records you&apos;ve created for your patients</p>
                </div>
                <Link href="/doctor/records/new" className="btn-primary">
                    + New Record
                </Link>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-40"><div className="spinner" /></div>
            ) : records.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-400 mb-3">No medical records yet</p>
                    <Link href="/doctor/records/new" className="btn-primary text-sm">Create First Record</Link>
                </div>
            ) : (
                <div className="glass-card overflow-hidden">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Diagnosis</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((record) => (
                                <tr key={record._id}>
                                    <td>
                                        <p className="font-medium text-gray-900">{record.patientId.name}</p>
                                        <p className="text-sm text-gray-500">{record.patientId.email}</p>
                                    </td>
                                    <td className="text-gray-700">{record.diagnosis}</td>
                                    <td className="text-gray-500">{formatDate(record.createdAt)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
