'use client';

import { useEffect, useState, useCallback } from 'react';
import { useApi } from '@/hooks/useApi';
import { RefreshCw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface Appointment {
    _id: string;
    patientId: { name: string; email: string };
    doctorId: { name: string; specialization: string };
    date: string;
    time: string;
    status: string;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

const ITEMS_PER_PAGE = 10;

export default function AdminAppointmentsPage() {
    const { fetchWithAuth, isAuthReady } = useApi();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('all');
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: ITEMS_PER_PAGE, total: 0, totalPages: 0 });
    const [error, setError] = useState<string | null>(null);

    const loadAppointments = useCallback(async (page = 1, isRefresh = false) => {
        if (!isAuthReady) return;
        if (isRefresh) setRefreshing(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                page: String(page),
                limit: String(ITEMS_PER_PAGE),
            });
            if (filter !== 'all') params.set('status', filter);

            // Use /api/appointments which works for admin role too
            const data = await fetchWithAuth(`/api/appointments?${params.toString()}`);
            setAppointments(data.appointments || []);
            setPagination(data.pagination || { page: 1, limit: ITEMS_PER_PAGE, total: 0, totalPages: 0 });
        } catch (err) {
            console.error('Error:', err);
            setError(err instanceof Error ? err.message : 'Failed to load appointments');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [isAuthReady, fetchWithAuth, filter]);

    useEffect(() => {
        if (isAuthReady) {
            setLoading(true);
            loadAppointments(1);
        }
    }, [isAuthReady, filter, loadAppointments]);

    const handleCancel = async (id: string) => {
        try {
            await fetchWithAuth(`/api/appointments/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'cancelled' }) });
            loadAppointments(pagination.page, true);
        } catch (err) {
            console.error('Error:', err);
        }
    };

    const goToPage = (page: number) => {
        if (page < 1 || page > pagination.totalPages) return;
        setLoading(true);
        loadAppointments(page);
    };

    const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const total = pagination.totalPages;
        const current = pagination.page;

        if (total <= 7) {
            for (let i = 1; i <= total; i++) pages.push(i);
        } else {
            pages.push(1);
            if (current > 3) pages.push('...');
            for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
                pages.push(i);
            }
            if (current < total - 2) pages.push('...');
            pages.push(total);
        }
        return pages;
    };

    return (
        <div className="animate-fadeIn">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="page-header">All Appointments</h1>
                    <p className="page-subtitle">View and manage all system appointments</p>
                </div>
                <button
                    onClick={() => loadAppointments(pagination.page, true)}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all duration-200 disabled:opacity-50"
                    title="Refresh data"
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            <div className="flex gap-2 mb-6 flex-wrap">
                {['all', 'pending', 'approved', 'completed', 'rejected', 'cancelled'].map((s) => (
                    <button key={s} onClick={() => setFilter(s)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${filter === s ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800' : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-color)] hover:bg-[var(--bg-body)]'}`}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                ))}
            </div>

            {(!isAuthReady || loading) ? (
                <div className="flex items-center justify-center h-40"><div className="spinner" /></div>
            ) : error ? (
                <div className="glass-card p-12 text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <button onClick={() => { setLoading(true); loadAppointments(1); }} className="btn-primary">Retry</button>
                </div>
            ) : appointments.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-[var(--text-muted)]">No appointments found</p>
                </div>
            ) : (
                <>
                    <div className="glass-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Patient</th>
                                        <th>Doctor</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.map((apt) => (
                                        <tr key={apt._id}>
                                            <td>
                                                <p className="font-medium text-[var(--text-primary)]">{apt.patientId?.name || 'N/A'}</p>
                                                <p className="text-sm text-[var(--text-secondary)]">{apt.patientId?.email || ''}</p>
                                            </td>
                                            <td>
                                                <p className="font-medium text-[var(--text-primary)]">{apt.doctorId?.name || 'N/A'}</p>
                                                <p className="text-sm text-[var(--text-secondary)]">{apt.doctorId?.specialization || ''}</p>
                                            </td>
                                            <td className="text-[var(--text-secondary)]">{formatDate(apt.date)}</td>
                                            <td className="text-[var(--text-secondary)]">{apt.time}</td>
                                            <td><span className={`badge badge-${apt.status}`}>{apt.status}</span></td>
                                            <td>
                                                {!['cancelled', 'completed', 'rejected'].includes(apt.status) && (
                                                    <button onClick={() => handleCancel(apt._id)} className="btn-danger text-xs">Cancel</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
                            <p className="text-sm text-[var(--text-muted)]">
                                Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} appointments
                            </p>
                            <div className="flex items-center gap-1">
                                <button onClick={() => goToPage(1)} disabled={pagination.page === 1}
                                    className="p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all disabled:opacity-30 disabled:pointer-events-none">
                                    <ChevronsLeft className="w-4 h-4" />
                                </button>
                                <button onClick={() => goToPage(pagination.page - 1)} disabled={pagination.page === 1}
                                    className="p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all disabled:opacity-30 disabled:pointer-events-none">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>

                                {getPageNumbers().map((p, i) =>
                                    typeof p === 'string' ? (
                                        <span key={`ellipsis-${i}`} className="px-2 text-[var(--text-muted)]">…</span>
                                    ) : (
                                        <button key={p} onClick={() => goToPage(p)}
                                            className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${p === pagination.page
                                                ? 'bg-[var(--primary)] text-white shadow-sm'
                                                : 'border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--primary)] hover:border-[var(--primary)]'
                                                }`}>
                                            {p}
                                        </button>
                                    )
                                )}

                                <button onClick={() => goToPage(pagination.page + 1)} disabled={pagination.page === pagination.totalPages}
                                    className="p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all disabled:opacity-30 disabled:pointer-events-none">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                                <button onClick={() => goToPage(pagination.totalPages)} disabled={pagination.page === pagination.totalPages}
                                    className="p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all disabled:opacity-30 disabled:pointer-events-none">
                                    <ChevronsRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
