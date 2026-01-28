'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/useApi';
import Link from 'next/link';

interface Stats {
    totalPatients: number;
    totalDoctors: number;
    totalAppointments: number;
    pendingAppointments: number;
    approvedAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    todayAppointments: number;
}

interface RecentActivity {
    _id: string;
    patientId: { name: string };
    doctorId: { name: string; specialization: string };
    date: string;
    time: string;
    status: string;
    createdAt: string;
}

export default function AdminDashboard() {
    const { user } = useAuth();
    const { fetchWithAuth } = useApi();
    const [stats, setStats] = useState<Stats | null>(null);
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await fetchWithAuth('/api/admin/stats');
            setStats(data.stats);
            setRecentActivity(data.recentActivity);
        } catch (error) {
            console.error('Error loading stats:', error);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="animate-fadeIn">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                    Admin Dashboard 🛠️
                </h1>
                <p className="text-slate-400">Welcome back, {user?.name}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="stat-card">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center">
                            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs">Patients</p>
                            <p className="text-2xl font-bold text-white">{stats?.totalPatients || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500/20 to-sky-500/5 flex items-center justify-center">
                            <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs">Doctors</p>
                            <p className="text-2xl font-bold text-white">{stats?.totalDoctors || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-violet-500/5 flex items-center justify-center">
                            <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs">Total Appointments</p>
                            <p className="text-2xl font-bold text-white">{stats?.totalAppointments || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center">
                            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs">Pending</p>
                            <p className="text-2xl font-bold text-white">{stats?.pendingAppointments || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Appointment Breakdown */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
                <div className="glass-card p-4 flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <div>
                        <p className="text-slate-400 text-xs">Approved</p>
                        <p className="text-lg font-semibold text-white">{stats?.approvedAppointments || 0}</p>
                    </div>
                </div>
                <div className="glass-card p-4 flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-sky-400" />
                    <div>
                        <p className="text-slate-400 text-xs">Completed</p>
                        <p className="text-lg font-semibold text-white">{stats?.completedAppointments || 0}</p>
                    </div>
                </div>
                <div className="glass-card p-4 flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-slate-400" />
                    <div>
                        <p className="text-slate-400 text-xs">Cancelled</p>
                        <p className="text-lg font-semibold text-white">{stats?.cancelledAppointments || 0}</p>
                    </div>
                </div>
                <div className="glass-card p-4 flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-violet-400" />
                    <div>
                        <p className="text-slate-400 text-xs">Today</p>
                        <p className="text-lg font-semibold text-white">{stats?.todayAppointments || 0}</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Link href="/admin/users" className="glass-card p-6 hover:scale-[1.02] transition-transform group">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">Manage Users</h3>
                            <p className="text-slate-400 text-sm">View all doctors and patients</p>
                        </div>
                        <svg className="w-5 h-5 text-slate-400 ml-auto group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </Link>

                <Link href="/admin/appointments" className="glass-card p-6 hover:scale-[1.02] transition-transform group">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white group-hover:text-violet-400 transition-colors">All Appointments</h3>
                            <p className="text-slate-400 text-sm">View and manage appointments</p>
                        </div>
                        <svg className="w-5 h-5 text-slate-400 ml-auto group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </Link>
            </div>

            {/* Recent Activity */}
            <div className="glass-card p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Recent Activity</h2>

                {recentActivity.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">No recent activity</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Doctor</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentActivity.map((activity) => (
                                    <tr key={activity._id}>
                                        <td className="font-medium text-white">{activity.patientId?.name || 'N/A'}</td>
                                        <td className="text-slate-400">{activity.doctorId?.name || 'N/A'}</td>
                                        <td className="text-slate-400">{formatDate(activity.date)}</td>
                                        <td className="text-slate-400">{activity.time}</td>
                                        <td>
                                            <span className={`badge badge-${activity.status}`}>{activity.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
