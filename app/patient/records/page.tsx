'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';

interface MedicalRecord {
    _id: string;
    doctorId: { name: string; specialization: string };
    diagnosis: string;
    prescription: string;
    notes: string;
    createdAt: string;
}

export default function PatientRecordsPage() {
    const { fetchWithAuth } = useApi();
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

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
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="animate-fadeIn">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Medical Records</h1>
                <p className="text-slate-400">View your medical history and prescriptions</p>
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
                    <p className="text-slate-400">No medical records found</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {records.map((record) => (
                        <div
                            key={record._id}
                            className="glass-card p-6 cursor-pointer hover:scale-[1.01] transition-transform"
                            onClick={() => setSelectedRecord(record)}
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">{record.diagnosis}</h3>
                                            <p className="text-slate-400 text-sm">
                                                By {record.doctorId.name} • {record.doctorId.specialization}
                                            </p>
                                        </div>
                                        <span className="text-slate-500 text-sm">{formatDate(record.createdAt)}</span>
                                    </div>

                                    {record.prescription && (
                                        <p className="text-slate-400 text-sm mt-2 line-clamp-2">
                                            <span className="text-sky-400">Rx:</span> {record.prescription}
                                        </p>
                                    )}
                                </div>

                                <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Record Detail Modal */}
            {selectedRecord && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelectedRecord(null)}>
                    <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-white">Medical Record Details</h2>
                            <button onClick={() => setSelectedRecord(null)} className="text-slate-400 hover:text-white p-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-4 pb-4 border-b border-slate-700">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center">
                                    <span className="text-white text-xl font-bold">{selectedRecord.doctorId.name.charAt(0)}</span>
                                </div>
                                <div>
                                    <p className="font-semibold text-white">{selectedRecord.doctorId.name}</p>
                                    <p className="text-sky-400 text-sm">{selectedRecord.doctorId.specialization}</p>
                                    <p className="text-slate-500 text-sm">{formatDate(selectedRecord.createdAt)}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-slate-400 mb-2">Diagnosis</h3>
                                <p className="text-white bg-slate-800/50 rounded-lg p-4">{selectedRecord.diagnosis}</p>
                            </div>

                            {selectedRecord.prescription && (
                                <div>
                                    <h3 className="text-sm font-medium text-slate-400 mb-2">Prescription</h3>
                                    <p className="text-white bg-slate-800/50 rounded-lg p-4 whitespace-pre-wrap">{selectedRecord.prescription}</p>
                                </div>
                            )}

                            {selectedRecord.notes && (
                                <div>
                                    <h3 className="text-sm font-medium text-slate-400 mb-2">Notes</h3>
                                    <p className="text-white bg-slate-800/50 rounded-lg p-4 whitespace-pre-wrap">{selectedRecord.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
