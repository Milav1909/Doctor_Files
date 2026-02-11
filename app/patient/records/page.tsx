'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';

interface Record {
    _id: string;
    doctorId: { name: string; specialization: string };
    diagnosis: string;
    prescription: string;
    notes: string;
    createdAt: string;
}

export default function PatientRecordsPage() {
    const { fetchWithAuth } = useApi();
    const [records, setRecords] = useState<Record[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);

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
            <div className="mb-6">
                <h1 className="page-header">Medical Records</h1>
                <p className="page-subtitle">View your medical history and prescriptions</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-40"><div className="spinner" /></div>
            ) : records.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-400">No medical records yet.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {records.map((record) => (
                        <div key={record._id} className="glass-card p-5 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setSelectedRecord(record)}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm">
                                        {record.doctorId.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{record.diagnosis}</p>
                                        <p className="text-sm text-gray-500">Dr. {record.doctorId.name} • {formatDate(record.createdAt)}</p>
                                    </div>
                                </div>
                                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {selectedRecord && (
                <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedRecord(null)}>
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto animate-modalIn shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Record Details</h3>
                            <button onClick={() => setSelectedRecord(null)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Doctor</p>
                                <p className="text-gray-900">{selectedRecord.doctorId.name}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Date</p>
                                <p className="text-gray-900">{formatDate(selectedRecord.createdAt)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Diagnosis</p>
                                <p className="text-gray-900">{selectedRecord.diagnosis}</p>
                            </div>
                            {selectedRecord.prescription && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Prescription</p>
                                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm">{selectedRecord.prescription}</p>
                                </div>
                            )}
                            {selectedRecord.notes && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Notes</p>
                                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm">{selectedRecord.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
