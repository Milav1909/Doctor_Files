'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';

interface User {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: 'patient' | 'doctor' | 'admin';
    specialization?: string;
    gender?: string;
    createdAt: string;
}

export default function AdminUsersPage() {
    const { fetchWithAuth } = useApi();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState('');
    const [search, setSearch] = useState('');
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        loadUsers();
    }, [roleFilter]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            let url = '/api/admin/users?limit=100';
            if (roleFilter) url += `&type=${roleFilter}`;
            if (search) url += `&search=${encodeURIComponent(search)}`;

            const data = await fetchWithAuth(url);
            setUsers(data.users);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        loadUsers();
    };

    const handleDelete = async (userId: string, role: string) => {
        if (role === 'admin') {
            alert('Cannot delete admin users');
            return;
        }
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        setDeleting(userId);
        try {
            await fetchWithAuth(`/api/patients/${userId}`, { method: 'DELETE' });
            loadUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
        } finally {
            setDeleting(null);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getRoleBadgeClass = (role: string) => {
        switch (role) {
            case 'patient': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            case 'doctor': return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
            case 'admin': return 'bg-violet-500/20 text-violet-400 border-violet-500/30';
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    return (
        <div className="animate-fadeIn">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
                <p className="text-slate-400">View and manage all users in the system</p>
            </div>

            {/* Filters */}
            <div className="glass-card p-4 mb-6">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or email..."
                        className="input-field flex-1"
                    />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="select-field md:w-40"
                    >
                        <option value="">All Roles</option>
                        <option value="patient">Patients</option>
                        <option value="doctor">Doctors</option>
                        <option value="admin">Admins</option>
                    </select>
                    <button type="submit" className="btn-primary">
                        Search
                    </button>
                </form>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="spinner" />
                </div>
            ) : users.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <p className="text-slate-400">No users found</p>
                </div>
            ) : (
                <div className="glass-card overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Details</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user._id}>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${user.role === 'doctor' ? 'bg-sky-500/20' :
                                                    user.role === 'admin' ? 'bg-violet-500/20' : 'bg-emerald-500/20'
                                                }`}>
                                                <span className={`font-semibold ${user.role === 'doctor' ? 'text-sky-400' :
                                                        user.role === 'admin' ? 'text-violet-400' : 'text-emerald-400'
                                                    }`}>
                                                    {user.name.charAt(0)}
                                                </span>
                                            </div>
                                            <span className="font-medium text-white">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="text-slate-400">{user.email}</td>
                                    <td>
                                        <span className={`badge border ${getRoleBadgeClass(user.role)}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="text-slate-400 text-sm">
                                        {user.specialization && <span>{user.specialization}</span>}
                                        {user.gender && <span className="capitalize">{user.gender}</span>}
                                        {user.phone && <span>{user.phone}</span>}
                                    </td>
                                    <td className="text-slate-400">{formatDate(user.createdAt)}</td>
                                    <td>
                                        {user.role === 'patient' && (
                                            <button
                                                onClick={() => handleDelete(user._id, user.role)}
                                                disabled={deleting === user._id}
                                                className="text-red-400 hover:text-red-300 text-sm font-medium"
                                            >
                                                {deleting === user._id ? 'Deleting...' : 'Delete'}
                                            </button>
                                        )}
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
