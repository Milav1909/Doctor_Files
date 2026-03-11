'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    phone: string;
    createdAt: string;
}

export default function AdminUsersPage() {
    const { fetchWithAuth } = useApi();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    useEffect(() => { loadUsers(); }, []);

    const loadUsers = async () => {
        try {
            const data = await fetchWithAuth('/api/admin/users');
            setUsers(data.users || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await fetchWithAuth(`/api/admin/users/${id}`, { method: 'DELETE' });
            loadUsers();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const filtered = users
        .filter(u => filter === 'all' || u.role === filter)
        .filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

    const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const roleBadgeClass = (role: string) => {
        switch (role) {
            case 'patient': return 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
            case 'doctor': return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
            case 'admin': return 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800';
            default: return 'bg-[var(--bg-body)] text-[var(--text-secondary)] border-[var(--border-color)]';
        }
    };

    return (
        <div className="animate-fadeIn">
            <div className="mb-6">
                <h1 className="page-header">Manage Users</h1>
                <p className="page-subtitle">View and manage all system users</p>
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

            {loading ? (
                <div className="flex items-center justify-center h-40"><div className="spinner" /></div>
            ) : filtered.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <p className="text-[var(--text-muted)]">No users found</p>
                </div>
            ) : (
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
                                {filtered.map((user) => (
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
            )}
        </div>
    );
}
