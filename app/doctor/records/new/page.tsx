'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApi } from '@/hooks/useApi';

interface Patient {
    _id: string;
    name: string;
    email: string;
}

function NewRecordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { fetchWithAuth } = useApi();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        patientId: searchParams.get('patientId') || '',
        diagnosis: '',
        prescription: '',
        notes: ''
    });

    useEffect(() => {
        loadPatients();
    }, []);

    const loadPatients = async () => {
        try {
            const data = await fetchWithAuth('/api/patients?limit=100');
            setPatients(data.patients);
        } catch (error) {
            console.error('Error loading patients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            await fetchWithAuth('/api/medical-records', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            router.push('/doctor/records');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create record');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto animate-fadeIn">
            <div className="mb-8">
                <button onClick={() => router.back()} className="text-slate-400 hover:text-white flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>
                <h1 className="text-3xl font-bold text-white mb-2">New Medical Record</h1>
                <p className="text-slate-400">Create a new medical record for a patient</p>
            </div>

            <div className="glass-card p-6">
                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="form-label">Patient</label>
                        <select
                            value={formData.patientId}
                            onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                            className="select-field"
                            required
                        >
                            <option value="">Select a patient</option>
                            {patients.map((patient) => (
                                <option key={patient._id} value={patient._id}>
                                    {patient.name} ({patient.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="form-label">Diagnosis</label>
                        <input
                            type="text"
                            value={formData.diagnosis}
                            onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                            className="input-field"
                            placeholder="Enter diagnosis..."
                            required
                        />
                    </div>

                    <div>
                        <label className="form-label">Prescription</label>
                        <textarea
                            value={formData.prescription}
                            onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
                            className="input-field min-h-[100px] resize-none"
                            placeholder="Enter prescription details..."
                        />
                    </div>

                    <div>
                        <label className="form-label">Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="input-field min-h-[100px] resize-none"
                            placeholder="Additional notes..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Creating...
                            </>
                        ) : (
                            'Create Record'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function NewRecordPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-64">
                <div className="spinner" />
            </div>
        }>
            <NewRecordForm />
        </Suspense>
    );
}
