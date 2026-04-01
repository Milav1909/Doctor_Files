'use client';

import { useEffect, useState, useCallback } from 'react';
import { useApi } from '@/hooks/useApi';
import { RefreshCw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    phone: string;
    createdAt: string;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

const ITEMS_PER_PAGE = 10;

export default function AdminUsersPage() {
    const { fetchWithAuth, isAuthReady } = useApi();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: ITEMS_PER_PAGE, total: 0, totalPages: 0 });
    const [error, setError] = useState<string | null>(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(timer);
    }, [search]);

    const loadUsers = useCallback(async (page = 1, isRefresh = false) => {
        if (!isAuthReady) return;
        if (isRefresh) setRefreshing(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                page: String(page),
                limit: String(ITEMS_PER_PAGE),
            });
            if (filter !== 'all') params.set('type', filter);
            if (debouncedSearch) params.set('search', debouncedSearch);

            const data = await fetchWithAuth(`/api/admin/users?${params.toString()}`);
            setUsers(data.users || []);
            setPagination(data.pagination || { page: 1, limit: ITEMS_PER_PAGE, total: 0, totalPages: 0 });
        } catch (err) {
            console.error('Error:', err);
            setError(err instanceof Error ? err.message : 'Failed to load users');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [isAuthReady, fetchWithAuth, filter, debouncedSearch]);

    useEffect(() => {
        if (isAuthReady) {
            setLoading(true);
            loadUsers(1);
        }
    }, [isAuthReady, filter, debouncedSearch, loadUsers]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await fetchWithAuth(`/api/admin/users/${id}`, { method: 'DELETE' });
            loadUsers(pagination.page, true);
        } catch (err) {
            console.error('Error:', err);
        }
    };

    const goToPage = (page: number) => {
        if (page < 1 || page > pagination.totalPages) return;
        setLoading(true);
        loadUsers(page);
    };

    const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const roleBadgeClass = (role: string) => {
        switch (role) {
            case 'patient': return 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
            case 'doctor': return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
            case 'admin': return 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800';
            default: return 'bg-[var(--bg-body)] text-[var(--text-secondary)] border-[var(--border-color)]';
        }
    };

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
                    <h1 className="page-header">Manage Users</h1>
                    <p className="page-subtitle">View and manage all system users</p>
                </div>
                <button
                    onClick={() => loadUsers(pagination.page, true)}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all duration-200 disabled:opacity-50"
                    title="Refresh data"
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <input type="text" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)}
                    className="input-field max-w-md" />
                <div className="flex gap-2 flex-wrap">
                    {['all', 'patient', 'doctor', 'admin'].map((r) => (
                        <button key={r} onClick={() => setFilter(r)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${filter === r ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800' : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-color)] hover:bg-[var(--bg-body)]'}`}>
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {(!isAuthReady || loading) ? (
                <div className="flex items-center justify-center h-40"><div className="spinner" /></div>
            ) : error ? (
                <div className="glass-card p-12 text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <button onClick={() => { setLoading(true); loadUsers(1); }} className="btn-primary">Retry</button>
                </div>
            ) : users.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <p className="text-[var(--text-muted)]">No users found</p>
                </div>
            ) : (
                <>
                    <div className="glass-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Joined</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user._id}>
                                            <td className="font-medium text-[var(--text-primary)]">{user.name}</td>
                                            <td className="text-[var(--text-secondary)]">{user.email}</td>
                                            <td>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${roleBadgeClass(user.role)}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="text-[var(--text-secondary)]">{formatDate(user.createdAt)}</td>
                                            <td>
                                                {user.role === 'patient' && (
                                                    <button onClick={() => handleDelete(user._id)} className="btn-danger text-xs">Delete</button>
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
                                Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
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
